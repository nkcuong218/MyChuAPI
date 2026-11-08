import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const register = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(100).trim().strict().messages({
      'any.required': 'Họ và tên là bắt buộc',
      'string.empty': 'Họ và tên không được để trống',
      'string.min': 'Họ và tên phải có ít nhất {#limit} ký tự'
    }),
    email: Joi.string().email().required().trim().strict().messages({
      'any.required': 'Email là bắt buộc',
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống'
    }),
    password: Joi.string().required().min(6).max(50).messages({
      'any.required': 'Mật khẩu là bắt buộc',
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự'
    }),
    phone: Joi.string().optional().allow('').trim(),
    address: Joi.string().optional().allow('').trim()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().email().required().trim().strict().messages({
      'any.required': 'Email là bắt buộc',
      'string.email': 'Email không hợp lệ'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Mật khẩu là bắt buộc'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const userValidation = {
  register,
  login
}
