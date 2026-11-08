import 'dotenv/config'

export const env = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  DATABASE_NAME: process.env.DATABASE_NAME || 'MyChuDB',
  LOCAL_DEV_APP_HOST: process.env.LOCAL_DEV_APP_HOST || 'localhost',
  LOCAL_DEV_APP_PORT: process.env.LOCAL_DEV_APP_PORT || 8017,
  BUILD_MODE: process.env.BUILD_MODE || 'dev',
  AUTHOR: process.env.AUTHOR || 'TrungQuanDev'
}
