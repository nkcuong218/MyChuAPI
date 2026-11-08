import express from 'express'
import { productController } from '~/controllers/productController'
import { productValidation } from '~/validations/productValidation'

const Router = express.Router()

Router.route('/')
  .get(productController.getAll)
  .post(productValidation.createNew, productController.createNew)

Router.route('/:id')
  .get(productController.getDetail)
  .put(productValidation.update, productController.update)
  .delete(productController.deleteOne)

export const productRoute = Router

