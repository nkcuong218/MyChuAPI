import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'

export const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin

  // In development mode or if origin is in whitelist, allow it
  if (!origin || env.BUILD_MODE === 'dev' || WHITELIST_DOMAINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // Respond immediately to OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
}
