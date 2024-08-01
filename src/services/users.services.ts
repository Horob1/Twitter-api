import { env } from '~/config/environment'
import { TypeToken, UserVerifyStatus } from './../constants/enum'
import { getDB } from '~/config/mongodb'
import { RegisterReqBody, UpdateProfileReqBody } from '~/models/requests/user.requests'
import { User } from '~/models/schemas/user.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { RefreshToken, TokenPayload } from '~/models/schemas/refreshToken.schema'
import { ObjectId } from 'mongodb'
import { mailResetPasswordOptions, mailVerifyOptions, sendEmail } from '~/config/nodemailer'
import { ErrorWithStatus } from '~/models/Error'
import { StatusCodes } from 'http-status-codes'
import { USER_MESSAGES } from '~/constants/messages'
import { Follower } from '~/models/schemas/follower.schema'
import QueryString from 'qs'
import axios from 'axios'
import { FOLLOWER_COLLECTION_NAME, REFRESH_TOKEN_COLLECTION_NAME, USER_COLLECTION_NAME } from '~/constants/collection'
import { nanoid } from 'nanoid'

class UsersService {
  //sign token
  private signAccessToken(user_id: string, verifyStatus: UserVerifyStatus) {
    return signToken({
      payload: { user_id: user_id, typeToken: TypeToken.AccessToken, verify: verifyStatus },
      options: {
        expiresIn: env.ACCESS_TOKEN_EXPIRATION
      }
    })
  }
  private signRefreshToken(user_id: string, verifyStatus: UserVerifyStatus, exp?: number) {
    if (exp)
      return signToken({
        payload: { user_id: user_id, typeToken: TypeToken.RefreshToken, verify: verifyStatus, exp: exp }
      })
    return signToken({
      payload: { user_id: user_id, typeToken: TypeToken.RefreshToken, verify: verifyStatus },
      options: {
        expiresIn: env.REFRESH_TOKEN_EXPIRATION
      }
    })
  }
  private signEmailVerifyToken(user_id: string, verifyStatus: UserVerifyStatus) {
    return signToken({
      payload: { user_id: user_id, typeToken: TypeToken.EmailVerifyToken, verify: verifyStatus },
      options: {
        expiresIn: env.EMAIL_VALIDATOR_TOKEN_EXPIRATION
      }
    })
  }
  private signResetPasswordToken(user_id: string, verifyStatus: UserVerifyStatus) {
    return signToken({
      payload: { user_id: user_id, typeToken: TypeToken.ResetPasswordToken, verify: verifyStatus },
      options: {
        expiresIn: env.FORGOT_PASSWORD_TOKEN_EXPIRATION
      }
    })
  }
  //
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken(user_id.toString(), UserVerifyStatus.Unverified)
    await Promise.all([
      await getDB()
        .collection(USER_COLLECTION_NAME)
        .insertOne(
          new User({
            ...payload,
            _id: user_id,
            email_verify_token: emailVerifyToken,
            date_of_birth: new Date(payload.date_of_birth),
            password: hashPassword(payload.password),
            username: nanoid()
          })
        ),
      sendEmail(mailVerifyOptions(payload.email, emailVerifyToken))
    ])
  }
  async verifyEmail(emailVerifyToken: string) {
    await verifyToken(emailVerifyToken)
    await getDB()
      .collection(USER_COLLECTION_NAME)
      .updateOne(
        {
          email_verify_token: emailVerifyToken
        },
        [
          {
            $set: { verifyStatus: UserVerifyStatus.Verified, email_verify_token: '', updated_at: '$$NOW' }
          }
        ]
      )
  }
  async resendVerifyEmail(emailVerifyToken: string) {
    const user = await getDB().collection(USER_COLLECTION_NAME).findOne({ email_verify_token: emailVerifyToken })
    if (!user) throw new ErrorWithStatus({ status: StatusCodes.UNAUTHORIZED, message: 'Invalid email verify token' })
    const newEmailVerifyToken = await this.signEmailVerifyToken(user._id.toString(), UserVerifyStatus.Unverified)
    await Promise.all([
      await getDB()
        .collection(USER_COLLECTION_NAME)
        .updateOne(
          {
            email_verify_token: emailVerifyToken
          },
          [
            {
              $set: {
                verifyStatus: UserVerifyStatus.Verified,
                email_verify_token: newEmailVerifyToken,
                updated_at: '$$NOW'
              }
            }
          ]
        ),
      sendEmail(mailVerifyOptions(user.email, newEmailVerifyToken))
    ])
  }
  async checkEmailExist(email: string) {
    const user = await getDB().collection(USER_COLLECTION_NAME).findOne({ email })
    if (user) return true
    return false
  }
  async checkEmailAndPassword(email: string, password: string) {
    return await getDB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email, password, verifyStatus: UserVerifyStatus.Verified })
  }
  async login(user_id: string, user_status: UserVerifyStatus) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id, user_status),
      this.signRefreshToken(user_id, user_status)
    ])
    const refreshTokenDecoded: TokenPayload = await verifyToken(refreshToken)
    await getDB()
      .collection(REFRESH_TOKEN_COLLECTION_NAME)
      .insertOne(
        new RefreshToken({
          user_id: new ObjectId(user_id),
          token: refreshToken,
          iat: refreshTokenDecoded.iat as number,
          exp: refreshTokenDecoded.exp as number
        })
      )
    return { accessToken, refreshToken }
  }
  async getRefreshToken(refreshToken: string) {
    return await getDB().collection(REFRESH_TOKEN_COLLECTION_NAME).findOne({ token: refreshToken })
  }
  async logout(refreshToken: string) {
    await getDB().collection(REFRESH_TOKEN_COLLECTION_NAME).deleteOne({ token: refreshToken })
  }
  async refreshToken(user_id: string, oldRefreshToken: string, user_status: UserVerifyStatus, exp: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id, user_status),
      this.signRefreshToken(user_id, user_status, exp)
    ])
    await getDB().collection(REFRESH_TOKEN_COLLECTION_NAME).deleteOne({ token: oldRefreshToken })
    const refreshTokenDecoded: TokenPayload = await verifyToken(refreshToken)
    await getDB()
      .collection(REFRESH_TOKEN_COLLECTION_NAME)
      .insertOne(
        new RefreshToken({
          user_id: new ObjectId(user_id),
          token: refreshToken,
          iat: refreshTokenDecoded.iat as number,
          exp: refreshTokenDecoded.exp as number
        })
      )
    return { accessToken, refreshToken }
  }
  async forgotPassword(email: string) {
    const user = await getDB().collection(USER_COLLECTION_NAME).findOne({ email })
    if (!user) throw new ErrorWithStatus({ status: StatusCodes.UNAUTHORIZED, message: 'Email not found' })
    const resetPasswordToken = await this.signResetPasswordToken(user._id.toString(), user.verifyStatus)
    await Promise.all([
      getDB()
        .collection(USER_COLLECTION_NAME)
        .updateOne(
          {
            _id: user._id
          },
          [
            {
              $set: { forgot_password_token: resetPasswordToken, updated_at: '$$NOW' }
            }
          ]
        ),
      sendEmail(mailResetPasswordOptions(email, resetPasswordToken))
    ])
  }
  async verifyForgotPassword(forgot_password_token: string) {
    await Promise.all([
      verifyToken(forgot_password_token),
      getDB().collection(USER_COLLECTION_NAME).findOne({ forgot_password_token })
    ])
  }
  async resetPassword(forgot_password_token: string, newPassword: string) {
    const [user] = await Promise.all([
      getDB().collection(USER_COLLECTION_NAME).findOne({
        forgot_password_token
      }),
      verifyToken(forgot_password_token)
    ])
    if (!user)
      throw new ErrorWithStatus({
        status: StatusCodes.UNAUTHORIZED,
        message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_USED_OR_NOT_EXIST
      })
    getDB()
      .collection(USER_COLLECTION_NAME)
      .updateOne({ _id: user._id }, [
        {
          $set: {
            password: hashPassword(newPassword),
            forgot_password_token: '',
            updated_at: '$$NOW'
          }
        }
      ])
  }
  async getMe(user_id: string) {
    return await getDB()
      .collection(USER_COLLECTION_NAME)
      .findOne(
        { _id: new ObjectId(user_id) },
        {
          projection: {
            email_verify_token: 0,
            forgot_password_token: 0,
            password: 0
          }
        }
      )
  }
  async updateMe(user_id: string, payload: UpdateProfileReqBody) {
    return await getDB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(user_id) },
        [
          {
            $set: { ...payload, updated_at: '$$NOW', date_of_birth: new Date(payload.date_of_birth as string) }
          }
        ],
        {
          returnDocument: 'after'
        }
      )
  }
  async findUser(user_id: string) {
    return await getDB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(user_id) })
  }
  async follow(user_id: string, follower_id: string) {
    const isFollow = await getDB()
      .collection(FOLLOWER_COLLECTION_NAME)
      .findOne({ user_id: new ObjectId(user_id), follow_user_id: new ObjectId(follower_id) })
    if (isFollow) return
    await getDB()
      .collection(FOLLOWER_COLLECTION_NAME)
      .insertOne(new Follower({ user_id: new ObjectId(user_id), follow_user_id: new ObjectId(follower_id) }))
  }
  async checkUsernameExist(username: string) {
    return await getDB().collection(USER_COLLECTION_NAME).findOne({ username: username })
  }
  async unfollow(user_id: string, follower_id: string) {
    const isFollow = await getDB()
      .collection(FOLLOWER_COLLECTION_NAME)
      .findOne({ user_id: new ObjectId(user_id), follow_user_id: new ObjectId(follower_id) })
    if (!isFollow) return
    await getDB()
      .collection(FOLLOWER_COLLECTION_NAME)
      .deleteOne({ user_id: new ObjectId(user_id) })
  }
  async changePassword(user_id: string, password: string, old_password: string) {
    const user = await getDB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(user_id) })
    if (!user) throw new ErrorWithStatus({ status: StatusCodes.UNAUTHORIZED, message: 'User not found' })
    if (hashPassword(old_password) !== user.password)
      throw new ErrorWithStatus({ status: StatusCodes.UNAUTHORIZED, message: 'Old password is incorrect' })
    getDB()
      .collection(USER_COLLECTION_NAME)
      .updateOne({ _id: user._id }, [
        {
          $set: { password: hashPassword(password), updated_at: '$$NOW' }
        }
      ])
  }
  private async getOauthGoogleToken(code: string) {
    const values = {
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', QueryString.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as { access_token: string; id_token: string }
  }
  private async getGoogleUser(access_token: string, id_token: string) {
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    )
    return data as { email: string; name: string; picture: string; verified_email: boolean }
  }

  async oauthGoogle(code: string): Promise<{ accessToken: string; refreshToken: string; newUser: boolean }> {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const googleUser = await this.getGoogleUser(access_token, id_token)
    //check verified email
    if (!googleUser.verified_email)
      throw new ErrorWithStatus({ status: StatusCodes.BAD_REQUEST, message: USER_MESSAGES.EMAIL_IS_NOT_VERIFIED })
    //check user exists
    const user = await getDB().collection(USER_COLLECTION_NAME).findOne({ email: googleUser.email })
    if (user) {
      const [accessToken, refreshToken] = await Promise.all([
        this.signAccessToken(user._id.toString(), user.verifyStatus),
        this.signRefreshToken(user._id.toString(), user.verifyStatus)
      ])
      if (user.verifyStatus === UserVerifyStatus.Unverified)
        getDB()
          .collection(USER_COLLECTION_NAME)
          .updateOne({ _id: user._id }, [
            {
              $set: { verifyStatus: UserVerifyStatus.Verified },
              updatedAt: '$$NOW'
            }
          ])
      const refreshTokenDecoded: TokenPayload = await verifyToken(refreshToken)
      await getDB()
        .collection(REFRESH_TOKEN_COLLECTION_NAME)
        .insertOne(
          new RefreshToken({
            user_id: new ObjectId(user._id),
            token: refreshToken,
            iat: refreshTokenDecoded.iat as number,
            exp: refreshTokenDecoded.exp as number
          })
        )

      return { accessToken, refreshToken, newUser: false }
    } else {
      const password = Math.random().toString(36).substring(2, 15)
      const id = new ObjectId()
      await getDB()
        .collection(USER_COLLECTION_NAME)
        .insertOne(
          new User({
            _id: id,
            email: googleUser.email,
            name: googleUser.name,
            password: hashPassword(password),
            date_of_birth: new Date(),
            verifyStatus: UserVerifyStatus.Verified,
            avatar: googleUser.picture
          })
        )
      const [accessToken, refreshToken] = await Promise.all([
        this.signAccessToken(id.toString(), UserVerifyStatus.Verified),
        this.signRefreshToken(id.toString(), UserVerifyStatus.Verified)
      ])
      const refreshTokenDecoded: TokenPayload = await verifyToken(refreshToken)
      await getDB()
        .collection(REFRESH_TOKEN_COLLECTION_NAME)
        .insertOne(
          new RefreshToken({
            user_id: new ObjectId(id),
            token: refreshToken,
            iat: refreshTokenDecoded.iat as number,
            exp: refreshTokenDecoded.exp as number
          })
        )
      return { accessToken, refreshToken, newUser: true }
    }
  }
}

export const usersService = new UsersService()
