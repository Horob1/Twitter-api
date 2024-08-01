import { checkSchema } from 'express-validator'
import { OfEnum, ReqMediaType } from '~/constants/enum'
import { enumToArray } from '~/utils/common'
import { paginationSchema } from './tweets.middlewares'
import { TWEET_MESSAGE } from '~/constants/messages'

const reqMediaTypeArray = enumToArray(ReqMediaType)
const ofEnumArray = enumToArray(OfEnum)
export const searchValidator = checkSchema(
  {
    ...paginationSchema,
    type: {
      isIn: {
        options: [reqMediaTypeArray],
        errorMessage: TWEET_MESSAGE.MEDIA_TYPE_MUST_BE_MATCH_WITH_TYPE
      }
    },
    of: {
      notEmpty: {
        errorMessage: TWEET_MESSAGE.OF_MUST_BE_REQUIRED
      },
      isIn: {
        options: [ofEnumArray],
        errorMessage: TWEET_MESSAGE.OF_MUST_BE_MATCH_WITH_TYPE
      }
    },
    content: {
      notEmpty: {
        errorMessage: TWEET_MESSAGE.TWEET_CONTENT_IS_REQUIRED
      }
    }
  },
  ['query']
)
