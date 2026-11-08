import { productService } from '~/services/productService'
import { StatusCodes } from '~/utils/constants'

const createNew = async (req, res, next) => {
  try {
    const createdProduct = await productService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdProduct)
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const products = await productService.getAll(req.query)
    res.status(StatusCodes.OK).json(products)
  } catch (error) {
    next(error)
  }
}

const getDetail = async (req, res, next) => {
  try {
    const product = await productService.getDetail(req.params.id)
    res.status(StatusCodes.OK).json(product)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updatedProduct = await productService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updatedProduct)
  } catch (error) {
    next(error)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    const result = await productService.deleteOne(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const productController = {
  createNew,
  getAll,
  getDetail,
  update,
  deleteOne
}

