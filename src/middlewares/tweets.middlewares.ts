import { NextFunction, Request, Response } from 'express'
import { checkSchema, param, ParamSchema } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { isEmpty, trim } from 'lodash'
import { ObjectId } from 'mongodb'
import { getDB } from '~/config/mongodb'
import { USER_COLLECTION_NAME } from '~/constants/collection'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import { PAGINATION_MESSAGE, TWEET_MESSAGE, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { tweetsServices } from '~/services/tweets.services'
import { enumToArray } from '~/utils/common'
const tweetTypes = enumToArray(TweetType)
const tweetAudience = enumToArray(TweetAudience)
const mediaTypes = enumToArray(MediaType)

const typeSchema: ParamSchema = {
  notEmpty: {
    errorMessage: TWEET_MESSAGE.TWEET_TYPE_IS_REQUIRED
  },
  isIn: {
    options: [tweetTypes],
    errorMessage: TWEET_MESSAGE.TWEET_TYPE_MUST_BE_MATCH_WITH_TYPE
  }
}

const audienceSchema: ParamSchema = {
  notEmpty: {
    errorMessage: TWEET_MESSAGE.TWEET_AUDIENCE_IS_REQUIRED
  },
  isIn: {
    options: [tweetAudience],
    errorMessage: TWEET_MESSAGE.TWEET_TYPE_MUST_BE_MATCH_WITH_TYPE
  }
}

const parentIdSchema: ParamSchema = {
  custom: {
    options: (value, { req }) => {
      const type = req.body.type as TweetType
      if ([TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(type) && !ObjectId.isValid(value)) {
        throw new Error(TWEET_MESSAGE.TWEET_PARENT_ID_IS_REQUIRED)
      }
      if (type === TweetType.Tweet && value !== null) {
        throw new Error(TWEET_MESSAGE.TWEET_PARENT_ID_IS_NULL)
      }
      return true
    }
  }
}

const contentSchema: ParamSchema = {
  custom: {
    options: (value, { req }) => {
      const type = req.body.type as TweetType
      const hashtags = req.body.hashtags as string[]
      const mentions = req.body.mentions as string[]
      if (
        [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
        isEmpty(hashtags) &&
        isEmpty(mentions) &&
        trim(value) === ''
      ) {
        throw new Error(TWEET_MESSAGE.TWEET_CONTENT_IS_REQUIRED)
      }
      if (type === TweetType.Retweet && value !== '') {
        throw new Error(TWEET_MESSAGE.TWEET_CONTENT_MUST_BE_NULL)
      }
      return true
    }
  }
}

const hashtagsSchema: ParamSchema = {
  isArray: true,
  custom: {
    options: (value) => {
      if (!value.every((item: any) => typeof item === 'string'))
        throw new Error(TWEET_MESSAGE.TWEET_HASHTAG_MUST_BE_A_STRING)
      return true
    }
  }
}

const mentionsSchema: ParamSchema = {
  isArray: true,
  custom: {
    options: (value) => {
      if (!value.every((item: any) => ObjectId.isValid(item)))
        throw new Error(TWEET_MESSAGE.TWEET_MENTION_MUST_BE_VALID_ID)
      return true
    }
  }
}

const tweetIdSchema: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new Error(TWEET_MESSAGE.TWEET_ID_IS_REQUIRED)
      }
      const tweet = await tweetsServices.getTweetById(value)
      if (!tweet) {
        throw new Error(TWEET_MESSAGE.TWEET_NOT_FOUND)
      }
      req.tweet = tweet
      return true
    }
  }
}

const mediasSchema: ParamSchema = {
  isArray: true,
  custom: {
    options: (value) => {
      if (
        !value.every((item: any) => {
          return typeof item?.url === 'string' && mediaTypes.includes(item?.type)
        })
      )
        throw new Error(TWEET_MESSAGE.TWEET_MEDIA_MUST_BE_VALID_MEDIA_OBJ)
      return true
    }
  }
}

export const createTweetValidator = checkSchema(
  {
    type: typeSchema,
    audience: audienceSchema,
    content: contentSchema,
    parent_id: parentIdSchema,
    hashtags: hashtagsSchema,
    mentions: mentionsSchema,
    medias: mediasSchema
  },
  ['body']
)

export const tweetIdValidator = checkSchema(
  {
    tweet_id: tweetIdSchema
  },
  ['body', 'params']
)

export const checkLoginValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tweet = req?.tweet
    if (tweet?.audience === TweetAudience.TweetCircle) {
      if (!req?.accesstoken_decode)
        throw new ErrorWithStatus({ status: StatusCodes.UNAUTHORIZED, message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED })
      const author = await getDB()
        .collection(USER_COLLECTION_NAME)
        .findOne({ _id: new ObjectId(tweet.user_id) })
      if (!author || author.verifyStatus !== UserVerifyStatus.Verified)
        throw new ErrorWithStatus({ status: StatusCodes.NOT_FOUND, message: USER_MESSAGES.USER_NOT_FOUND })
      const isInTweetCircle = author.tweet_circle.some((item: ObjectId) =>
        item.equals(req?.accesstoken_decode?.user_id)
      )
      if (!isInTweetCircle || !author._id.equals(req?.accesstoken_decode?.user_id))
        throw new ErrorWithStatus({ status: StatusCodes.FORBIDDEN, message: TWEET_MESSAGE.TWEET_IS_NOT_PUBLIC })
    }
    next()
  } catch (error) {
    next(error)
  }
}

const limitSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PAGINATION_MESSAGE.LIMIT_IS_REQUIRED
  },
  isString: true,
  trim: true,
  custom: {
    options: (value) => {
      if (!/^\d+$/.test(value) || Number(value) <= 0 || Number(value) > 100) {
        throw new Error(PAGINATION_MESSAGE.LIMIT_MUST_BE_POSITIVE_INTEGER)
      }
      return true
    }
  }
}

const pageSchema: ParamSchema = {
  notEmpty: {
    errorMessage: PAGINATION_MESSAGE.PAGE_IS_REQUIRED
  },
  isString: true,
  trim: true,
  custom: {
    options: (value) => {
      if (!/^\d+$/.test(value) || Number(value) <= 0) {
        throw new Error(PAGINATION_MESSAGE.PAGE_MUST_BE_POSITIVE_INTEGER)
      }
      return true
    }
  }
}

export const paginationSchema: { [key: string]: ParamSchema } = {
  limit: limitSchema,
  page: pageSchema
}

export const getNewFeedValidator = checkSchema(
  {
    ...paginationSchema
  },
  ['query']
)

export const checkGetChildTweetValidator = checkSchema(
  {
    tweet_id: tweetIdSchema,
    ...paginationSchema
  },
  ['query', 'params', 'body']
)
