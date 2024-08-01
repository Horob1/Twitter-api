import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { StatusCodes } from 'http-status-codes'
import { EntityError, ErrorWithStatus } from '~/models/Error'

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // sequential processing, stops running validation chain if one fails.
    await validation.run(req)
    const error = validationResult(req)
    if (error.isEmpty()) {
      return next()
    }
    const errorObj = error.mapped()
    const entityError = new EntityError({ errors: {} })

    for (const key in errorObj) {
      const { msg } = errorObj[key]
      if (msg instanceof ErrorWithStatus && msg.status !== StatusCodes.UNPROCESSABLE_ENTITY) return next(msg)
      entityError.errors[key] = errorObj[key]
    }
    next(entityError)
  }
}
