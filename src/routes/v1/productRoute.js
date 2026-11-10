import express from 'express'
import { productController } from '~/controllers/productController'
import { productValidation } from '~/validations/productValidation'
import { isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(productController.getAll)
  .post(isAdmin, productValidation.createNew, productController.createNew)

Router.route('/:id')
  .get(productController.getDetail)
  .put(isAdmin, productValidation.update, productController.update)
  .delete(isAdmin, productController.deleteOne)

export const productRoute = Router

