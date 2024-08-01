import express from 'express'
import router from './routes'
import morgan from 'morgan'
import { errorHandlingMiddleware } from './middlewares/error.middlewares'
import { checkUploadsFolderExist } from './utils/file'
import staticRouter from './routes/v1/static.routes'
import path from 'path'
import { UPLOAD_DIR } from './constants/dir'
import cors from 'cors'
import { corsConfig } from './config/cors'
import { createServer } from 'http'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { initSocket } from './socket'
import { limiter } from './config/rateLimit'
const app = express()

const httpServer = createServer(app)

checkUploadsFolderExist()
// Middleware configuration
app.use(cors(corsConfig))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(limiter)
if (process.env.BUILD_MODE === 'dev') app.use(morgan('dev'))

// Route
app.use('/api', router)
app.get('/', (req, res) => {
  res.send(
    '<html lang="en"><head><meta charset="UTF-8" /><title>TWITTER API 🐦</title><style>body {display: flex;justify-content: center;align-items: center;height: 100vh;margin: auto;}</style></head><body><div><h1>Hello, Twitter API 🐦‍⬛!</h1></div></body></html>'
  )
})
app.use('/medias', express.static(path.resolve(UPLOAD_DIR)))
app.use('/static', staticRouter)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandlingMiddleware(err, req, res, next)
})

initSocket(httpServer)

export default httpServer
