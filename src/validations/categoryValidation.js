import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(100).trim().strict().messages({
      'any.required': 'Tên danh mục là bắt buộc',
      'string.empty': 'Tên danh mục không được để trống'
    }),
    image: Joi.string().optional().allow('').default(''),
    count: Joi.number().integer().min(0).optional()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().min(2).max(100).trim().strict(),
    image: Joi.string().allow(''),
    count: Joi.number().integer().min(0)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const categoryValidation = {
  createNew,
  update
}

