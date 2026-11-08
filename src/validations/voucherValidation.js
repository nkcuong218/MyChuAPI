import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    code: Joi.string().required().trim().strict().messages({
      'any.required': 'Mã voucher là bắt buộc',
      'string.empty': 'Mã voucher không được để trống'
    }),
    title: Joi.string().required().trim().strict().messages({
      'any.required': 'Tiêu đề voucher là bắt buộc',
      'string.empty': 'Tiêu đề voucher không được để trống'
    }),
    type: Joi.string().valid('percent', 'fixed', 'shipping').required().messages({
      'any.required': 'Loại voucher là bắt buộc',
      'any.only': 'Loại voucher phải là percent, fixed hoặc shipping'
    }),
    value: Joi.number().required().min(1).messages({
      'any.required': 'Giá trị giảm giá là bắt buộc',
      'number.min': 'Giá trị giảm giá tối thiểu là 1'
    }),
    maxDiscount: Joi.number().min(0).optional().allow(null, ''),
    minOrder: Joi.number().min(0).optional().allow(null, ''),
    quantity: Joi.number().integer().min(1).optional().allow(null, ''),
    used: Joi.number().integer().min(0).optional(),
    startDate: Joi.string().optional().allow(''),
    endDate: Joi.string().optional().allow(''),
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
    code: Joi.string().trim().strict(),
    title: Joi.string().trim().strict(),
    type: Joi.string().valid('percent', 'fixed', 'shipping'),
    value: Joi.number().min(1),
    maxDiscount: Joi.number().min(0).allow(null, ''),
    minOrder: Joi.number().min(0).allow(null, ''),
    quantity: Joi.number().integer().min(1).allow(null, ''),
    used: Joi.number().integer().min(0),
    startDate: Joi.string().allow(''),
    endDate: Joi.string().allow(''),
    active: Joi.boolean()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const voucherValidation = {
  createNew,
  update
}
