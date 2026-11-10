import { userModel } from '~/models/userModel'
import { orderModel } from '~/models/orderModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes, USER_ROLES } from '~/utils/constants'
import { hashPassword, verifyPassword } from '~/utils/password'
import { generateToken } from '~/utils/jwt'

const register = async (reqBody) => {
  try {
    const { email, name, phone, password, address } = reqBody

    const existingUser = await userModel.findByEmail(email)
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email này đã được sử dụng!')
    }

    const hashedPassword = hashPassword(password || '123456')

    const newUser = await userModel.createNew({
      name,
      email,
      phone,
      password: hashedPassword,
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

    const isMatch = verifyPassword(password, user.password)
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!')
    }

    const { password: _, ...userWithoutPassword } = user
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    return {
      user: userWithoutPassword,
      token
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
    if (updateData.password) {
      updateData.password = hashPassword(updateData.password)
    } else {
      delete updateData.password
    }

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

