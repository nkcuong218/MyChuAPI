import { blogModel } from '~/models/blogModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'
import { CACHE_PATTERNS, buildCacheKey, cacheGet, cacheSet, cacheDel } from '~/utils/cache'

const CACHE_TTL = 60 * 5 // 5 phut

const getAll = async (queryParams) => {
  const hasSearch = Boolean(queryParams?.search && String(queryParams.search).trim() !== '')
  if (!hasSearch) {
    const cacheKey = buildCacheKey('blogs:list', queryParams)
    const cached = await cacheGet(cacheKey)
    if (cached) return cached

    const blogs = await blogModel.getAll(queryParams)
    await cacheSet(cacheKey, blogs, CACHE_TTL)
    return blogs
  }

  return await blogModel.getAll(queryParams)
}

const getBySlug = async (slug) => {
  const cacheKey = `blogs:slug:${slug}`
  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  const blog = await blogModel.findBySlug(slug)
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại!')
  }

  await cacheSet(cacheKey, blog, CACHE_TTL)
  return blog
}

const createNew = async (reqBody) => {
  const created = await blogModel.createNew(reqBody)
  await cacheDel(CACHE_PATTERNS.BLOGS_ALL)
  return created
}

const getReviews = async (productId) => {
  const keySuffix = productId ? String(productId).trim() : 'all'
  const cacheKey = `reviews:${keySuffix}`
  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  const reviews = await blogModel.getReviews(productId)
  await cacheSet(cacheKey, reviews, CACHE_TTL)
  return reviews
}

const deleteReview = async (id) => {
  const result = await blogModel.deleteReview(id)
  // Xoa ca cache reviews va products vi syncProductRating cap nhat lai rate/rateNum cua san pham
  await cacheDel(CACHE_PATTERNS.REVIEWS_ALL, CACHE_PATTERNS.PRODUCTS_ALL)
  return result
}

const createReview = async (reqBody) => {
  const created = await blogModel.createReview(reqBody)
  // Xoa ca cache reviews va products vi syncProductRating cap nhat lai rate/rateNum cua san pham
  await cacheDel(CACHE_PATTERNS.REVIEWS_ALL, CACHE_PATTERNS.PRODUCTS_ALL)
  return created
}

export const blogService = {
  getAll,
  getBySlug,
  createNew,
  getReviews,
  deleteReview,
  createReview
}
