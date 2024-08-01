import { checkSchema } from 'express-validator'
import { userIdSchema } from './users.middlewares'
import { paginationSchema } from './tweets.middlewares'
import { StatusCodes } from 'http-status-codes'
import { CONVERSATION_MESSAGE } from '~/constants/messages'
import conversationsServices from '~/services/conversations.services'
import { ErrorWithStatus } from '~/models/Error'

export const createConversationValidator = checkSchema(
  {
    user_id: userIdSchema
  },
  ['params']
)

export const getConversationValidator = checkSchema(
  {
    ...paginationSchema,
    conversation_id: {
      notEmpty: {
        errorMessage: CONVERSATION_MESSAGE.CONVERSATION_ID_MUST_REQUIRED
      },
      custom: {
        options: async (value: string) => {
          const conversation = await conversationsServices.findConversation(value)
          if (!conversation)
            throw new ErrorWithStatus({
              status: StatusCodes.NOT_FOUND,
              message: CONVERSATION_MESSAGE.CONVERSATION_NOT_FOUND
            })
          return true
        }
      }
    }
  },
  ['params', 'query']
)
