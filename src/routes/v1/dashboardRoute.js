import express from 'express'
import { dashboardController } from '~/controllers/dashboardController'

const Router = express.Router()

Router.route('/stats')
  .get(dashboardController.getStats)

export const dashboardRoute = Router

