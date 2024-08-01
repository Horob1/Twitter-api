import { ParamsDictionary } from 'express-serve-static-core'
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refreshToken: string
}

export interface RefreshTokenReqBody {
  refreshToken: string
}

export interface VerifyEmailReqParams {
  verify_email_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordParams {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface UpdateProfileReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface FollowReqBody {
  follower_id: string
}

export interface UnfollowReqParameters extends ParamsDictionary {
  follower_id: string
}

export interface ChangePasswordReqBody {
  password: string
  confirm_password: string
  old_password: string
}

export interface GetUserIdParameters extends ParamsDictionary {
  username: string
}
