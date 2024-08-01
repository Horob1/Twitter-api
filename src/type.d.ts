import { Request } from 'express'
import { User } from './models/schemas/user.schema'
import { TokenPayload } from './models/schemas/refreshToken.schema'
import { Tweet } from './models/schemas/tweet.schema'

declare module 'express' {
  interface Request {
    user?: User
    accesstoken_decode?: TokenPayload
    refreshtoken_decode?: TokenPayload
    tweet?: Tweet
  }
}
