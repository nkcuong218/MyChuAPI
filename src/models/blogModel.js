import Joi from 'joi'
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
  name: Joi.string().required().trim().strict(),
  city: Joi.string().optional().allow('').default(''),
  review: Joi.string().required().trim().strict(),
  rate: Joi.number().min(1).max(5).default(5),
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

const getReviews = async () => {
  try {
    return await GET_DB().collection(COLLECTION_REVIEWS).find({}).toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const createReview = async (data) => {
  try {
    const validData = await validateReviewBeforeCreate(data)
    const result = await GET_DB().collection(COLLECTION_REVIEWS).insertOne(validData)
    return { ...validData, _id: result.insertedId }
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
  createReview
}
