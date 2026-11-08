import { userService } from '~/services/userService'
import { StatusCodes } from '~/utils/constants'

const register = async (req, res, next) => {
  try {
    const newUser = await userService.register(req.body)
    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll(req.query)
    res.status(StatusCodes.OK).json(users)
  } catch (error) {
    next(error)
  }
}

const getDetail = async (req, res, next) => {
  try {
    const user = await userService.getDetail(req.params.id)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updated = await userService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  register,
  login,
  getAll,
  getDetail,
  update
}

