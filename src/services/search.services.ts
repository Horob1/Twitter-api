import { ObjectId } from 'mongodb'
import { getDB } from '~/config/mongodb'
import { FOLLOWER_COLLECTION_NAME, TWEET_COLLECTION_NAME } from '~/constants/collection'
import { MediaType, OfEnum, ReqMediaType, TweetAudience, TweetType } from '~/constants/enum'
import { SearchQuery } from '~/models/requests/search.requests'

class SearchServices {
  async searchController(searchQuery: SearchQuery, user_id: string) {
    const limit = Number(searchQuery.limit)
    const page = Number(searchQuery.page)
    const content = decodeURIComponent(searchQuery.content)
    const of = Number(searchQuery.of)
    const type = searchQuery.type ? Number(searchQuery.type) : undefined
    const typeObjQuery: any = {}
    const follower: any = {}
    if (type === ReqMediaType.Image) typeObjQuery['medias.type'] = MediaType.Image
    else if (type === ReqMediaType.Video)
      typeObjQuery['medias.type'] = {
        $in: [MediaType.HLS, MediaType.Video]
      }
    if (of === OfEnum.OnlyFollower) {
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
      follower['user_id'] = {
        $in: [new ObjectId(user_id), ...followersId]
      }
    }
    const tweets = await getDB()
      .collection(TWEET_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: [
              {
                $text: {
                  $search: content
                }
              },
              typeObjQuery,
              follower
            ]
          }
          /**
           * query: The query in MQL.
           */
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

    return { tweets, limit, page, onlyFollowers: of, type: type === 0 || type === 1 ? type : undefined }
  }
}

const searchServices = new SearchServices()
export default searchServices
