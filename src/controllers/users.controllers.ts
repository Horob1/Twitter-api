import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { usersService } from '~/services/users.services'

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Perform login logic here
    res.status(StatusCodes.OK).json({ message: 'User logged in successfully' })
  } catch (error) {
    // TODO:
  }
}

export const registerController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Perform registration logic here
    const { name, email, password, date_of_birth } = req.body
    const result = await usersService.register({
      name: name,
      email: email,
      password: password,
      date_of_birth: date_of_birth
    })
    res.status(StatusCodes.OK).json({ message: 'User registered successfully', result })
  } catch (error) {
    // TODO:
  }
}
