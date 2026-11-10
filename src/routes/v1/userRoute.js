import express from 'express'
import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'
import { isAuthenticated, isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.register, userController.register)

Router.route('/login')
  .post(userValidation.login, userController.login)

Router.route('/')
  .get(isAdmin, userController.getAll)
  .post(userValidation.register, userController.register)

Router.route('/:id')
  .get(userController.getDetail)
  .put(isAuthenticated, userController.update)

export const userRoute = Router

