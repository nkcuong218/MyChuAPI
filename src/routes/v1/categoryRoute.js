import express from 'express'
import { categoryController } from '~/controllers/categoryController'
import { categoryValidation } from '~/validations/categoryValidation'

const Router = express.Router()

Router.route('/')
  .get(categoryController.getAll)
  .post(categoryValidation.createNew, categoryController.createNew)

Router.route('/:id')
  .put(categoryValidation.update, categoryController.update)
  .delete(categoryController.deleteOne)

export const categoryRoute = Router
