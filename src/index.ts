//server
import server from './app'
import { env } from './config/environment'
import { CLOSE_DB, connectDB, indexDB } from './config/mongodb'
import exitHook from 'async-exit-hook'

const PORT = env.PORT || 3000

connectDB()
  .then(async () => {
    await indexDB()
    console.log('Connected to MongoDB Cloud Atlas!')
    console.log('BUILD_MODE: ', process.env.BUILD_MODE)
    server.listen({ port: PORT }, () => {
      console.log(`Server running at http://localhost:${PORT}❤️`)
    })
    exitHook(() => {
      CLOSE_DB()
    })
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB: ', error)
    process.exit(0)
  })
