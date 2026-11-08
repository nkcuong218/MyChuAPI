import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().trim().strict().messages({
      'any.required': 'Tiêu đề banner là bắt buộc',
      'string.empty': 'Tiêu đề banner không được để trống'
    }),
    subtitle: Joi.string().optional().allow('').trim(),
    image: Joi.string().required().trim().strict().messages({
      'any.required': 'Đường dẫn ảnh là bắt buộc',
      'string.empty': 'Đường dẫn ảnh không được để trống'
    }),
    ctaText: Joi.string().optional().allow('').trim(),
    link: Joi.string().optional().allow('').trim(),
    position: Joi.string().valid('home-hero', 'landing-hero', 'promo').default('home-hero'),
    order: Joi.number().integer().min(1).optional(),
    active: Joi.boolean().optional()
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
    title: Joi.string().trim().strict(),
    subtitle: Joi.string().allow('').trim(),
    image: Joi.string().trim().strict(),
    ctaText: Joi.string().allow('').trim(),
    link: Joi.string().allow('').trim(),
    position: Joi.string().valid('home-hero', 'landing-hero', 'promo'),
    order: Joi.number().integer().min(1),
    active: Joi.boolean()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const bannerValidation = {
  createNew,
  update
}

