import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import usersRouter from './users.routes'

const router = Router()

router.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to the Twitter API v1! 🐦‍⬛' })
})

router.use('/users', usersRouter)

export default router
