import { bannerService } from '~/services/bannerService'
import { StatusCodes } from '~/utils/constants'

const getAll = async (req, res, next) => {
  try {
    const banners = await bannerService.getAll(req.query)
    res.status(StatusCodes.OK).json(banners)
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const banner = await bannerService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(banner)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const updated = await bannerService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) {
    next(error)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    const result = await bannerService.deleteOne(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const bannerController = {
  getAll,
  createNew,
  update,
  deleteOne
}

