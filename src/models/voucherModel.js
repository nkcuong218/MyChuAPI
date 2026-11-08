import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS } from '~/utils/constants'

// Dinh nghia Collection Name
const COLLECTION_NAME = DATABASE_COLLECTIONS.VOUCHERS

// Dinh nghia toan bo Schema cua Voucher Model
const COLLECTION_SCHEMA = Joi.object({
  id: Joi.number().integer().required(),
  code: Joi.string().required().trim().strict().uppercase(),
  title: Joi.string().required().trim().strict(),
  type: Joi.string().valid('percent', 'fixed', 'shipping').required(),
  value: Joi.number().required().min(1),
  maxDiscount: Joi.number().min(0).optional().allow(null).default(null),
  minOrder: Joi.number().min(0).default(0),
  quantity: Joi.number().integer().min(1).default(100),
  used: Joi.number().integer().min(0).default(0),
  startDate: Joi.string().optional().allow('').default(''),
  endDate: Joi.string().optional().allow('').default(''),
  active: Joi.boolean().default(true),
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
      code: String(data.code).trim().toUpperCase(),
      value: Number(data.value),
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      minOrder: Number(data.minOrder) || 0,
      quantity: Number(data.quantity) || 100,
      used: Number(data.used) || 0,
      active: data.active !== false
    }

    const validData = await validateBeforeCreate(rawData)
    const result = await GET_DB().collection(COLLECTION_NAME).insertOne(validData)
    return { ...validData, _id: result.insertedId }
  } catch (error) {
    throw new Error(error)
  }
}

const findByCode = async (code) => {
  try {
    return await GET_DB().collection(COLLECTION_NAME).findOne({
      code: String(code).trim().toUpperCase(),
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

const getAll = async ({ active, search } = {}) => {
  try {
    const filter = { _destroy: false }

    if (active !== undefined && active !== 'all') {
      filter.active = active === 'true' || active === true
    }

    if (search && search.trim() !== '') {
      const keyword = search.trim()
      filter.$or = [
        { code: { $regex: keyword, $options: 'i' } },
        { title: { $regex: keyword, $options: 'i' } }
      ]
    }

    return await GET_DB()
      .collection(COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, updateData) => {
  try {
    const query = buildIdQuery(id)
    const dataToUpdate = { ...updateData }

    INVALID_UPDATE_FIELDS.forEach((field) => delete dataToUpdate[field])

    if (dataToUpdate.code) {
      dataToUpdate.code = String(dataToUpdate.code).trim().toUpperCase()
    }
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

const incrementUsed = async (code) => {
  try {
    return await GET_DB().collection(COLLECTION_NAME).updateOne(
      { code: String(code).trim().toUpperCase() },
      { $inc: { used: 1 }, $set: { updatedAt: Date.now() } }
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

export const voucherModel = {
  COLLECTION_NAME,
  COLLECTION_SCHEMA,
  createNew,
  findByCode,
  findOneById,
  getAll,
  update,
  incrementUsed,
  deleteOne
}
