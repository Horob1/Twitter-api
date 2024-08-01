import { ObjectId } from 'mongodb'

interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  follow_user_id: ObjectId
  created_at?: Date
}

export class Follower {
  _id?: ObjectId
  user_id: ObjectId
  follow_user_id: ObjectId
  created_at: Date
  constructor({ _id, user_id, follow_user_id, created_at }: FollowerType) {
    this._id = _id
    this.user_id = user_id
    this.follow_user_id = follow_user_id
    this.created_at = created_at || new Date()
  }
}
