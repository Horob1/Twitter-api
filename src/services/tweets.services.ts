import { Request } from 'express'
import { ObjectId, WithId } from 'mongodb'
import { getDB } from '~/config/mongodb'
import {
  BOOKMARK_COLLECTION_NAME,
  FOLLOWER_COLLECTION_NAME,
  HASHTAG_COLLECTION_NAME,
  LIKE_COLLECTION_NAME,
  TWEET_COLLECTION_NAME
} from '~/constants/collection'
import { TweetAudience, TweetType } from '~/constants/enum'
import { TweetReqBody } from '~/models/requests/tweet.requests'
import { Bookmark } from '~/models/schemas/bookmark.schema'
import { Hashtag } from '~/models/schemas/hashtag.schema'
import { Like } from '~/models/schemas/like.schema'
import { Tweet } from '~/models/schemas/tweet.schema'

class TweetsServices {
  private async checkOrCreateHashtags(hashtags: string[]): Promise<ObjectId[]> {
    const results = await Promise.all(
      hashtags.map((hashtag) => {
        return getDB()
          .collection(HASHTAG_COLLECTION_NAME)
          .findOneAndUpdate(
            { name: hashtag },

            { $setOnInsert: new Hashtag({ _id: new ObjectId(), name: hashtag }) },
            {
              upsert: true,
              returnDocument: 'after'
            }
          )
      })
    )
    return results.map((result) => (result as WithId<Hashtag>)._id)
  }
  async getTweetById(tweet_id: string) {
    const tweet = await getDB()
      .collection(TWEET_COLLECTION_NAME)
      .aggregate<Tweet>(
        [
          {
            $match: {
              _id: new ObjectId(tweet_id)
            }
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user_id'
            }
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    email: '$$mention.email',
                    username: '$$mention.username',
                    avatar: '$$mention.avatar'
                  }
                }
              },
              user_id: {
                $map: {
                  input: '$user_id',
                  as: 'user_id',
                  in: {
                    _id: '$$user_id._id',
                    name: '$$user_id.name',
                    email: '$$user_id.email',
                    username: '$$user_id.username',
                    avatar: '$$user_id.avatar'
                  }
                }
              }
            }
          },
          {
            $unwind:
              /**
               * path: Path to the array field.
               * includeArrayIndex: Optional name for index.
               * preserveNullAndEmptyArrays: Optional
               *   toggle to unwind null and empty values.
               */
              {
                path: '$user_id'
              }
          },
          {
            $addFields:
              /**
               * newField: The new field name.
               * expression: The new field expression.
               */
              {
                author: '$user_id'
              }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'like'
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmark'
            }
          },
          {
            $addFields: {
              like: { $size: '$like' },
              bookmark: { $size: '$like' }
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_childs'
            }
          },
          {
            $addFields: {
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_childs',
                    as: 'tweet',
                    cond: { $eq: ['$$tweet.type', TweetType.Retweet] }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_childs',
                    as: 'tweet',
                    cond: { $eq: ['$$tweet.type', TweetType.Comment] }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_childs',
                    as: 'tweet',
                    cond: { $eq: ['$$tweet.type', TweetType.QuoteTweet] }
                  }
                }
              }
            }
          },
          { $project: { user_id: 0, tweet_childs: 0 } }
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      )
      .toArray()

    return tweet[0]
  }
  async createTweet(body: TweetReqBody, user_id: string) {
    const hashtags = await this.checkOrCreateHashtags(body.hashtags)
    console.log(hashtags)
    const tweet = await getDB()
      .collection(TWEET_COLLECTION_NAME)
      .insertOne(
        new Tweet({
          audience: body.audience,
          parent_id: body?.parent_id,
          user_id: new ObjectId(user_id),
          content: body.content,
          type: body.type,
          hashtags: hashtags, // TODO: CHECK hashtags
          mentions: body.mentions,
          medias: body.medias
        })
      )

    return await getDB().collection(TWEET_COLLECTION_NAME).findOne({ _id: tweet.insertedId })
  }
  async createBookmark(user_id: string, tweet_id: string) {
    return await getDB()
      .collection(BOOKMARK_COLLECTION_NAME)
      .findOneAndUpdate(
        { user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) },
        {
          $setOnInsert: new Bookmark({
            _id: new ObjectId(),
            tweet_id: new ObjectId(tweet_id),
            user_id: new ObjectId(user_id)
          })
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )
  }
  async deleteBookmark(user_id: string, tweet_id: string) {
    await getDB()
      .collection(BOOKMARK_COLLECTION_NAME)
      .findOneAndDelete({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
  }
  async createLike(user_id: string, tweet_id: string) {
    return await getDB()
      .collection(LIKE_COLLECTION_NAME)
      .findOneAndUpdate(
        { user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) },
        {
          $setOnInsert: new Like({
            _id: new ObjectId(),
            tweet_id: new ObjectId(tweet_id),
            user_id: new ObjectId(user_id)
          })
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )
  }
  async deleteLike(user_id: string, tweet_id: string) {
    await getDB()
      .collection(LIKE_COLLECTION_NAME)
      .findOneAndDelete({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
  }
  async getChildTweet(limit: number, page: number, type: number | undefined, tweet_id: string, isUser: boolean) {
    const typeObj: any = {}
    if (type) typeObj['type'] = type
    // get children
    const tweets = await getDB()
      .collection(TWEET_COLLECTION_NAME)
      .aggregate([
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              parent_id: new ObjectId(tweet_id),
              ...typeObj
            }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  email: '$$mention.email',
                  username: '$$mention.username',
                  avatar: '$$mention.avatar'
                }
              }
            },
            user_id: {
              $map: {
                input: '$user_id',
                as: 'user_id',
                in: {
                  _id: '$$user_id._id',
                  name: '$$user_id.name',
                  email: '$$user_id.email',
                  username: '$$user_id.username',
                  avatar: '$$user_id.avatar'
                }
              }
            }
          }
        },
        {
          $unwind: {
            path: '$user_id'
          }
        },
        {
          $addFields: {
            author: '$user_id'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'like'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmark'
          }
        },
        {
          $addFields: {
            like: { $size: '$like' },
            bookmark: { $size: '$like' }
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_childs'
          }
        },
        {
          $addFields: {
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_childs',
                  as: 'tweet',
                  cond: { $eq: ['$$tweet.type', TweetType.Retweet] }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_childs',
                  as: 'tweet',
                  cond: { $eq: ['$$tweet.type', TweetType.Comment] }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_childs',
                  as: 'tweet',
                  cond: { $eq: ['$$tweet.type', TweetType.QuoteTweet] }
                }
              }
            }
          }
        },
        {
          $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
              user_id: 0,
              tweet_childs: 0
            }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const views: any = {}
    if (isUser) views['user_views'] = 1
    else views['guest_views'] = 1
    const ids = tweets.map((tweet) => tweet._id)
    const [, total] = await Promise.all([
      ids.forEach(async (id) => {
        await getDB()
          .collection(TWEET_COLLECTION_NAME)
          .findOneAndUpdate(
            { _id: id },
            {
              $inc: views,
              $currentDate: {
                updated_at: true
              }
            }
          )
      }),
      getDB()
        .collection(TWEET_COLLECTION_NAME)
        .countDocuments({
          parent_id: new ObjectId(tweet_id),
          ...typeObj
        })
    ])
    return { tweets, total }
  }
  async getNewFeeds(limit: number, page: number, tweet_id: string, user_id: string) {
    //get followers
    let followersId: any = await getDB()
      .collection(FOLLOWER_COLLECTION_NAME)
      .find(
        { user_id: new ObjectId(user_id) },
        {
          projection: {
            _id: 1
          }
        }
      )
      .toArray()

    followersId = followersId.map((follower: any) => follower._id)
    const tweets = await getDB()
      .collection(TWEET_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            //bai dang cua minh va nhung nuoi minh da follow
            user_id: {
              $in: [new ObjectId(user_id), ...followersId]
            }
          }
        },

        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id'
          }
        },
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TweetCircle
                    },
                    {
                      $or: [
                        {
                          user_id: {
                            $elemMatch: {
                              tweet_circle: {
                                $in: [new ObjectId(user_id)]
                              }
                            }
                          }
                        },
                        {
                          user_id: {
                            $elemMatch: {
                              _id: new ObjectId(user_id)
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  email: '$$mention.email',
                  username: '$$mention.username',
                  avatar: '$$mention.avatar'
                }
              }
            },
            user_id: {
              $map: {
                input: '$user_id',
                as: 'user_id',
                in: {
                  _id: '$$user_id._id',
                  name: '$$user_id.name',
                  email: '$$user_id.email',
                  username: '$$user_id.username',
                  avatar: '$$user_id.avatar'
                }
              }
            }
          }
        },
        {
          $unwind: {
            path: '$user_id'
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            author: '$user_id'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'like'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmark'
          }
        },
        {
          $addFields: {
            like: { $size: '$like' },
            bookmark: { $size: '$like' }
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_childs'
          }
        },
        {
          $addFields: {
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_childs',
                  as: 'tweet',
                  cond: { $eq: ['$$tweet.type', TweetType.Retweet] }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_childs',
                  as: 'tweet',
                  cond: { $eq: ['$$tweet.type', TweetType.Comment] }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_childs',
                  as: 'tweet',
                  cond: { $eq: ['$$tweet.type', TweetType.QuoteTweet] }
                }
              }
            }
          }
        },
        {
          $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
              user_id: 0,
              tweet_childs: 0
            }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const ids = tweets.map((tweet) => tweet._id)
    await Promise.all([
      ids.forEach(async (id) => {
        await getDB()
          .collection(TWEET_COLLECTION_NAME)
          .findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
              $inc: { user_views: 1 },
              $currentDate: {
                updated_at: true
              }
            }
          )
      })
    ])
    return tweets
  }
}

export const tweetsServices = new TweetsServices()
