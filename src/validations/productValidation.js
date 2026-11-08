import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(255).trim().strict().messages({
      'any.required': 'Tên sản phẩm là bắt buộc',
      'string.empty': 'Tên sản phẩm không được để trống',
      'string.min': 'Tên sản phẩm phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên sản phẩm không được vượt quá {#limit} ký tự'
    }),
    sku: Joi.string().trim().strict().optional().messages({
      'string.empty': 'Mã SKU không được để trống'
    }),
    category: Joi.string().required().trim().strict().messages({
      'any.required': 'Danh mục sản phẩm là bắt buộc',
      'string.empty': 'Danh mục sản phẩm không được để trống'
    }),
    price: Joi.number().required().min(0).messages({
      'any.required': 'Giá bán là bắt buộc',
      'number.base': 'Giá bán phải là số',
      'number.min': 'Giá bán không được nhỏ hơn 0'
    }),
    originalPrice: Joi.number().min(0).optional().allow(null, '').messages({
      'number.base': 'Giá gốc phải là số',
      'number.min': 'Giá gốc không được nhỏ hơn 0'
    }),
    stock: Joi.number().integer().min(0).optional().allow(null, '').messages({
      'number.base': 'Số lượng tồn kho phải là số nguyên',
      'number.min': 'Số lượng tồn kho không được nhỏ hơn 0'
    }),
    description: Joi.string().optional().allow('').messages({
      'string.base': 'Mô tả phải là chuỗi'
    }),
    image: Joi.string().optional().allow('').messages({
      'string.base': 'Đường dẫn ảnh phải là chuỗi'
    }),
    visible: Joi.boolean().optional(),
    rate: Joi.number().min(0).max(5).optional(),
    rateNum: Joi.number().integer().min(0).optional(),
    sold: Joi.number().integer().min(0).optional()
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
    name: Joi.string().min(2).max(255).trim().strict(),
    sku: Joi.string().trim().strict(),
    category: Joi.string().trim().strict(),
    price: Joi.number().min(0),
    originalPrice: Joi.number().min(0).allow(null, ''),
    stock: Joi.number().integer().min(0).allow(null, ''),
    description: Joi.string().allow(''),
    image: Joi.string().allow(''),
    visible: Joi.boolean(),
    rate: Joi.number().min(0).max(5),
    rateNum: Joi.number().integer().min(0),
    sold: Joi.number().integer().min(0)
  })

  try {
    // allowUnknown: true de cho phep cac field khong cap nhat
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const productValidation = {
  createNew,
  update
}
