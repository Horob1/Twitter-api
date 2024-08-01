import { ParamsDictionary, Query } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import {
  BookmarkReqBody,
  BookmarkReqParams,
  GetChildTweetQuery,
  GetTweetReqParams,
  LikeReqBody,
  LikeReqParams,
  Pagination,
  TweetReqBody
} from '~/models/requests/tweet.requests'
import { tweetsServices } from '~/services/tweets.services'
import { StatusCodes } from 'http-status-codes'
import { TWEET_MESSAGE } from '~/constants/messages'
import { getDB } from '~/config/mongodb'
import { TWEET_COLLECTION_NAME } from '~/constants/collection'
import { ObjectId } from 'mongodb'
import { Tweet } from '~/models/schemas/tweet.schema'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await tweetsServices.createTweet(req.body, req?.accesstoken_decode?.user_id as string)
    res.status(StatusCodes.CREATED).json({
      message: TWEET_MESSAGE.CREATED_TWEET_SUCCESSFULLY,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const createBookmarkController = async (
  req: Request<ParamsDictionary, any, BookmarkReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await tweetsServices.createBookmark(req?.accesstoken_decode?.user_id as string, req?.body?.tweet_id)
    res.status(StatusCodes.CREATED).json({ message: TWEET_MESSAGE.BOOKMARK_TWEET_SUCCESSFULLY, result })
  } catch (error) {
    next(error)
  }
}

export const deleteBookmarkController = async (req: Request<BookmarkReqParams>, res: Response, next: NextFunction) => {
  try {
    await tweetsServices.deleteBookmark(req?.accesstoken_decode?.user_id as string, req?.params?.tweet_id as string)
    res.status(StatusCodes.NO_CONTENT).json({ message: TWEET_MESSAGE.DELETE_BOOKMARK_SUCCESSFULLY })
  } catch (error) {
    next(error)
  }
}

export const createLikeController = async (
  req: Request<ParamsDictionary, any, LikeReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await tweetsServices.createLike(req?.accesstoken_decode?.user_id as string, req?.body?.tweet_id)
    res.status(StatusCodes.CREATED).json({ message: TWEET_MESSAGE.LIKE_TWEET_SUCCESSFULLY, result })
  } catch (error) {
    next(error)
  }
}

export const deleteLikeController = async (req: Request<LikeReqParams>, res: Response, next: NextFunction) => {
  try {
    await tweetsServices.deleteLike(req?.accesstoken_decode?.user_id as string, req?.params?.tweet_id as string)
    res.status(StatusCodes.NO_CONTENT).json({ message: TWEET_MESSAGE.DELETE_LIKE_SUCCESSFULLY })
  } catch (error) {
    next(error)
  }
}

export const getTweetController = async (req: Request<GetTweetReqParams>, res: Response, next: NextFunction) => {
  try {
    const views: any = {}
    if (req?.accesstoken_decode) views['user_views'] = 1
    else views['guest_views'] = 1

    const updatedTweet = await getDB()
      .collection(TWEET_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.tweet_id) },
        {
          $inc: views,
          $currentDate: { updated_at: true }
        },
        {
          returnDocument: 'after'
        }
      )
    const { updated_at, guest_views, user_views } = updatedTweet as Tweet

    res.status(StatusCodes.OK).json({
      message: TWEET_MESSAGE.GET_TWEET_SUCCESSFULLY,
      result: { ...req?.tweet, updated_at, guest_views, user_views }
    })
  } catch (error) {
    next(error)
  }
}

export const getTweetChildrenController = async (
  req: Request<GetTweetReqParams, any, any, GetChildTweetQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)
    const type = req.query?.type ? Number(req.query.type) : undefined
    const result = await tweetsServices.getChildTweet(
      limit,
      page,
      type,
      req.tweet?._id?.toString() as string,
      Boolean(req?.accesstoken_decode)
    )
    res.status(StatusCodes.OK).json({
      message: TWEET_MESSAGE.GET_TWEET_SUCCESSFULLY,
      result: {
        ...result,
        limit,
        page,
        type
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getNewFeedController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit)
    const page = Number(req.query.page)
    const result = await tweetsServices.getNewFeeds(
      limit,
      page,
      req.tweet?._id?.toString() as string,
      req?.accesstoken_decode?.user_id as string
    )
    res.status(StatusCodes.OK).json({
      message: TWEET_MESSAGE.GET_TWEET_SUCCESSFULLY,
      result: {
        tweets: result,
        page,
        limit
      }
    })
  } catch (error) {
    next(error)
  }
}
