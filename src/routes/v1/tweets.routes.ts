import { Router } from 'express'
import {
  createTweetController,
  getNewFeedController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  checkGetChildTweetValidator,
  checkLoginValidator,
  createTweetValidator,
  getNewFeedValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { validate } from '~/utils/validation'

const router = Router()
/**
 * Description: Get new feed
 * Path: /newfeads
 * Method: GET
 */
router.get(
  '/newfeeds',
  validate(accessTokenValidator),
  verifyUserValidator,
  validate(getNewFeedValidator),
  getNewFeedController
)
/**
 * Description: Get a tweet by id
 * Path: /:tweet_id
 * Method: GET
 * Parameters: {tweet_id: string}
 */
router.get(
  '/:tweet_id',
  checkLoginValidator(validate(accessTokenValidator)),
  checkLoginValidator(verifyUserValidator),
  validate(tweetIdValidator),
  audienceValidator,
  getTweetController
)
/**
 * Description: Get a tweet children by id
 * Path: /:tweet_id/children
 * Method: GET
 * Body: { type: number }
 * Query Parameters: { limit: string, page: string}
 */
router.get(
  '/:tweet_id/children',
  checkLoginValidator(validate(accessTokenValidator)),
  checkLoginValidator(verifyUserValidator),
  validate(checkGetChildTweetValidator),
  audienceValidator,
  getTweetChildrenController
)

/**
 * Description: Create a new tweet
 * Path: /
 * Method: POST
 * Body: TweetReqBody
 */
router.post(
  '/',
  validate(accessTokenValidator),
  verifyUserValidator,
  validate(createTweetValidator),
  createTweetController
)

export default router
