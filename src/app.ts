import express from 'express'
import router from './routes'
import morgan from 'morgan'

const app = express()

//middleware configuration
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
if (process.env.BUILD_MODE === 'dev') app.use(morgan('dev'))
//route
app.use('/api', router)
app.get('/', (req, res) => {
  res.send(
    '<html lang="en"><head><meta charset="UTF-8" /><title>TWITTER API 🐦</title><style>body {display: flex;justify-content: center;align-items: center;height: 100vh;margin: auto;}</style></head><body><div><h1>Hello, Twitter API 🐦‍⬛!</h1></div></body></html>'
  )
})
export default app
