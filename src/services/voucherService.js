import { voucherModel } from '~/models/voucherModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'
import { CACHE_PATTERNS, buildCacheKey, cacheGet, cacheSet, cacheDel } from '~/utils/cache'

const CACHE_TTL = 60 * 5 // 5 phut

const getAll = async (queryParams) => {
  const hasSearch = Boolean(queryParams?.search && String(queryParams.search).trim() !== '')
  if (!hasSearch) {
    const cacheKey = buildCacheKey('vouchers:list', queryParams)
    const cached = await cacheGet(cacheKey)
    if (cached) return cached

    const vouchers = await voucherModel.getAll(queryParams)
    await cacheSet(cacheKey, vouchers, CACHE_TTL)
    return vouchers
  }

  return await voucherModel.getAll(queryParams)
}

const applyVoucher = async ({ code, subtotal = 0, shippingFee = 30000 }) => {
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
}

const createNew = async (reqBody) => {
  const existing = await voucherModel.findByCode(reqBody.code)
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Mã giảm giá này đã tồn tại!')
  }
  const created = await voucherModel.createNew(reqBody)
  await cacheDel(CACHE_PATTERNS.VOUCHERS_ALL)
  return created
}

const update = async (id, reqBody) => {
  const existing = await voucherModel.findOneById(id)
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Mã giảm giá không tồn tại!')
  }
  const updated = await voucherModel.update(id, reqBody)
  await cacheDel(CACHE_PATTERNS.VOUCHERS_ALL)
  return updated
}

const deleteOne = async (id) => {
  const existing = await voucherModel.findOneById(id)
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Mã giảm giá không tồn tại!')
  }
  await voucherModel.deleteOne(id)
  await cacheDel(CACHE_PATTERNS.VOUCHERS_ALL)
  return { deleteResult: 'Mã giảm giá đã được xóa thành công!' }
}

export const voucherService = {
  getAll,
  applyVoucher,
  createNew,
  update,
  deleteOne
}
