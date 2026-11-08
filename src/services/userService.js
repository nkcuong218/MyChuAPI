import { userModel } from '~/models/userModel'
import { orderModel } from '~/models/orderModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes, USER_ROLES } from '~/utils/constants'

const register = async (reqBody) => {
  try {
    const { email, name, phone, password, address } = reqBody

    const existingUser = await userModel.findByEmail(email)
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email này đã được sử dụng!')
    }

    const newUser = await userModel.createNew({
      name,
      email,
      phone,
      password: password || '123456',
      address: address || '',
      role: USER_ROLES.CUSTOMER,
      status: 'active'
    })

    // Do not return password in response
    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const { email, password } = reqBody
    const user = await userModel.findByEmail(email)

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!')
    }

    if (user.status === 'locked') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!')
    }

    // In production, compare with bcrypt. For this demo, check string equality
    if (user.password && user.password !== password) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!')
    }

    const { password: _, ...userWithoutPassword } = user
    return {
      user: userWithoutPassword,
      token: `fake-jwt-token-for-${user.id}`
    }
  } catch (error) {
    throw error
  }
}

const getAll = async (queryParams) => {
  try {
    return await userModel.getAll(queryParams)
  } catch (error) {
    throw error
  }
}

const getDetail = async (id) => {
  try {
    const user = await userModel.findOneById(id)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại!')
    }

    // Also get order history for user
    const { orders } = await orderModel.getAll({ userId: user.id, limit: 100 })
    const { password: _, ...userWithoutPassword } = user

    return {
      ...userWithoutPassword,
      orders
    }
  } catch (error) {
    throw error
  }
}

const update = async (id, reqBody) => {
  try {
    const existing = await userModel.findOneById(id)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại!')
    }

    // Don't accidentally overwrite password with empty string
    const updateData = { ...reqBody }
    if (!updateData.password) delete updateData.password

    const updated = await userModel.update(id, updateData)
    const { password: _, ...userWithoutPassword } = updated
    return userWithoutPassword
  } catch (error) {
    throw error
  }
}

export const userService = {
  register,
  login,
  getAll,
  getDetail,
  update
}

