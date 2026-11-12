import Redis from 'ioredis'
import { env } from '~/config/environment'

let redisClient = null

export const CONNECT_REDIS = async () => {
  const client = new Redis(env.REDIS_URL || 'redis://127.0.0.1:6379', {
    // Tu dong reconnect toi da 3 lan khi mat ket noi
    retryStrategy: (times) => {
      if (times > 3) {
        console.error('Redis: Max reconnection attempts reached. Giving up.')
        return null
      }
      return Math.min(times * 200, 1000)
    },
    lazyConnect: true,
    enableOfflineQueue: false // Khong queue lenh khi offline -> de cache fallback ve DB ngay lap tuc
  })

  client.on('ready', () => {
    redisClient = client
    console.log('Redis: Connected and ready.')
  })

  client.on('error', (err) => {
    // Log loi nhung KHONG crash server - cache la optional
    console.warn('Redis: Connection error (cache disabled):', err.message)
  })

  client.on('close', () => {
    console.warn('Redis: Connection closed.')
  })

  try {
    await client.connect()
    redisClient = client
  } catch (err) {
    console.warn('Redis: Failed to connect on startup (cache disabled):', err.message)
    // Khong throw - server van chay binh thuong khong co cache
  }
}

export const GET_REDIS = () => {
  if (!redisClient || redisClient.status !== 'ready') return null
  return redisClient
}

export const CLOSE_REDIS = async () => {
  if (redisClient) {
    try {
      await redisClient.quit()
    } catch {
      redisClient.disconnect()
    }
    redisClient = null
    console.log('Redis: Disconnected.')
  }
}
