import { env } from '~/config/environment'

import { MongoClient, ServerApiVersion } from 'mongodb'

let myChuDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()

  myChuDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!myChuDatabaseInstance) throw new Error('Must connect to DB first!')
  return myChuDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}

