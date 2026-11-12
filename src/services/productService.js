import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'
import { CACHE_PATTERNS, buildCacheKey, cacheGet, cacheSet, cacheDel } from '~/utils/cache'

const CACHE_TTL = 60 * 5 // 5 phut

const createNew = async (reqBody) => {
  const newProduct = await productModel.createNew(reqBody)
  // Xoa cache san pham va so luong san pham theo danh muc
  await cacheDel(CACHE_PATTERNS.PRODUCTS_ALL, CACHE_PATTERNS.CATEGORIES_ALL)
  return newProduct
}

const getAll = async (queryParams) => {
  // Khong cache cac query tim kiem tu do de tranh phinh bo nho Redis
  const hasSearch = Boolean(queryParams?.search && String(queryParams.search).trim() !== '')

  if (!hasSearch) {
    const cacheKey = buildCacheKey('products:list', queryParams)
    const cached = await cacheGet(cacheKey)
    if (cached) return cached

    const results = await productModel.getAll(queryParams)
    await cacheSet(cacheKey, results, CACHE_TTL)
    return results
  }

  return await productModel.getAll(queryParams)
}

const getDetail = async (id) => {
  const cacheKey = `products:detail:${id}`
  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  const product = await productModel.findOneById(id)
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại!')
  }

  await cacheSet(cacheKey, product, CACHE_TTL)
  return product
}

const update = async (id, reqBody) => {
  const existing = await productModel.findOneById(id)
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại!')
  }

  const updatedProduct = await productModel.update(id, reqBody)

  // Xoa toan bo cache products:* (ca list lan detail theo _id/id/sku) va categories:all
  await cacheDel(CACHE_PATTERNS.PRODUCTS_ALL, CACHE_PATTERNS.CATEGORIES_ALL)
  return updatedProduct
}

const deleteOne = async (id) => {
  const existing = await productModel.findOneById(id)
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại!')
  }

  await productModel.deleteOne(id)

  await cacheDel(CACHE_PATTERNS.PRODUCTS_ALL, CACHE_PATTERNS.CATEGORIES_ALL)
  return { deleteResult: 'Sản phẩm đã được xóa thành công!' }
}

export const productService = {
  createNew,
  getAll,
  getDetail,
  update,
  deleteOne
}
