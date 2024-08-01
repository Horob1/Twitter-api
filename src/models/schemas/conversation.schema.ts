import { ObjectId } from 'mongodb'

export interface ConversationType {
  _id?: ObjectId
  user_ids: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export class Conversation {
  _id?: ObjectId
  user_ids: ObjectId[]
  created_at: Date
  updated_at: Date

  constructor({ _id, user_ids, created_at, updated_at }: ConversationType) {
    const date = new Date()
    this._id = _id
    this.user_ids = user_ids
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}

export interface MessageType {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
}

export class Message {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  content: string
  created_at?: Date
  updated_at?: Date
  constructor({ _id, conversation_id, sender_id, content, created_at, updated_at }: MessageType) {
    const date = new Date()
    this._id = _id
    this.conversation_id = conversation_id
    this.sender_id = sender_id
    this.content = content
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
