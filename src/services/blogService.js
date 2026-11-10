import { blogModel } from '~/models/blogModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const getAll = async (queryParams) => {
  try {
    return await blogModel.getAll(queryParams)
  } catch (error) {
    throw error
  }
}

const getBySlug = async (slug) => {
  try {
    const blog = await blogModel.findBySlug(slug)
    if (!blog) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại!')
    }
    return blog
  } catch (error) {
    throw error
  }
}

const createNew = async (reqBody) => {
  try {
    return await blogModel.createNew(reqBody)
  } catch (error) {
    throw error
  }
}

const getReviews = async (productId) => {
  try {
    return await blogModel.getReviews(productId)
  } catch (error) {
    throw error
  }
}

const deleteReview = async (id) => {
  try {
    return await blogModel.deleteReview(id)
  } catch (error) {
    throw error
  }
}

const createReview = async (reqBody) => {
  try {
    return await blogModel.createReview(reqBody)
  } catch (error) {
    throw error
  }
}

export const blogService = {
  getAll,
  getBySlug,
  createNew,
  getReviews,
  deleteReview,
  createReview
}

