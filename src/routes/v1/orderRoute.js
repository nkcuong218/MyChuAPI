import express from 'express'
import { orderController } from '~/controllers/orderController'
import { orderValidation } from '~/validations/orderValidation'
import { isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(orderController.getAll)
  .post(orderValidation.createNew, orderController.createNew)

Router.route('/:id')
  .get(orderController.getDetail)
  .put(orderController.update)

Router.route('/:id/status')
  .put(orderValidation.updateStatus, orderController.updateStatus)

export const orderRoute = Router

