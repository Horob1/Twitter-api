import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { result } from 'lodash'
import { env } from '~/config/environment'
import { UserVerifyStatus } from '~/constants/enum'
import { USER_MESSAGES } from '~/constants/messages'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetUserIdParameters,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  UnfollowReqParameters,
  UpdateProfileReqBody,
  VerifyEmailReqParams,
  VerifyForgotPasswordParams
} from '~/models/requests/user.requests'
import { usersService } from '~/services/users.services'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await usersService.login(
      req?.user?._id?.toString() as string,
      req?.user?.verifyStatus as UserVerifyStatus
    )
    res.status(StatusCodes.OK).json({
      message: 'User logged in successfully',
      result: {
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    next(error)
  }
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.register(req.body)
    res.status(StatusCodes.CREATED).json({ message: USER_MESSAGES.REGISTER_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.logout(req.body.refreshToken as string)
    res.status(StatusCodes.OK).json({ message: USER_MESSAGES.LOGOUT_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await usersService.refreshToken(
      req?.refreshtoken_decode?.user_id as string,
      req?.body?.refreshToken as string,
      req?.refreshtoken_decode?.verify as UserVerifyStatus,
      req?.refreshtoken_decode?.exp as number
    )
    res.status(StatusCodes.OK).json({
      message: USER_MESSAGES.REFRESH_TOKEN_SUCCESSFUL,
      result: {
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    })
  } catch (error) {
    next(error)
  }
}

export const verifyEmailController = async (req: Request<VerifyEmailReqParams>, res: Response, next: NextFunction) => {
  try {

    await usersService.verifyEmail(req.params.verify_email_token as string)
    res
      .status(StatusCodes.OK)
      .send(
        `<body><div><p>XÁC THỰC THÀNH CÔNG! </p><a href=${env.CLIENT_HOSTNAME}>HOME PAGE!</a></div><style>div{position: fixed; top: 50%;left: 50%;transform: translate(-50%, -50%);display: flex; align-items: center;justify-content: center; }</style></body>`
      )
  } catch (error) {
    if ((error as { message: string }).message)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          `<body><div><p>HẾT HẠN XÁC THỰC! </p><a href='${env.HOSTNAME}/api/v1/users/resend_verify_email/${req.params.verify_email_token}'>Gửi lại email!</a></div><style>div{position: fixed; top: 50%;left: 50%;transform: translate(-50%, -50%);}</style></body>`
        )
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('<p>CÓ LỖI</p>')
  }
}

export const resendVerifyEmailController = async (
  req: Request<VerifyEmailReqParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.resendVerifyEmail(req.params.verify_email_token as string)
    res.status(StatusCodes.OK).send('<script>window.close()</script>')
  } catch (error) {
    next(error)
  }
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.forgotPassword(req.body.email)
    res.status(StatusCodes.OK).json({ message: USER_MESSAGES.SENDED_RESET_PASSWORD_EMAIL })
  } catch (error) {
    next(error)
  }
}

export const verifyForgotPasswordController = async (
  req: Request<VerifyForgotPasswordParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.verifyForgotPassword(req.params.forgot_password_token as string)
    res.status(StatusCodes.OK).json({ message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.resetPassword(req.body.forgot_password_token, req.body.password)
    res.status(StatusCodes.OK).json({ message: USER_MESSAGES.RESET_PASSWORD_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getMe(req?.accesstoken_decode?.user_id as string)
    res.status(StatusCodes.OK).json({ message: USER_MESSAGES.GET_USER_INFO_SUCCESSFULLY, result: user })
  } catch (error) {
    next(error)
  }
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateProfileReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await usersService.updateMe(req?.accesstoken_decode?.user_id as string, req?.body)
    res.status(StatusCodes.OK).json({
      message: USER_MESSAGES.UPDATE_USER_SUCCESSFULLY,
      result: user
    })
  } catch (error) {
    next(error)
  }
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.follow(req?.accesstoken_decode?.user_id as string, req.body.follower_id)
    res.status(StatusCodes.OK).json({ message: USER_MESSAGES.FOLLOW_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const unfollowController = async (req: Request<UnfollowReqParameters>, res: Response, next: NextFunction) => {
  try {
    await usersService.unfollow(req?.accesstoken_decode?.user_id as string, req.params.follower_id)
    res.status(StatusCodes.NO_CONTENT).json()
  } catch (error) {
    next(error)
  }
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.changePassword(
      req?.accesstoken_decode?.user_id as string,
      req.body.old_password,
      req.body.password
    )
    res.status(StatusCodes.OK).json({ message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const oauthGoogleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.query.code
    const result = await usersService.oauthGoogle(code as string)
    res.redirect(
      env.CLIENT_HOSTNAME +
        '/login?accessToken=' +
        result.accessToken +
        '&refreshToken=' +
        result.refreshToken +
        '&newUser=' +
        result.newUser
    )
  } catch (error) {
    next(error)
  }
}

export const getUserIdController = async (req: Request<GetUserIdParameters>, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.checkUsernameExist(req.params.username)
    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })

    res.status(StatusCodes.OK).json({
      message: USER_MESSAGES.FOUNDED_USER,
      result: {
        userId: user._id
      }
    })
  } catch (error) {
    next(error)
  }
}
