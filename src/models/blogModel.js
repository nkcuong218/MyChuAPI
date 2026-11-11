import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS } from '~/utils/constants'

const COLLECTION_BLOGS = DATABASE_COLLECTIONS.BLOGS
const COLLECTION_REVIEWS = DATABASE_COLLECTIONS.REVIEWS

const BLOG_SCHEMA = Joi.object({
  slug: Joi.string().required().trim().strict(),
  title: Joi.string().required().trim().strict(),
  excerpt: Joi.string().optional().allow('').default(''),
  category: Joi.string().default('Kiến thức'),
  date: Joi.string().default(() => new Date().toISOString().slice(0, 10)),
  readTime: Joi.number().integer().min(1).default(5),
  image: Joi.string().optional().allow('').default(''),
  content: Joi.array().default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const REVIEW_SCHEMA = Joi.object({
  productId: Joi.alternatives().try(
    Joi.object().instance(ObjectId),
    Joi.string(),
    Joi.number()
  ).optional().allow(null),
  name: Joi.string().required().trim().strict(),
  city: Joi.string().optional().allow('').default(''),
  review: Joi.string().required().trim().strict(),
  rate: Joi.number().min(1).max(5).default(5),
  date: Joi.string().optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBlogBeforeCreate = async (data) => {
  return await BLOG_SCHEMA.validateAsync(data, { abortEarly: false })
}

const validateReviewBeforeCreate = async (data) => {
  return await REVIEW_SCHEMA.validateAsync(data, { abortEarly: false })
}

const getAll = async ({ category, search } = {}) => {
  try {
    const filter = { _destroy: false }
    if (category && category !== 'all') {
      filter.category = category
    }
    if (search && search.trim() !== '') {
      const keyword = search.trim()
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { excerpt: { $regex: keyword, $options: 'i' } }
      ]
    }
    return await GET_DB().collection(COLLECTION_BLOGS).find(filter).sort({ createdAt: -1 }).toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const findBySlug = async (slug) => {
  try {
    return await GET_DB().collection(COLLECTION_BLOGS).findOne({ slug, _destroy: false })
  } catch (error) {
    throw new Error(error)
  }
}

const createNew = async (data) => {
  try {
    const validData = await validateBlogBeforeCreate(data)
    const result = await GET_DB().collection(COLLECTION_BLOGS).insertOne(validData)
    return { ...validData, _id: result.insertedId }
  } catch (error) {
    throw new Error(error)
  }
}

const syncProductRating = async (productId) => {
  if (!productId) return
  try {
    const db = GET_DB()
    const pStr = String(productId)
    const orConds = []
    if (ObjectId.isValid(pStr)) {
      orConds.push({ productId: new ObjectId(pStr) }, { productId: pStr })
    } else {
      orConds.push({ productId: pStr })
    }

    const reviews = await db.collection(COLLECTION_REVIEWS).find({ $or: orConds }).toArray()
    const rateNum = reviews.length
    const rate = rateNum > 0
      ? Number((reviews.reduce((sum, r) => sum + (Number(r.rate) || 5), 0) / rateNum).toFixed(1))
      : 5

    let pQuery = null
    if (ObjectId.isValid(pStr)) {
      pQuery = { _id: new ObjectId(pStr) }
    } else {
      pQuery = { id: Number(pStr) || pStr }
    }
    await db.collection(DATABASE_COLLECTIONS.PRODUCTS).updateOne(pQuery, { $set: { rate, rateNum } })
  } catch {}
}

const getReviews = async (productId) => {
  try {
    const db = GET_DB()

    // Chuyen doi cac danh gia cu co productId la chuoi hoac so sang dung kieu ObjectId cua san pham
    try {
      const allProducts = await db.collection(DATABASE_COLLECTIONS.PRODUCTS).find({}).toArray()
      for (const prod of allProducts) {
        if (prod?._id) {
          const prodObjectId = new ObjectId(prod._id)
          const legacyConditions = [
            { productId: String(prod._id) }
          ]
          if (prod.id !== undefined && prod.id !== null) {
            legacyConditions.push(
              { productId: prod.id },
              { productId: String(prod.id) }
            )
          }
          await db.collection(COLLECTION_REVIEWS).updateMany(
            {
              $or: legacyConditions,
              productId: { $not: { $type: 'objectId' } }
            },
            { $set: { productId: prodObjectId } }
          )
        }
      }
    } catch {}

    const query = {}
    if (productId !== undefined && productId !== null && productId !== '') {
      let targetProduct = null
      const pStr = String(productId).trim()

      if (ObjectId.isValid(pStr) && String(new ObjectId(pStr)) === pStr) {
        targetProduct = await db.collection(DATABASE_COLLECTIONS.PRODUCTS).findOne({ _id: new ObjectId(pStr) })
      }
      if (!targetProduct) {
        targetProduct = await db.collection(DATABASE_COLLECTIONS.PRODUCTS).findOne({
          $or: [
            { id: Number(productId) || productId },
            { id: pStr },
            { sku: pStr }
          ]
        })
      }

      if (targetProduct) {
        const orConditions = [
          { productId: new ObjectId(targetProduct._id) },
          { productId: String(targetProduct._id) }
        ]
        if (targetProduct.id !== undefined && targetProduct.id !== null) {
          orConditions.push(
            { productId: targetProduct.id },
            { productId: String(targetProduct.id) }
          )
        }
        query.$or = orConditions
      } else {
        const orConditions = []
        if (ObjectId.isValid(pStr)) {
          orConditions.push(
            { productId: new ObjectId(pStr) },
            { productId: pStr }
          )
        }
        orConditions.push({ productId: pStr })
        if (!isNaN(Number(pStr))) {
          orConditions.push({ productId: Number(pStr) })
        }
        query.$or = orConditions
      }
    }

    const reviews = await db.collection(COLLECTION_REVIEWS).find(query).sort({ createdAt: -1 }).toArray()
    return reviews.map((r) => ({
      ...r,
      _id: String(r._id),
      productId: r.productId ? String(r.productId) : ''
    }))
  } catch (error) {
    throw new Error(error)
  }
}

const deleteReview = async (id) => {
  try {
    let query = { id: id }
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id: id }] }
    }
    const db = GET_DB()
    const target = await db.collection(COLLECTION_REVIEWS).findOne(query)
    const result = await db.collection(COLLECTION_REVIEWS).deleteOne(query)
    if (target?.productId) {
      await syncProductRating(target.productId)
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createReview = async (data) => {
  try {
    const db = GET_DB()

    let finalProductId = null
    const inputPId = data.productId ? String(data.productId).trim() : ''

    if (inputPId) {
      if (ObjectId.isValid(inputPId)) {
        finalProductId = new ObjectId(inputPId)
      } else if (!Number.isNaN(Number(inputPId))) {
        // Neu truyen vao la so, tim product de lay _id ObjectId
        const found = await db.collection(DATABASE_COLLECTIONS.PRODUCTS).findOne({ id: Number(inputPId) })
        if (found?._id) finalProductId = new ObjectId(found._id)
      }
    }

    const rawData = {
      ...data,
      productId: finalProductId // Luu kieu ObjectId thuc su trong MongoDB
    }
    const validData = await validateReviewBeforeCreate(rawData)
    const result = await db.collection(COLLECTION_REVIEWS).insertOne(validData)
    const inserted = { ...validData, _id: result.insertedId }
    if (inserted.productId) {
      await syncProductRating(inserted.productId)
    }
    return inserted
  } catch (error) {
    throw new Error(error)
  }
}

export const blogModel = {
  COLLECTION_BLOGS,
  COLLECTION_REVIEWS,
  BLOG_SCHEMA,
  REVIEW_SCHEMA,
  getAll,
  findBySlug,
  createNew,
  getReviews,
  deleteReview,
  createReview
}
