import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS } from '~/utils/constants'

// Dinh nghia Collection Name
const COLLECTION_NAME = DATABASE_COLLECTIONS.CATEGORIES

// Dinh nghia toan bo Schema cua Category Model
const COLLECTION_SCHEMA = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().required().min(2).max(100).trim().strict(),
  count: Joi.number().integer().min(0).default(0),
  image: Joi.string().optional().allow('').default(''),
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
      count: Number(data.count) || 0
    }

    const validData = await validateBeforeCreate(rawData)
    const result = await GET_DB().collection(COLLECTION_NAME).insertOne(validData)
    return { ...validData, _id: result.insertedId }
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    return await GET_DB().collection(COLLECTION_NAME).find({ _destroy: false }).toArray()
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

const deleteOne = async (id) => {
  try {
    const query = buildIdQuery(id)
    return await GET_DB().collection(COLLECTION_NAME).deleteOne(query)
  } catch (error) {
    throw new Error(error)
  }
}

export const categoryModel = {
  COLLECTION_NAME,
  COLLECTION_SCHEMA,
  createNew,
  getAll,
  findOneById,
  update,
  deleteOne
}
