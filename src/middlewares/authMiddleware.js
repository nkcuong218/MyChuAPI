import { verifyToken } from '~/utils/jwt'
import ApiError from '~/utils/ApiError'
import { StatusCodes, USER_ROLES } from '~/utils/constants'

export const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Vui lòng đăng nhập để tiếp tục!')
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    req.jwtDecoded = decoded
    req.user = decoded
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, error.message || 'Phiên đăng nhập không hợp lệ!'))
  }
}

export const isAdmin = (req, res, next) => {
  isAuthenticated(req, res, () => {
    const role = req.jwtDecoded?.role
    if (role !== USER_ROLES.ADMIN && role !== 'staff') {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập chức năng này!'))
    }
    next()
  })
}

