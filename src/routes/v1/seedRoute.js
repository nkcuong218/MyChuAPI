import express from 'express'
import { seedController } from '~/controllers/seedController'

const Router = express.Router()

Router.route('/')
  .get(seedController.seed)
  .post(seedController.seed)

export const seedRoute = Router

