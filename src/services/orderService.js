import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { voucherModel } from '~/models/voucherModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes, ORDER_STATUS } from '~/utils/constants'

const createNew = async (reqBody) => {
  try {
    const { items, voucherCode, shippingFee = 30000, customer, userId, payment, note } = reqBody

    if (!items || !items.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn hàng phải có ít nhất một sản phẩm!')
    }

    // Verify products and calculate subtotal
    let subtotal = 0
    const verifiedItems = []

    for (const item of items) {
      const product = await productModel.findOneById(item.productId || item.id)
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, `Sản phẩm mã #${item.productId || item.id} không tồn tại!`)
      }
      if (product.stock < item.quantity) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho!`)
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity
      })
    }

    // Handle voucher discount
    let discount = 0
    if (voucherCode && voucherCode.trim() !== '') {
      const voucher = await voucherModel.findByCode(voucherCode)
      if (voucher && voucher.active) {
        const today = new Date().toISOString().slice(0, 10)
        const isExpired = (voucher.startDate && today < voucher.startDate) || (voucher.endDate && today > voucher.endDate)
        const isOutOfUses = voucher.used >= voucher.quantity
        const isMinOrderValid = !voucher.minOrder || subtotal >= voucher.minOrder

        if (!isExpired && !isOutOfUses && isMinOrderValid) {
          if (voucher.type === 'percent') {
            discount = (subtotal * voucher.value) / 100
            if (voucher.maxDiscount && discount > voucher.maxDiscount) {
              discount = voucher.maxDiscount
            }
          } else if (voucher.type === 'fixed') {
            discount = Math.min(voucher.value, subtotal)
          } else if (voucher.type === 'shipping') {
            discount = Math.min(voucher.value, shippingFee)
          }

          // Increment voucher usage
          await voucherModel.incrementUsed(voucher.code)
        }
      }
    }

    const total = Math.max(0, subtotal + Number(shippingFee) - discount)

    // Deduct stock from products
    for (const item of verifiedItems) {
      await productModel.updateStock(item.productId, item.quantity)
    }

    const orderData = {
      userId: userId ? Number(userId) : undefined,
      customer: customer || {},
      items: verifiedItems,
      subtotal,
      shippingFee: Number(shippingFee),
      discount,
      voucherCode: voucherCode || '',
      total,
      payment: payment || 'Thanh toán khi nhận hàng',
      status: ORDER_STATUS.PENDING,
      note: note || '',
      adminNote: '',
      date: new Date().toISOString()
    }

    const createdOrder = await orderModel.createNew(orderData)
    return createdOrder
  } catch (error) {
    throw error
  }
}

const getAll = async (queryParams) => {
  try {
    return await orderModel.getAll(queryParams)
  } catch (error) {
    throw error
  }
}

const getDetail = async (id) => {
  try {
    const order = await orderModel.findOneById(id)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Đơn hàng không tồn tại!')
    }
    return order
  } catch (error) {
    throw error
  }
}

const updateStatus = async (id, { status, adminNote }) => {
  try {
    const existing = await orderModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Đơn hàng không tồn tại!')
    }

    // If order is cancelled from non-cancelled status, restore stock
    if (status === ORDER_STATUS.CANCELLED && existing.status !== ORDER_STATUS.CANCELLED) {
      for (const item of existing.items) {
        await productModel.updateStock(item.productId, -item.quantity)
      }
    }

    const updated = await orderModel.updateStatus(id, status, adminNote)
    return updated
  } catch (error) {
    throw error
  }
}

const update = async (id, reqBody) => {
  try {
    const existing = await orderModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Đơn hàng không tồn tại!')
    }
    return await orderModel.update(id, reqBody)
  } catch (error) {
    throw error
  }
}

export const orderService = {
  createNew,
  getAll,
  getDetail,
  updateStatus,
  update
}

