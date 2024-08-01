import { ObjectId } from 'mongodb'
import { getDB } from '~/config/mongodb'
import { CONVERSATION_COLLECTION_NAME, MESSAGES_COLLECTION_NAME } from '~/constants/collection'
import { Conversation } from '~/models/schemas/conversation.schema'

class ConversationsServices {
  async createConversation(my_id: string, user_id: string) {
    const conversation = await getDB()
      .collection(CONVERSATION_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          $or: [
            {
              user_ids: [new ObjectId(my_id), new ObjectId(user_id)]
            },
            {
              user_ids: [new ObjectId(user_id), new ObjectId(my_id)]
            }
          ]
        },
        {
          $setOnInsert: new Conversation({
            _id: new ObjectId(),
            user_ids: [new ObjectId(my_id), new ObjectId(user_id)]
          })
        },
        { upsert: true, returnDocument: 'after' }
      )
    return conversation
  }
  async findConversation(conversation_id: string) {
    const conversation = await getDB()
      .collection(CONVERSATION_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(conversation_id) })
    return conversation
  }
  async getMessages(conversation_id: string, page: number, limit: number) {
    const [messages, totalMessage] = await Promise.all([
      getDB()
        .collection(MESSAGES_COLLECTION_NAME)
        .find({ conversation_id: new ObjectId(conversation_id) })
        .skip(limit * (page - 1))
        .limit(limit)
        .sort({ created_at: -1 })
        .toArray(),
      getDB()
        .collection(MESSAGES_COLLECTION_NAME)
        .countDocuments({ conversation_id: new ObjectId(conversation_id) })
    ])
    return { messages: messages, total_page: Math.ceil(totalMessage / limit) }
  }
}
const conversationsServices = new ConversationsServices()
export default conversationsServices
