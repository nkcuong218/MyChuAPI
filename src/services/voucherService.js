import { voucherModel } from '~/models/voucherModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const getAll = async (queryParams) => {
  try {
    return await voucherModel.getAll(queryParams)
  } catch (error) {
    throw error
  }
}

const applyVoucher = async ({ code, subtotal = 0, shippingFee = 30000 }) => {
  try {
    if (!code) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng cung cấp mã giảm giá!')
    }

    const voucher = await voucherModel.findByCode(code)
    if (!voucher || !voucher.active) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mã giảm giá không tồn tại hoặc đã bị tắt!')
    }

    const today = new Date().toISOString().slice(0, 10)
    if (voucher.startDate && today < voucher.startDate) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Mã giảm giá chưa đến ngày áp dụng!')
    }
    if (voucher.endDate && today > voucher.endDate) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Mã giảm giá đã hết hạn sử dụng!')
    }
    if (voucher.used >= voucher.quantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Mã giảm giá đã hết lượt sử dụng!')
    }
    if (voucher.minOrder && Number(subtotal) < voucher.minOrder) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Mã này áp dụng cho đơn hàng từ ${voucher.minOrder.toLocaleString('vi-VN')} đ trở lên!`
      )
    }

    let discount = 0
    if (voucher.type === 'percent') {
      discount = (Number(subtotal) * voucher.value) / 100
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount
      }
    } else if (voucher.type === 'fixed') {
      discount = Math.min(voucher.value, Number(subtotal))
    } else if (voucher.type === 'shipping') {
      discount = Math.min(voucher.value, Number(shippingFee))
    }

    return {
      voucher,
      discount,
      valid: true
    }
  } catch (error) {
    throw error
  }
}

const createNew = async (reqBody) => {
  try {
    const existing = await voucherModel.findByCode(reqBody.code)
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'Mã giảm giá này đã tồn tại!')
    }
    return await voucherModel.createNew(reqBody)
  } catch (error) {
    throw error
  }
}

const update = async (id, reqBody) => {
  try {
    const existing = await voucherModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mã giảm giá không tồn tại!')
    }
    return await voucherModel.update(id, reqBody)
  } catch (error) {
    throw error
  }
}

const deleteOne = async (id) => {
  try {
    const existing = await voucherModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mã giảm giá không tồn tại!')
    }
    await voucherModel.deleteOne(id)
    return { deleteResult: 'Mã giảm giá đã được xóa thành công!' }
  } catch (error) {
    throw error
  }
}

export const voucherService = {
  getAll,
  applyVoucher,
  createNew,
  update,
  deleteOne
}

