import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const createNew = async (reqBody) => {
  try {
    const newProduct = await productModel.createNew(reqBody)
    return newProduct
  } catch (error) {
    throw error
  }
}

const getAll = async (queryParams) => {
  try {
    const results = await productModel.getAll(queryParams)
    return results
  } catch (error) {
    throw error
  }
}

const getDetail = async (id) => {
  try {
    const product = await productModel.findOneById(id)
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại!')
    }
    return product
  } catch (error) {
    throw error
  }
}

const update = async (id, reqBody) => {
  try {
    const existing = await productModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại!')
    }

    const updatedProduct = await productModel.update(id, reqBody)
    return updatedProduct
  } catch (error) {
    throw error
  }
}

const deleteOne = async (id) => {
  try {
    const existing = await productModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại!')
    }

    await productModel.deleteOne(id)
    return { deleteResult: 'Sản phẩm đã được xóa thành công!' }
  } catch (error) {
    throw error
  }
}

export const productService = {
  createNew,
  getAll,
  getDetail,
  update,
  deleteOne
}

