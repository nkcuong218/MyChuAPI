import express from 'express'
import { voucherController } from '~/controllers/voucherController'
import { voucherValidation } from '~/validations/voucherValidation'

const Router = express.Router()

Router.route('/')
  .get(voucherController.getAll)
  .post(voucherValidation.createNew, voucherController.createNew)

Router.route('/apply')
  .post(voucherController.applyVoucher)

Router.route('/:id')
  .put(voucherValidation.update, voucherController.update)
  .delete(voucherController.deleteOne)

export const voucherRoute = Router
