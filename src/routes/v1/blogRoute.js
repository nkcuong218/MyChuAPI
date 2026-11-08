import express from 'express'
import { blogController } from '~/controllers/blogController'

const Router = express.Router()

Router.route('/')
  .get(blogController.getAll)
  .post(blogController.createNew)

Router.route('/reviews')
  .get(blogController.getReviews)
  .post(blogController.createReview)

Router.route('/:slug')
  .get(blogController.getBySlug)

export const blogRoute = Router

