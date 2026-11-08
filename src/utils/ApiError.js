/**
 * Custom ApiError class for centralized error handling
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError

