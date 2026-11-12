import { GET_REDIS } from '~/config/redis'

/**
 * TTL mac dinh: 5 phut (tinh bang giay)
 */
const DEFAULT_TTL = 60 * 5

/**
 * Tap trung cac prefix/pattern cache de tranh sai sot khi xoa cache cheo giua cac service
 */
export const CACHE_PATTERNS = {
  PRODUCTS_ALL: 'products:*',
  CATEGORIES_ALL: 'categories:all',
  BANNERS_ALL: 'banners:*',
  APPEARANCE: 'appearance:settings',
  BLOGS_ALL: 'blogs:*',
  REVIEWS_ALL: 'reviews:*',
  VOUCHERS_ALL: 'vouchers:*'
}

/**
 * Tao cache key on dinh tu query params (sap xep key va bo qua gia tri rong)
 * @param {string} prefix
 * @param {Record<string, any>} params
 */
export const buildCacheKey = (prefix, params = {}) => {
  const entries = Object.entries(params || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) return `${prefix}:default`
  return `${prefix}:${JSON.stringify(Object.fromEntries(entries))}`
}

/**
 * Lay du lieu tu cache.
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Parsed JSON hoac null neu khong co / Redis loi
 */
export const cacheGet = async (key) => {
  try {
    const redis = GET_REDIS()
    if (!redis) return null
    const raw = await redis.get(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Luu du lieu vao cache.
 * @param {string} key
 * @param {any} value - Se duoc JSON.stringify
 * @param {number} ttl - TTL tinh bang giay (mac dinh 5 phut)
 */
export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    const redis = GET_REDIS()
    if (!redis) return
    await redis.set(key, JSON.stringify(value), 'EX', ttl)
  } catch {
    // Bo qua loi Redis, server van hoat dong
  }
}

/**
 * Xoa mot hoac nhieu cache key.
 * Ho tro glob pattern voi SCAN (vi du: 'products:*')
 * @param {...string} keys
 */
export const cacheDel = async (...keys) => {
  try {
    const redis = GET_REDIS()
    if (!redis) return
    for (const key of keys) {
      if (!key) continue
      if (key.includes('*')) {
        let cursor = '0'
        do {
          const [nextCursor, found] = await redis.scan(cursor, 'MATCH', key, 'COUNT', 100)
          cursor = nextCursor
          if (found.length > 0) {
            await redis.del(...found)
          }
        } while (cursor !== '0')
      } else {
        await redis.del(key)
      }
    }
  } catch {
    // Bo qua loi Redis
  }
}
