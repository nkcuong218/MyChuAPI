import { categoryService } from '~/services/categoryService'
import { StatusCodes } from '~/utils/constants'

const getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll()
    res.status(StatusCodes.OK).json(categories)
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const category = await categoryService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(category)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updated = await categoryService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) {
    next(error)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    const result = await categoryService.deleteOne(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const categoryController = {
  getAll,
  createNew,
  update,
  deleteOne
}

