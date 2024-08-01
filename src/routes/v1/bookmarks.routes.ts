import { Router } from 'express'
import { createBookmarkController, deleteBookmarkController } from '~/controllers/tweets.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { validate } from '~/utils/validation'

const router = Router()
/**
 * Description: create bookmark for a tweet
 * Method: POST
 * Path: /:tweet_id
 * Body: { tweet_id: string }
 */
router.post('/', validate(tweetIdValidator), createBookmarkController)
/**
 * Description: delete bookmark for a tweet
 * Method: DELETE
 * Path: /:tweet_id
 * Parameters: { tweet_id: string }
 */
router.delete('/:tweet_id', validate(tweetIdValidator), deleteBookmarkController)

export default router
