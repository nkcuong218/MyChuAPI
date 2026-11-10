import express from 'express'
import { voucherController } from '~/controllers/voucherController'
import { voucherValidation } from '~/validations/voucherValidation'
import { isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(voucherController.getAll)
  .post(isAdmin, voucherValidation.createNew, voucherController.createNew)

Router.route('/apply')
  .post(voucherController.applyVoucher)

Router.route('/:id')
  .put(isAdmin, voucherValidation.update, voucherController.update)
  .delete(isAdmin, voucherController.deleteOne)

export const voucherRoute = Router
