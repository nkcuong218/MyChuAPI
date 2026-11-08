import { bannerModel } from '~/models/bannerModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const getAll = async (queryParams) => {
  try {
    return await bannerModel.getAll(queryParams)
  } catch (error) {
    throw error
  }
}

const createNew = async (reqBody) => {
  try {
    return await bannerModel.createNew(reqBody)
  } catch (error) {
    throw error
  }
}

const update = async (id, reqBody) => {
  try {
    const existing = await bannerModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Banner không tồn tại!')
    }
    return await bannerModel.update(id, reqBody)
  } catch (error) {
    throw error
  }
}

const deleteOne = async (id) => {
  try {
    const existing = await bannerModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Banner không tồn tại!')
    }
    await bannerModel.deleteOne(id)
    return { deleteResult: 'Banner đã được xóa thành công!' }
  } catch (error) {
    throw error
  }
}

export const bannerService = {
  getAll,
  createNew,
  update,
  deleteOne
}

