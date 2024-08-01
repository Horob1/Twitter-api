import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
import { TokenPayload } from '~/models/schemas/refreshToken.schema'

export const signToken = ({
  payload,
  privateKey = env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: TokenPayload
  privateKey?: string
  options?: jwt.SignOptions
}) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) reject(err)
      else resolve(token as string)
    })
  })

export const verifyToken = (token: string, publicKey = env.JWT_SECRET as string) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, publicKey, (err, payload) => {
      if (err) reject(err)
      else resolve(payload as TokenPayload)
    })
  })
}
