import { categoryModel } from '~/models/categoryModel'
import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from '~/utils/constants'

const getAll = async () => {
  try {
    const [categories, { products }] = await Promise.all([
      categoryModel.getAll(),
      productModel.getAll({ limit: 1000 })
    ])

    // Update count dynamically based on active products
    const result = categories.map((cat) => {
      const count = products.filter((p) => p.category === cat.name && p.visible !== false).length
      return {
        ...cat,
        count: count || cat.count || 0
      }
    })

    return result
  } catch (error) {
    throw error
  }
}

const createNew = async (reqBody) => {
  try {
    return await categoryModel.createNew(reqBody)
  } catch (error) {
    throw error
  }
}

const update = async (id, reqBody) => {
  try {
    const existing = await categoryModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Danh mục không tồn tại!')
    }
    return await categoryModel.update(id, reqBody)
  } catch (error) {
    throw error
  }
}

const deleteOne = async (id) => {
  try {
    const existing = await categoryModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Danh mục không tồn tại!')
    }
    await categoryModel.deleteOne(id)
    return { deleteResult: 'Danh mục đã được xóa thành công!' }
  } catch (error) {
    throw error
  }
}

export const categoryService = {
  getAll,
  createNew,
  update,
  deleteOne
}

