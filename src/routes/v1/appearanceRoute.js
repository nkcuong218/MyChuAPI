import express from 'express'
import { appearanceController } from '~/controllers/appearanceController'

const Router = express.Router()

Router.route('/')
  .get(appearanceController.getSettings)
  .put(appearanceController.updateSettings)

Router.route('/reset')
  .post(appearanceController.resetSettings)

export const appearanceRoute = Router

