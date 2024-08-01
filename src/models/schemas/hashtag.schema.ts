import { ObjectId } from 'mongodb'

interface HashtagType {
  _id?: ObjectId
  name: string
  created_at?: Date
}

export class Hashtag {
  _id?: ObjectId
  name: string
  create_at: Date

  constructor({ _id, name, created_at }: HashtagType) {
    this._id = _id
    this.name = name
    this.create_at = created_at || new Date()
  }
}
