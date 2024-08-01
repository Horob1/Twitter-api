import { Server as HttpServer } from 'http'
import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import { getDB } from '~/config/mongodb'
import { CONVERSATION_COLLECTION_NAME, MESSAGES_COLLECTION_NAME } from '~/constants/collection'
import { checkTokenValid, preConnectSocket } from '~/middlewares/socket.middlewares'
import { Message, MessageType } from '~/models/schemas/conversation.schema'

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    /* options */
    cors: {
      origin: 'http://localhost:5173'
    }
  })
  const users: { [key: string]: any } = {}
  io.use(preConnectSocket)

  io.on('connection', (socket) => {
    socket.use((packet, next) => checkTokenValid(socket, next))
    socket.on('connect_error', (err) => {
      console.log(err.message) // prints the message associated with the error
    })

    const userId = socket.handshake.auth.user_id
    if (!users[userId]) {
      users[userId] = { socketId: socket.id }
    }
    socket.on('message', async (payload: MessageType) => {
      try {
        // get conversation
        const conversation = await getDB()
          .collection(CONVERSATION_COLLECTION_NAME)
          .findOne({
            _id: new ObjectId(payload.conversation_id)
          })
        //check conversation exists
        if (!conversation) {
          throw new Error(`Conversation not found`)
        }
        const receiverId = conversation?.user_ids.find((id: any) => userId !== id.toString()).toString()
        //tao message
        const message = await getDB()
          .collection(MESSAGES_COLLECTION_NAME)
          .insertOne(
            new Message({
              conversation_id: new ObjectId(payload.conversation_id),
              sender_id: new ObjectId(payload.sender_id),
              content: payload.content,
              created_at: payload.created_at,
              updated_at: payload.updated_at
            })
          )
        //gui message
        if (users[receiverId]) {
          socket.to(users[receiverId].socketId).emit('message', { ...payload, _id: message.insertedId.toString() })
        }
      } catch (error) {
        //DO SOMETHING
      }
    })
    socket.on('disconnect', () => {
      delete users[userId]
    })
  })
}
