import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { corsMiddleware } from '~/config/cors'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  // Handle CORS
  app.use(corsMiddleware)

  // Enable req.body json data
  app.use(express.json())

  // Enable req.body urlencoded data
  app.use(express.urlencoded({ extended: true }))

  // Mount API V1 routes
  app.use('/v1', APIs_V1)

  // Centralized Error Handling Middleware
  app.use(errorHandlingMiddleware)

  app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
    console.log(
      `3. Hello, This is MyChuTeam, backendServer running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`
    )
  })

  exitHook(() => {
    console.log('4. Server is shutting down...')
    CLOSE_DB()
    console.log('5. Disconnected from MongoDB Cloud Atlas!')
  })
}

console.log('1. Connecting to MongoDB cloud Atlas ...')
CONNECT_DB()
  .then(() => console.log('2. Connected to MongoDB Cloud Atlas'))
  .then(() => START_SERVER())
  .catch((error) => {
    console.error(error)
    process.exit(0)
  })
