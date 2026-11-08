import { blogService } from '~/services/blogService'
import { StatusCodes } from '~/utils/constants'

const getAll = async (req, res, next) => {
  try {
    const blogs = await blogService.getAll(req.query)
    res.status(StatusCodes.OK).json(blogs)
  } catch (error) {
    next(error)
  }
}

const getBySlug = async (req, res, next) => {
  try {
    const blog = await blogService.getBySlug(req.params.slug)
    res.status(StatusCodes.OK).json(blog)
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const blog = await blogService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(blog)
  } catch (error) {
    next(error)
  }
}

const getReviews = async (req, res, next) => {
  try {
    const reviews = await blogService.getReviews()
    res.status(StatusCodes.OK).json(reviews)
  } catch (error) {
    next(error)
  }
}

const createReview = async (req, res, next) => {
  try {
    const review = await blogService.createReview(req.body)
    res.status(StatusCodes.CREATED).json(review)
  } catch (error) {
    next(error)
  }
}

export const blogController = {
  getAll,
  getBySlug,
  createNew,
  getReviews,
  createReview
}

