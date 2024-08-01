import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import conversationsServices from '~/services/conversations.services'
import { CreateConverParams, GetConverParams } from '~/models/requests/conversation.requests'
import { StatusCodes } from 'http-status-codes'
import { CONVERSATION_MESSAGE } from '~/constants/messages'
import { Pagination } from '~/models/requests/tweet.requests'

export const createConversationController = async (
  req: Request<CreateConverParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversation = await conversationsServices.createConversation(
      req.accesstoken_decode?.user_id as string,
      req.params.user_id
    )
    res.status(StatusCodes.CREATED).json({ message: CONVERSATION_MESSAGE.CONVERSATION_CREATED, result: conversation })
  } catch (error) {
    next(error)
  }
}

export const getConversationController = async (
  req: Request<GetConverParams, any, any, Pagination>,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversations = await conversationsServices.getMessages(
      req.params.conversation_id,
      Number(req.query.page),
      Number(req.query.limit)
    )
    res.status(StatusCodes.CREATED).json({
      message: CONVERSATION_MESSAGE.GET_CONVERSATION_SUCCESSFULLY,
      result: { ...conversations, page: Number(req.query.page), limit: Number(req.query.limit) }
    })
  } catch (error) {
    next(error)
  }
}
