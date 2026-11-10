import express from 'express'
import { bannerController } from '~/controllers/bannerController'
import { bannerValidation } from '~/validations/bannerValidation'
import { isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(bannerController.getAll)
  .post(isAdmin, bannerValidation.createNew, bannerController.createNew)

Router.route('/:id')
  .put(isAdmin, bannerValidation.update, bannerController.update)
  .delete(isAdmin, bannerController.deleteOne)

export const bannerRoute = Router
