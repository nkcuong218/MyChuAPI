import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes, ORDER_STATUS } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    userId: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
    customer: Joi.object({
      name: Joi.string().optional().allow(''),
      phone: Joi.string().optional().allow(''),
      email: Joi.string().email().optional().allow(''),
      address: Joi.string().optional().allow('')
    }).optional(),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
          name: Joi.string().optional(),
          image: Joi.string().optional().allow(''),
          price: Joi.number().min(0).optional(),
          quantity: Joi.number().integer().min(1).required().messages({
            'any.required': 'Số lượng sản phẩm là bắt buộc',
            'number.min': 'Số lượng sản phẩm tối thiểu là 1'
          })
        })
      )
      .min(1)
      .required()
      .messages({
        'any.required': 'Đơn hàng phải có ít nhất 1 sản phẩm',
        'array.min': 'Đơn hàng phải có ít nhất 1 sản phẩm'
      }),
    shippingFee: Joi.number().min(0).optional(),
    discount: Joi.number().min(0).optional(),
    subtotal: Joi.number().min(0).optional(),
    total: Joi.number().min(0).optional(),
    voucherCode: Joi.string().optional().allow(''),
    payment: Joi.string().optional().allow(''),
    note: Joi.string().optional().allow('')
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateStatus = async (req, res, next) => {
  const correctCondition = Joi.object({
    status: Joi.string()
      .valid(...Object.values(ORDER_STATUS))
      .required()
      .messages({
        'any.required': 'Trạng thái đơn hàng là bắt buộc',
        'any.only': `Trạng thái phải là một trong: ${Object.values(ORDER_STATUS).join(', ')}`
      }),
    adminNote: Joi.string().optional().allow('')
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const orderValidation = {
  createNew,
  updateStatus
}
