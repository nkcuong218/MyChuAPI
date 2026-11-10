import express from 'express'
import { categoryController } from '~/controllers/categoryController'
import { categoryValidation } from '~/validations/categoryValidation'
import { isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(categoryController.getAll)
  .post(isAdmin, categoryValidation.createNew, categoryController.createNew)

Router.route('/:id')
  .put(isAdmin, categoryValidation.update, categoryController.update)
  .delete(isAdmin, categoryController.deleteOne)

export const categoryRoute = Router
