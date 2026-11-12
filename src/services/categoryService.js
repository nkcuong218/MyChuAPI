import { categoryModel } from '~/models/categoryModel'
import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'
import { CACHE_PATTERNS, cacheGet, cacheSet, cacheDel } from '~/utils/cache'

const CACHE_TTL = 60 * 5 // 5 phut

const getAll = async () => {
  const cached = await cacheGet(CACHE_PATTERNS.CATEGORIES_ALL)
  if (cached) return cached

  const [categories, { products }] = await Promise.all([
    categoryModel.getAll(),
    productModel.getAll({ limit: 1000 })
  ])

  // Update count dynamically based on active products
  const result = categories.map((cat) => {
    const count = products.filter((p) => p.category === cat.name && p.visible !== false).length
    return {
      ...cat,
      count: count || cat.count || 0
    }
  })

  await cacheSet(CACHE_PATTERNS.CATEGORIES_ALL, result, CACHE_TTL)
  return result
}

const createNew = async (reqBody) => {
  const result = await categoryModel.createNew(reqBody)
  await cacheDel(CACHE_PATTERNS.CATEGORIES_ALL)
  return result
}

const update = async (id, reqBody) => {
  const existing = await categoryModel.findOneById(id)
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Danh mục không tồn tại!')
  }
  const result = await categoryModel.update(id, reqBody)
  await cacheDel(CACHE_PATTERNS.CATEGORIES_ALL)
  return result
}

const deleteOne = async (id) => {
  const existing = await categoryModel.findOneById(id)
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Danh mục không tồn tại!')
  }
  await categoryModel.deleteOne(id)
  await cacheDel(CACHE_PATTERNS.CATEGORIES_ALL)
  return { deleteResult: 'Danh mục đã được xóa thành công!' }
}

export const categoryService = {
  getAll,
  createNew,
  update,
  deleteOne
}
