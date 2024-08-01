import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { omit } from 'lodash'
import { ErrorWithStatus } from '~/models/Error'

export const errorHandlingMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!err.status) err.status = StatusCodes.INTERNAL_SERVER_ERROR
  if (!err.message) err.message = StatusCodes[err.statusCode]
  if (err instanceof ErrorWithStatus) return res.status(err.status).json(omit(err, ['status']))

  if (process.env.BUILD_MODE === 'dev') {
    Object.getOwnPropertyNames(err).forEach((key) => Object.defineProperty(err, key, { enumerable: true }))
    console.log(err)
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    info: omit(err, ['status', 'message'])
  })
}
