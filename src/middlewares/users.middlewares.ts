import { checkSchema, ParamSchema } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { usersService } from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { NextFunction, Request, Response } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { UserVerifyStatus } from '~/constants/enum'

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USER_MESSAGES.NAME_MUST_BE_BETWEEN_1_AND_100_CHARACTERS
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  trim: true
}

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  trim: true
}

const emailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
  },
  isEmail: {
    errorMessage: USER_MESSAGES.EMAIL_MUST_BE_A_VALID_EMAIL
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
  },
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    },
    errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_VALID_ISO8601_DATE
  }
}

export const userIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.USER_ID_IS_REQUIRED
  },
  custom: {
    options: async (value: string) => {
      const user = await usersService.findUser(value)
      if (!user) throw new ErrorWithStatus({ status: StatusCodes.NOT_FOUND, message: USER_MESSAGES.USER_NOT_FOUND })
      return true
    }
  }
}

const imgUrlSchema: ParamSchema = {
  isString: true,
  errorMessage: USER_MESSAGES.MUST_BE_A_URL,
  trim: true
}

export const loginValidator = checkSchema(
  {
    email: {
      ...emailSchema,
      custom: {
        options: async (value: string, { req }) => {
          const user = await usersService.checkEmailAndPassword(value, hashPassword(req.body.password))
          if (!user) throw new ErrorWithStatus({ status: StatusCodes.NOT_FOUND, message: USER_MESSAGES.USER_NOT_FOUND })
          req.user = user
          return true
        }
      }
    },
    password: passwordSchema
  },
  ['body']
)

export const registerValidator = checkSchema(
  {
    name: nameSchema,
    email: {
      ...emailSchema,
      custom: {
        options: async (value: string) => {
          const existingUser = await usersService.checkEmailExist(value)
          if (existingUser) throw new Error(USER_MESSAGES.EMAIL_ALREADY_IN_USE)
          return true
        }
      }
    },
    password: {
      ...passwordSchema,
      isLength: {
        options: {
          min: 8,
          max: 20
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_BETWEEN_8_AND_20_CHARACTERS
      },
      custom: {
        options: (value: string, { req }) => {
          if (value !== req.body.confirm_password) throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH_PASSWORD)
          return true
        }
      }
    },
    confirm_password: confirmPasswordSchema,
    date_of_birth: dateOfBirthSchema
  },
  ['body']
)

export const accessTokenValidator = checkSchema(
  {
    Authorization: {
      notEmpty: {
        errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value: string, { req }) => {
          const accessToken = value.split(' ')[1]
          if (!accessToken)
            throw new ErrorWithStatus({
              status: StatusCodes.UNAUTHORIZED,
              message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
            })
          try {
            const accesstoken_decode = await verifyToken(accessToken)
            ;(req as Request).accesstoken_decode = accesstoken_decode
            return true
          } catch (error) {
            throw new ErrorWithStatus({
              status: StatusCodes.UNAUTHORIZED,
              message: capitalize((error as JsonWebTokenError).message)
            })
          }
        }
      }
    }
  },
  ['headers']
)

export const refreshTokenValidator = checkSchema(
  {
    refreshToken: {
      notEmpty: {
        errorMessage: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value: string, { req }) => {
          try {
            const [refreshtoken_decode, refreshToken] = await Promise.all([
              verifyToken(value),
              usersService.getRefreshToken(value)
            ])
            if (!refreshToken)
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_ARE_USED_OR_NOT_EXIST,
                status: StatusCodes.UNAUTHORIZED
              })
            ;(req as Request).refreshtoken_decode = refreshtoken_decode
            return true
          } catch (error) {
            if (error instanceof JsonWebTokenError)
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_INVALID,
                status: StatusCodes.UNAUTHORIZED
              })

            throw error
          }
        }
      }
    }
  },
  ['body']
)

export const forgotPasswordValidator = checkSchema(
  {
    email: emailSchema
  },
  ['body']
)

export const resetPasswordValidator = checkSchema(
  {
    password: {
      ...passwordSchema,
      isLength: {
        options: {
          min: 8,
          max: 20
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_BETWEEN_8_AND_20_CHARACTERS
      },
      custom: {
        options: (value: string, { req }) => {
          if (value !== req.body.confirm_password) throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH_PASSWORD)
          return true
        }
      }
    },
    confirm_password: confirmPasswordSchema,
    forgot_password_token: {
      notEmpty: {
        errorMessage: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
      }
    }
  },
  ['body']
)

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const verify = req.accesstoken_decode?.verify as UserVerifyStatus
  if (verify !== UserVerifyStatus.Verified)
    return next(new ErrorWithStatus({ status: StatusCodes.FORBIDDEN, message: USER_MESSAGES.USER_FORBIDDEN }))
  next()
}
// 'name', 'date_of_birth', 'bio', 'location', 'website', 'username', 'avatar', 'cover_photo'

export const updateMeValidator = checkSchema(
  {
    name: nameSchema,
    date_of_birth: dateOfBirthSchema,
    bio: {
      isString: true,
      errorMessage: USER_MESSAGES.BIO_MUST_BE_A_STRING,
      trim: true
    },
    location: {
      isString: true,
      errorMessage: USER_MESSAGES.LOCATION_MUST_BE_A_STRING,
      trim: true
    },
    website: {
      isString: true,
      errorMessage: USER_MESSAGES.WEBSITE_MUST_BE_A_STRING,
      trim: true
    },
    username: {
      isString: true,
      errorMessage: USER_MESSAGES.USERNAME_MUST_BE_A_STRING,
      custom: {
        options: async (value: string, { req }) => {
          const existingUser = await usersService.checkUsernameExist(value)
          if (existingUser) throw new Error(USER_MESSAGES.USERNAME_ALREADY_IN_USE)
          return true
        }
      },
      trim: true
    },
    avatar: imgUrlSchema,
    cover_photo: imgUrlSchema
  },
  ['body']
)

export const followValidator = checkSchema(
  {
    follower_id: userIdSchema
  },
  ['body']
)

export const unfollowValidator = checkSchema(
  {
    follower_id: userIdSchema
  },
  ['params']
)

export const changePasswordValidator = checkSchema(
  {
    old_password: passwordSchema,
    passwordSchema: {
      ...passwordSchema,
      custom: {
        options: (value: string, { req }) => {
          if (value !== req.body.confirm_password || value === req.body.old_password)
            throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH_PASSWORD)
          return true
        }
      }
    },
    confirmPasswordSchema: confirmPasswordSchema
  },
  ['body']
)
