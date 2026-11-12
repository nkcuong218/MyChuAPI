import { orderModel } from '~/models/orderModel'
import { productModel } from '~/models/productModel'
import { voucherModel } from '~/models/voucherModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes, ORDER_STATUS } from '~/utils/constants'
import { CACHE_PATTERNS, cacheDel } from '~/utils/cache'

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
    const validVoucherCodes = []

    if (voucherCode && String(voucherCode).trim() !== '') {
      // Ho tro ca 1 ma hoac nhieu ma cach nhau boi dau phay (vi du: MICHU10, FREESHIP)
      const codes = String(voucherCode)
        .split(/[,+]/)
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)

      for (const code of codes) {
        const voucher = await voucherModel.findByCode(code)
        if (voucher && voucher.active) {
          const today = new Date().toISOString().slice(0, 10)
          const isExpired = (voucher.startDate && today < voucher.startDate) || (voucher.endDate && today > voucher.endDate)
          const isOutOfUses = voucher.used >= voucher.quantity
          const isMinOrderValid = !voucher.minOrder || subtotal >= voucher.minOrder

          if (!isExpired && !isOutOfUses && isMinOrderValid) {
            let voucherDiscount = 0
            if (voucher.type === 'percent') {
              voucherDiscount = (subtotal * voucher.value) / 100
              if (voucher.maxDiscount && voucherDiscount > voucher.maxDiscount) {
                voucherDiscount = voucher.maxDiscount
              }
            } else if (voucher.type === 'fixed') {
              voucherDiscount = Math.min(voucher.value, subtotal)
            } else if (voucher.type === 'shipping') {
              voucherDiscount = Math.min(voucher.value, Number(shippingFee))
            }

            discount += voucherDiscount
            validVoucherCodes.push(voucher.code)
            await voucherModel.incrementUsed(voucher.code).catch(() => {})
          }
        }
      }
    }

    // Neu backend khong tim thay voucher trong DB (hoac demo/offline voucher) nhung frontend da tinh discount hop le
    if (discount === 0 && Number(reqBody.discount) > 0) {
      discount = Number(reqBody.discount)
    }

    const finalTotal = Math.max(0, subtotal + Number(shippingFee) - discount)
    const finalVoucherCode = validVoucherCodes.length > 0
      ? validVoucherCodes.join(', ')
      : (voucherCode ? String(voucherCode).trim() : '')

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
      voucherCode: finalVoucherCode,
      total: finalTotal,
      payment: payment || 'Thanh toán khi nhận hàng',
      status: ORDER_STATUS.PENDING,
      note: note || '',
      adminNote: '',
      date: new Date().toISOString()
    }

    const createdOrder = await orderModel.createNew(orderData)
    // Xoa cache san pham (do stock/sold thay doi) va voucher (do luot su dung thay doi)
    await cacheDel(CACHE_PATTERNS.PRODUCTS_ALL, CACHE_PATTERNS.VOUCHERS_ALL)
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

const updateStatus = async (id, { status, adminNote, received, reviewed }) => {
  try {
    const existing = await orderModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Đơn hàng không tồn tại!')
    }

    // If order is cancelled from non-cancelled status, restore stock
    let stockChanged = false
    if (status === ORDER_STATUS.CANCELLED && existing.status !== ORDER_STATUS.CANCELLED) {
      for (const item of existing.items) {
        await productModel.updateStock(item.productId, -item.quantity)
      }
      stockChanged = true
    }

    const extra = {}
    if (received !== undefined) extra.received = Boolean(received)
    if (reviewed !== undefined) extra.reviewed = Boolean(reviewed)

    const updated = await orderModel.updateStatus(id, status, adminNote, extra)
    if (stockChanged) {
      await cacheDel(CACHE_PATTERNS.PRODUCTS_ALL)
    }
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

