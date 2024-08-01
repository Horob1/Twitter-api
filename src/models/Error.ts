import { StatusCodes } from 'http-status-codes'
import { USER_MESSAGES } from '~/constants/messages'

export class ErrorWithStatus {
  status: number
  message: string
  constructor({ status, message }: { status: number; message: string }) {
    this.status = status
    this.message = message
  }
}
type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({
    status = StatusCodes.UNPROCESSABLE_ENTITY,
    message = USER_MESSAGES.VALIDATION_ERROR,
    errors
  }: {
    status?: number
    message?: string
    errors: ErrorsType
  }) {
    super({ status, message })
    this.errors = errors
  }
}
