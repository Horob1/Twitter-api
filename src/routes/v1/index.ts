import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import usersRouter from './users.routes'
import mediasRouter from './medias.routes'
import tweetsRouter from './tweets.routes'
import bookmarksRouter from './bookmarks.routes'
import likesRouter from './likes.routes'
import searchRouter from './search.routes'
import conversationsRouter from './conversations.routes'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { validate } from '~/utils/validation'

const router = Router()

router.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to the Twitter API v1! 🐦‍⬛' })
})

router.use('/users', usersRouter)
router.use('/tweets', tweetsRouter)

router.use(validate(accessTokenValidator))
router.use(verifyUserValidator)
router.use('/bookmarks', bookmarksRouter)
router.use('/likes', likesRouter)
router.use('/medias', mediasRouter)
router.use('/search', searchRouter)
router.use('/conversations', conversationsRouter)
export default router
