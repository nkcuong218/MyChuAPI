import { orderService } from '~/services/orderService'
import { StatusCodes } from '~/utils/constants'

const createNew = async (req, res, next) => {
  try {
    const createdOrder = await orderService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdOrder)
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const orders = await orderService.getAll(req.query)
    res.status(StatusCodes.OK).json(orders)
  } catch (error) {
    next(error)
  }
}

const getDetail = async (req, res, next) => {
  try {
    const order = await orderService.getDetail(req.params.id)
    res.status(StatusCodes.OK).json(order)
  } catch (error) {
    next(error)
  }
}

const updateStatus = async (req, res, next) => {
  try {
    const updated = await orderService.updateStatus(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updated = await orderService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) {
    next(error)
  }
}

export const orderController = {
  createNew,
  getAll,
  getDetail,
  updateStatus,
  update
}

