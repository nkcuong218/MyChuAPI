import { voucherService } from '~/services/voucherService'
import { StatusCodes } from '~/utils/constants'

const getAll = async (req, res, next) => {
  try {
    const vouchers = await voucherService.getAll(req.query)
    res.status(StatusCodes.OK).json(vouchers)
  } catch (error) {
    next(error)
  }
}

const applyVoucher = async (req, res, next) => {
  try {
    const result = await voucherService.applyVoucher(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const voucher = await voucherService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(voucher)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updated = await voucherService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) {
    next(error)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    const result = await voucherService.deleteOne(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const voucherController = {
  getAll,
  applyVoucher,
  createNew,
  update,
  deleteOne
}

