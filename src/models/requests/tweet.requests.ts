import { ParamsDictionary, Query } from 'express-serve-static-core'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../schemas/media.schema'

export interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: string | null
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface BookmarkReqParams extends ParamsDictionary {
  tweet_id: string
}

export interface BookmarkReqBody {
  tweet_id: string
}

export interface LikeReqParams extends ParamsDictionary {
  tweet_id: string
}

export interface LikeReqBody {
  tweet_id: string
}

export interface GetTweetReqParams extends ParamsDictionary {
  tweet_id: string
}

export interface Pagination extends Query {
  limit: string
  page: string
}

export interface GetChildTweetQuery extends Pagination {
  type?: string
}
