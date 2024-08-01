import { Router } from 'express'
import { createLikeController, deleteLikeController } from '~/controllers/tweets.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { validate } from '~/utils/validation'

const router = Router()
/**
 * Description: create like for a tweet
 * Method: POST
 * Path: /:tweet_id
 * Body: { tweet_id: string }
 */
router.post('/', validate(tweetIdValidator), createLikeController)
/**
 * Description: delete like for a tweet
 * Method: DELETE
 * Path: /:tweet_id
 * Parameters: { tweet_id: string }
 */
router.delete('/:tweet_id', validate(tweetIdValidator), deleteLikeController)
export default router
