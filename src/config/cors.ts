import { CorsOptions } from 'cors'
import { env } from './environment'

export const corsConfig: CorsOptions = {
  origin: process.env.BUILD_MODE === 'production' ? env.CLIENT_HOSTNAME : '*'
}
