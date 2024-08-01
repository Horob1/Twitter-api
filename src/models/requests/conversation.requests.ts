import { ParamsDictionary } from 'express-serve-static-core'
export interface CreateConverParams extends ParamsDictionary {
  user_id: string
}
export interface GetConverParams extends ParamsDictionary {
  conversation_id: string
}
