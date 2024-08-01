import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { SearchQuery } from '~/models/requests/search.requests'
import searchServices from '~/services/search.services'
import { StatusCodes } from 'http-status-codes'
import { TWEET_MESSAGE } from '~/constants/messages'

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const tweets = await searchServices.searchController(req.query, req.accesstoken_decode?.user_id as string)
    res.status(StatusCodes.OK).json({
      message: TWEET_MESSAGE.GET_TWEET_SUCCESSFULLY,
      result: {
        ...tweets
      }
    })
    //
  } catch (error) {
    next(error)
  }
}
