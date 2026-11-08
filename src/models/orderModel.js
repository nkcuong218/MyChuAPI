import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS, ORDER_STATUS } from '~/utils/constants'

// Dinh nghia Collection Name
const COLLECTION_NAME = DATABASE_COLLECTIONS.ORDERS

// Dinh nghia toan bo Schema cua Order Model
const COLLECTION_SCHEMA = Joi.object({
  id: Joi.string().required().trim().strict(),
  userId: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null),
  customer: Joi.object({
    name: Joi.string().optional().allow('').default(''),
    phone: Joi.string().optional().allow('').default(''),
    email: Joi.string().optional().allow('').default(''),
    address: Joi.string().optional().allow('').default('')
  }).default({}),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
        name: Joi.string().required(),
        image: Joi.string().optional().allow('').default(''),
        price: Joi.number().required().min(0),
        quantity: Joi.number().integer().required().min(1)
      })
    )
    .min(1)
    .required(),
  subtotal: Joi.number().required().min(0),
  shippingFee: Joi.number().default(0).min(0),
  discount: Joi.number().default(0).min(0),
  voucherCode: Joi.string().optional().allow('').default(''),
  total: Joi.number().required().min(0),
  payment: Joi.string().default('Thanh toán khi nhận hàng'),
  status: Joi.string()
    .valid(...Object.values(ORDER_STATUS))
    .default(ORDER_STATUS.PENDING),
  note: Joi.string().optional().allow('').default(''),
  adminNote: Joi.string().optional().allow('').default(''),
  date: Joi.string().default(() => new Date().toISOString()),
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
  return { id: String(id) }
}

const createNew = async (data) => {
  try {
    const rawData = {
      ...data,
      id: data.id || `MC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 900) + 100)}`,
      status: data.status || ORDER_STATUS.PENDING,
      payment: data.payment || 'Thanh toán khi nhận hàng',
      shippingFee: Number(data.shippingFee) || 0,
      discount: Number(data.discount) || 0,
      subtotal: Number(data.subtotal) || 0,
      total: Number(data.total) || 0,
      voucherCode: data.voucherCode || '',
      note: data.note || '',
      adminNote: data.adminNote || '',
      date: data.date || new Date().toISOString()
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

const getAll = async ({ status, userId, search, page = 1, limit = 50 } = {}) => {
  try {
    const filter = { _destroy: false }

    if (status && status !== 'all') {
      filter.status = status
    }

    if (userId) {
      filter.userId = Number(userId) || userId
    }

    if (search && search.trim() !== '') {
      const keyword = search.trim()
      filter.$or = [
        { id: { $regex: keyword, $options: 'i' } },
        { 'customer.name': { $regex: keyword, $options: 'i' } },
        { 'customer.phone': { $regex: keyword, $options: 'i' } },
        { 'customer.email': { $regex: keyword, $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const cursor = GET_DB()
      .collection(COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const [orders, total] = await Promise.all([
      cursor.toArray(),
      GET_DB().collection(COLLECTION_NAME).countDocuments(filter)
    ])

    return {
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateStatus = async (id, status, adminNote) => {
  try {
    const query = buildIdQuery(id)
    const updateDoc = {
      $set: {
        status,
        updatedAt: Date.now()
      }
    }
    if (adminNote !== undefined) {
      updateDoc.$set.adminNote = adminNote
    }

    return await GET_DB().collection(COLLECTION_NAME).findOneAndUpdate(
      query,
      updateDoc,
      { returnDocument: 'after' }
    )
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

export const orderModel = {
  COLLECTION_NAME,
  COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getAll,
  updateStatus,
  update
}
