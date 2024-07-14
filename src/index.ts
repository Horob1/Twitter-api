import server from './app'
import { env } from './config/environment'
import { CLOSE_DB, connectDB } from './config/mongodb'
import exitHook from 'async-exit-hook'

const PORT = env.PORT || 3000

connectDB()
  .then(() => {
    console.log('Connected to MongoDB Cloud Atlas!')

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
