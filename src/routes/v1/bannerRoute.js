import express from 'express'
import { bannerController } from '~/controllers/bannerController'
import { bannerValidation } from '~/validations/bannerValidation'

const Router = express.Router()

Router.route('/')
  .get(bannerController.getAll)
  .post(bannerValidation.createNew, bannerController.createNew)

Router.route('/:id')
  .put(bannerValidation.update, bannerController.update)
  .delete(bannerController.deleteOne)

export const bannerRoute = Router
