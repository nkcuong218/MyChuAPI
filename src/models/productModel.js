import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS } from '~/utils/constants'

// Dinh nghia Collection Name
const COLLECTION_NAME = DATABASE_COLLECTIONS.PRODUCTS

// Dinh nghia toan bo Schema cua Product Model
const COLLECTION_SCHEMA = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().required().min(2).max(255).trim().strict(),
  sku: Joi.string().required().trim().strict(),
  category: Joi.string().required().trim().strict(),
  description: Joi.string().optional().allow('').default(''),
  price: Joi.number().required().min(0),
  originalPrice: Joi.number().min(0).optional().allow(null),
  stock: Joi.number().integer().min(0).default(0),
  image: Joi.string().optional().allow('').default(''),
  visible: Joi.boolean().default(true),
  rate: Joi.number().min(0).max(5).default(5),
  rateNum: Joi.number().integer().min(0).default(0),
  sold: Joi.number().integer().min(0).default(0),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Cac truong khong duoc phep cap nhat
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

// Ham validate toan bo du lieu truoc khi insert vao Database
const validateBeforeCreate = async (data) => {
  return await COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const buildIdQuery = (id) => {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === String(id)) {
    return { _id: new ObjectId(id) }
  }
  return { $or: [{ id: Number(id) || id }, { sku: String(id) }] }
}

const createNew = async (data) => {
  try {
    const rawData = {
      ...data,
      id: Number(data.id) || Date.now(),
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      stock: Number(data.stock) >= 0 ? Number(data.stock) : 0,
      visible: data.visible !== false,
      rate: Number(data.rate) || 5,
      rateNum: Number(data.rateNum) || 0,
      sold: Number(data.sold) || 0
    }

    const validData = await validateBeforeCreate(rawData)
    const result = await GET_DB().collection(COLLECTION_NAME).insertOne(validData)
    return { ...validData, _id: result.insertedId }
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const query = buildIdQuery(id)
    return await GET_DB().collection(COLLECTION_NAME).findOne(query)
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async ({ category, minPrice, maxPrice, search, sort = 'newest', page = 1, limit = 50, visible } = {}) => {
  try {
    const filter = { _destroy: false }

    if (category && category !== 'all') {
      filter.category = category
    }

    if (visible !== undefined && visible !== 'all') {
      filter.visible = visible === 'true' || visible === true
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {}
      if (minPrice !== undefined && !isNaN(minPrice)) filter.price.$gte = Number(minPrice)
      if (maxPrice !== undefined && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice)
    }

    if (search && search.trim() !== '') {
      const keyword = search.trim()
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { sku: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'priceLow') sortOption = { price: 1 }
    if (sort === 'priceHigh') sortOption = { price: -1 }
    if (sort === 'bestSelling') sortOption = { sold: -1 }
    if (sort === 'newest') sortOption = { createdAt: -1 }

    const skip = (Number(page) - 1) * Number(limit)
    const cursor = GET_DB()
      .collection(COLLECTION_NAME)
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))

    const [products, total] = await Promise.all([
      cursor.toArray(),
      GET_DB().collection(COLLECTION_NAME).countDocuments(filter)
    ])

    return {
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    }
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, updateData) => {
  try {
    const query = buildIdQuery(id)
    const dataToUpdate = { ...updateData }

    // Loai bo cac field khong duoc phep update
    INVALID_UPDATE_FIELDS.forEach((field) => delete dataToUpdate[field])

    dataToUpdate.updatedAt = Date.now()

    const result = await GET_DB().collection(COLLECTION_NAME).findOneAndUpdate(
      query,
      { $set: dataToUpdate },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateStock = async (id, quantitySold) => {
  try {
    const query = buildIdQuery(id)
    return await GET_DB().collection(COLLECTION_NAME).updateOne(
      query,
      {
        $inc: { stock: -Number(quantitySold), sold: Number(quantitySold) },
        $set: { updatedAt: Date.now() }
      }
    )
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOne = async (id) => {
  try {
    const query = buildIdQuery(id)
    return await GET_DB().collection(COLLECTION_NAME).deleteOne(query)
  } catch (error) {
    throw new Error(error)
  }
}

export const productModel = {
  COLLECTION_NAME,
  COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getAll,
  update,
  updateStock,
  deleteOne
}
