import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS, USER_ROLES } from '~/utils/constants'

// Dinh nghia Collection Name
const COLLECTION_NAME = DATABASE_COLLECTIONS.USERS

// Dinh nghia toan bo Schema cua User Model
const COLLECTION_SCHEMA = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().required().min(2).max(100).trim().strict(),
  email: Joi.string().email().required().trim().strict(),
  password: Joi.string().required(),
  phone: Joi.string().optional().allow('').default(''),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .default(USER_ROLES.CUSTOMER),
  status: Joi.string().valid('active', 'locked').default('active'),
  address: Joi.string().optional().allow('').default(''),
  addresses: Joi.array().default([]),
  joinedAt: Joi.string().default(() => new Date().toISOString().slice(0, 10)),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const buildIdQuery = (id) => {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === String(id)) {
    return { _id: new ObjectId(id) }
  }
  return { id: Number(id) || id }
}

const createNew = async (data) => {
  try {
    const rawData = {
      ...data,
      id: Number(data.id) || Date.now(),
      role: data.role || USER_ROLES.CUSTOMER,
      status: data.status || 'active',
      joinedAt: data.joinedAt || new Date().toISOString().slice(0, 10)
    }

    const validData = await validateBeforeCreate(rawData)
    const result = await GET_DB().collection(COLLECTION_NAME).insertOne(validData)
    return { ...validData, _id: result.insertedId }
  } catch (error) {
    throw new Error(error)
  }
}

const findByEmail = async (email) => {
  try {
    return await GET_DB().collection(COLLECTION_NAME).findOne({
      email: { $regex: `^${email.trim()}$`, $options: 'i' },
      _destroy: false
    })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const query = buildIdQuery(id)
    return await GET_DB().collection(COLLECTION_NAME).findOne({ ...query, _destroy: false })
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async ({ role, status, search, page = 1, limit = 50 } = {}) => {
  try {
    const filter = { _destroy: false }

    if (role && role !== 'all') {
      filter.role = role
    }

    if (status && status !== 'all') {
      filter.status = status
    }

    if (search && search.trim() !== '') {
      const keyword = search.trim()
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const cursor = GET_DB()
      .collection(COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const [users, total] = await Promise.all([
      cursor.toArray(),
      GET_DB().collection(COLLECTION_NAME).countDocuments(filter)
    ])

    return {
      users,
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

    INVALID_UPDATE_FIELDS.forEach((field) => delete dataToUpdate[field])
    dataToUpdate.updatedAt = Date.now()

    return await GET_DB().collection(COLLECTION_NAME).findOneAndUpdate(
      query,
      { $set: dataToUpdate },
      { returnDocument: 'after' }
    )
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  COLLECTION_NAME,
  COLLECTION_SCHEMA,
  createNew,
  findByEmail,
  findOneById,
  getAll,
  update
}
