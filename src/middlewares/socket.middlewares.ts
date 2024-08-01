import { ExtendedError } from 'node_modules/socket.io/dist/namespace'
import { Socket } from 'socket.io'
import { UserVerifyStatus } from '~/constants/enum'
import { verifyToken } from '~/utils/jwt'

export const preConnectSocket = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    const { Authorization } = socket.handshake.auth
    const access_token = (Authorization as string).split(' ')[1]
    const accessToken_decoded = await verifyToken(access_token)
    if (accessToken_decoded.verify !== UserVerifyStatus.Verified) throw new Error('Unverified user')
    socket.handshake.auth.access_token = access_token
    socket.handshake.auth.user_id = accessToken_decoded.user_id
    next()
  } catch (error) {
    next(error as ExtendedError)
  }
}

export const checkTokenValid = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    await verifyToken(socket.handshake.auth.access_token)
    next()
  } catch (error) {
    next(new Error('Invalid token'))
  }
}
