import { bannerModel } from '~/models/bannerModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'
import { CACHE_PATTERNS, buildCacheKey, cacheGet, cacheSet, cacheDel } from '~/utils/cache'

const CACHE_TTL = 60 * 5 // 5 phut

const getAll = async (queryParams) => {
  const cacheKey = buildCacheKey('banners:list', queryParams)
  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  const banners = await bannerModel.getAll(queryParams)
  await cacheSet(cacheKey, banners, CACHE_TTL)
  return banners
}

const createNew = async (reqBody) => {
  const created = await bannerModel.createNew(reqBody)
  await cacheDel(CACHE_PATTERNS.BANNERS_ALL)
  return created
}

const update = async (id, reqBody) => {
  const existing = await bannerModel.findOneById(id)
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Banner không tồn tại!')
  }
  const updated = await bannerModel.update(id, reqBody)
  await cacheDel(CACHE_PATTERNS.BANNERS_ALL)
  return updated
}

const deleteOne = async (id) => {
  const existing = await bannerModel.findOneById(id)
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Banner không tồn tại!')
  }
  await bannerModel.deleteOne(id)
  await cacheDel(CACHE_PATTERNS.BANNERS_ALL)
  return { deleteResult: 'Banner đã được xóa thành công!' }
}

export const bannerService = {
  getAll,
  createNew,
  update,
  deleteOne
}
