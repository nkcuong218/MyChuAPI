import express from 'express'
import { appearanceController } from '~/controllers/appearanceController'
import { isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(appearanceController.getSettings)
  .put(isAdmin, appearanceController.updateSettings)

Router.route('/reset')
  .post(isAdmin, appearanceController.resetSettings)

export const appearanceRoute = Router

