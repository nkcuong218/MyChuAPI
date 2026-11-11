import express from 'express'
import { blogController } from '~/controllers/blogController'
import { isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(blogController.getReviews)
  .post(blogController.createReview)

Router.route('/:id')
  .delete(isAdmin, blogController.deleteReview)

export const reviewRoute = Router

