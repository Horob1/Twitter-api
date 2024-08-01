import { Db, MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'
import {
  BOOKMARK_COLLECTION_NAME,
  CONVERSATION_COLLECTION_NAME,
  FOLLOWER_COLLECTION_NAME,
  HASHTAG_COLLECTION_NAME,
  LIKE_COLLECTION_NAME,
  MESSAGES_COLLECTION_NAME,
  REFRESH_TOKEN_COLLECTION_NAME,
  TWEET_COLLECTION_NAME,
  USER_COLLECTION_NAME,
  VIDEO_STATUS_COLLECTION_NAME
} from '~/constants/collection'

let databaseInstance: Db

const client = new MongoClient(env.DATABASE_URL as string, {
  serverApi: {
    version: ServerApiVersion.v1,
    // strict: true,
    deprecationErrors: true
  }
})

export const connectDB = async () => {
  await client.connect()
  databaseInstance = client.db(env.DATABASE_NAME)
}

export const getDB = () => {
  if (!databaseInstance) throw new Error('Must connect to Database first!')
  return databaseInstance
}

export const CLOSE_DB = async () => {
  await client.close()
}

const usersIndexing = async () => {
  //check if index exist
  const usersCollection = getDB().collection(USER_COLLECTION_NAME)
  const indexExists = await usersCollection.indexExists([
    'email_verify_token_1',
    'email_1_password_1_verifyStatus_1',
    'email_1',
    'forgot_password_token_1',
    'username_1'
  ])
  if (indexExists) {
    return
  }
  usersCollection.createIndex({ email_verify_token: 1 })
  usersCollection.createIndex({ email: 1 }, { unique: true })
  usersCollection.createIndex({ email: 1, password: 1, verifyStatus: 1 })
  usersCollection.createIndex({ forgot_password_token: 1 })
  usersCollection.createIndex({ username: 1 }, { unique: true })
}

const tweetsIndexing = async () => {
  const tweetsCollection = getDB().collection(TWEET_COLLECTION_NAME)
  const indexExists = await tweetsCollection.indexExists([
    'user_id_1',
    'parent_id_1',
    'parent_id_1_type_1',
    'content_text'
  ])
  if (indexExists) {
    return
  }
  tweetsCollection.createIndex({ user_id: 1 })
  tweetsCollection.createIndex({ parent_id: 1 })
  tweetsCollection.createIndex({ parent_id: 1, type: 1 })
  tweetsCollection.createIndex({ content: 'text' }, { default_language: 'none' })
}

const refreshTokensIndexing = async () => {
  const refreshTokensCollection = getDB().collection(REFRESH_TOKEN_COLLECTION_NAME)
  const indexExists = await refreshTokensCollection.indexExists(['token_1', 'exp_1'])
  if (indexExists) {
    return
  }
  refreshTokensCollection.createIndex({ token: 1 })
  refreshTokensCollection.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
}

const followersIndexing = async () => {
  const followersCollection = getDB().collection(FOLLOWER_COLLECTION_NAME)
  const indexExists = await followersCollection.indexExists('user_id_1')
  if (indexExists) {
    return
  }
  followersCollection.createIndex({ user_id: 1 })
}

const videosIndexing = async () => {
  const videosCollection = getDB().collection(VIDEO_STATUS_COLLECTION_NAME)
  const indexExists = await videosCollection.indexExists('name_1')
  if (indexExists) {
    return
  }
  videosCollection.createIndex({ name: 1 })
}

const hashtagIndexing = async () => {
  const hashtagCollection = getDB().collection(HASHTAG_COLLECTION_NAME)
  const indexExists = await hashtagCollection.indexExists('name_1')
  if (indexExists) {
    return
  }
  hashtagCollection.createIndex({ name: 1 })
}

const bookmarkIndexing = async () => {
  const bookmarkCollection = getDB().collection(BOOKMARK_COLLECTION_NAME)
  const indexExists = await bookmarkCollection.indexExists('tweet_id_1_user_id_1')
  if (indexExists) {
    return
  }
  bookmarkCollection.createIndex({ tweet_id: 1, user_id: 1 })
}

const likeIndexing = async () => {
  const likeCollection = getDB().collection(LIKE_COLLECTION_NAME)
  const indexExists = await likeCollection.indexExists('tweet_id_1_user_id_1')
  if (indexExists) {
    return
  }
  likeCollection.createIndex({ tweet_id: 1, user_id: 1 })
}

const conversationIndexing = async () => {
  const conversationCollection = getDB().collection(CONVERSATION_COLLECTION_NAME)
  const indexExists = await conversationCollection.indexExists('user_ids_1')
  if (indexExists) {
    return
  }
  conversationCollection.createIndex({ user_ids: 1 })
}

const messageIndexing = async () => {
  const messageCollection = getDB().collection(MESSAGES_COLLECTION_NAME)
  const indexExists = await messageCollection.indexExists('conversation_id_1')

  if (indexExists) {
    return
  }
  messageCollection.createIndex({ user_ids: 1 })
}

export const indexDB = async () => {
  await Promise.all([
    usersIndexing(),
    refreshTokensIndexing(),
    followersIndexing(),
    videosIndexing(),
    hashtagIndexing(),
    bookmarkIndexing(),
    likeIndexing(),
    tweetsIndexing(),
    conversationIndexing(),
    messageIndexing()
  ])
}
