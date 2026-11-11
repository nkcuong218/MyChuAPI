import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { DATABASE_COLLECTIONS, ORDER_STATUS } from '~/utils/constants'

// Dinh nghia Collection Name
const COLLECTION_NAME = DATABASE_COLLECTIONS.ORDERS

// Dinh nghia toan bo Schema cua Order Model
const COLLECTION_SCHEMA = Joi.object({
  id: Joi.string().required().trim().strict(),
  userId: Joi.alternatives().try(
    Joi.object().instance(ObjectId),
    Joi.string(),
    Joi.number()
  ).optional().allow(null),
  customer: Joi.object({
    name: Joi.string().optional().allow('').default(''),
    phone: Joi.string().optional().allow('').default(''),
    email: Joi.string().optional().allow('').default(''),
    address: Joi.string().optional().allow('').default('')
  }).default({}),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.alternatives().try(
          Joi.object().instance(ObjectId),
          Joi.string(),
          Joi.number()
        ).required(),
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

const resolveUserObjectId = async (inputUserId, customerEmail) => {
  if (inputUserId) {
    if (inputUserId instanceof ObjectId) return inputUserId
    const strId = String(inputUserId).trim()
    if (ObjectId.isValid(strId) && String(new ObjectId(strId)) === strId) {
      return new ObjectId(strId)
    }
    try {
      const user = await GET_DB().collection(DATABASE_COLLECTIONS.USERS).findOne({
        $or: [
          { id: Number(inputUserId) || inputUserId },
          { id: strId }
        ]
      })
      if (user?._id) return user._id
    } catch {}
  }

  // Fallback: Neu userId khong duoc truyen hoac khong tim thay, tim user theo customer.email
  if (customerEmail && typeof customerEmail === 'string' && customerEmail.trim() !== '') {
    try {
      const user = await GET_DB().collection(DATABASE_COLLECTIONS.USERS).findOne({
        email: { $regex: `^${customerEmail.trim()}$`, $options: 'i' },
        _destroy: false
      })
      if (user?._id) return user._id
    } catch {}
  }

  return null
}

const resolveProductObjectId = async (inputProductId) => {
  if (!inputProductId) return null
  if (inputProductId instanceof ObjectId) return inputProductId
  const strId = String(inputProductId).trim()
  if (ObjectId.isValid(strId) && String(new ObjectId(strId)) === strId) {
    return new ObjectId(strId)
  }
  try {
    const product = await GET_DB().collection(DATABASE_COLLECTIONS.PRODUCTS).findOne({
      $or: [
        { id: Number(inputProductId) || inputProductId },
        { id: strId },
        { sku: strId }
      ]
    })
    if (product?._id) return product._id
  } catch {}
  return null
}

const migrateLegacyOrders = async () => {
  try {
    const db = GET_DB()
    const legacyOrders = await db.collection(COLLECTION_NAME).find({
      $or: [
        { userId: { $type: 'string' } },
        { userId: { $type: 'number' } },
        { userId: null },
        { 'items.productId': { $type: 'string' } },
        { 'items.productId': { $type: 'number' } }
      ]
    }).toArray()

    if (!legacyOrders || legacyOrders.length === 0) return

    for (const order of legacyOrders) {
      const updateFields = {}
      if (!order.userId || !(order.userId instanceof ObjectId)) {
        const resolvedUserId = await resolveUserObjectId(order.userId, order.customer?.email)
        if (resolvedUserId) {
          updateFields.userId = resolvedUserId
        }
      }

      if (Array.isArray(order.items)) {
        let changed = false
        const updatedItems = await Promise.all(
          order.items.map(async (item) => {
            if (item.productId && !(item.productId instanceof ObjectId)) {
              changed = true
              let resolvedPId = await resolveProductObjectId(item.productId)
              if (!resolvedPId && ObjectId.isValid(item.productId)) {
                resolvedPId = new ObjectId(item.productId)
              }
              return {
                ...item,
                productId: resolvedPId || item.productId
              }
            }
            return item
          })
        )
        if (changed) {
          updateFields.items = updatedItems
        }
      }

      if (Object.keys(updateFields).length > 0) {
        await db.collection(COLLECTION_NAME).updateOne(
          { _id: order._id },
          { $set: updateFields }
        )
      }
    }
  } catch (err) {
    console.error('migrateLegacyOrders error:', err)
  }
}

const createNew = async (data) => {
  try {
    const userObjectId = await resolveUserObjectId(data.userId, data.customer?.email)

    const resolvedItems = await Promise.all(
      (data.items || []).map(async (item) => {
        let pId = await resolveProductObjectId(item.productId)
        if (!pId) {
          pId = (item.productId && ObjectId.isValid(item.productId))
            ? new ObjectId(item.productId)
            : new ObjectId()
        }
        return {
          ...item,
          productId: pId,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1
        }
      })
    )

    const rawData = {
      ...data,
      id: data.id || `MC${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(Math.random() * 900) + 100)}`,
      userId: userObjectId,
      items: resolvedItems,
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
    await migrateLegacyOrders()

    const filter = { _destroy: false }

    if (status && status !== 'all') {
      filter.status = status
    }

    if (userId) {
      const orConditions = []
      if (ObjectId.isValid(userId) && String(new ObjectId(userId)) === String(userId)) {
        orConditions.push({ userId: new ObjectId(userId) })
      }
      orConditions.push({ userId: String(userId) })
      if (!isNaN(Number(userId))) {
        orConditions.push({ userId: Number(userId) })
        const u = await GET_DB().collection(DATABASE_COLLECTIONS.USERS).findOne({ id: Number(userId) })
        if (u?._id) orConditions.push({ userId: u._id })
      }
      filter.$or = orConditions
    }

    if (search && search.trim() !== '') {
      const keyword = search.trim()
      const searchCondition = [
        { id: { $regex: keyword, $options: 'i' } },
        { 'customer.name': { $regex: keyword, $options: 'i' } },
        { 'customer.phone': { $regex: keyword, $options: 'i' } },
        { 'customer.email': { $regex: keyword, $options: 'i' } }
      ]
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchCondition }]
        delete filter.$or
      } else {
        filter.$or = searchCondition
      }
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
