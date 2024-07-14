import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import { usersService } from '~/services/users.services'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  // Implement your login validation logic here
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing email and password.' })
  }
  next()
}

export const registerValidator = checkSchema({
  name: {
    notEmpty: true,
    isString: true,
    trim: true,
    isLength: {
      options: {
        min: 1,
        max: 100
      }
    }
  },
  email: {
    notEmpty: true,
    isEmail: true,
    trim: true,
    custom: {
      options: async (value: string) => {
        const existingUser = await usersService.checkExist(value)
        if (existingUser) throw new Error('Email already in use')
        return true
      }
    }
  },
  password: {
    notEmpty: true,
    isString: true,
    trim: true,
    isLength: {
      options: {
        min: 8,
        max: 20
      }
    },
    custom: {
      options: (value: string, { req }) => {
        if (value !== req.body.confirm_password) throw new Error('Password confirmation does not match password')
        return true
      }
    }
  },
  date_of_birth: {
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true
      }
    }
  }
})
