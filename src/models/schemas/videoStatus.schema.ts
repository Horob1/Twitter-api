import { ObjectId } from 'mongodb'
import { VideoEncodingStatus } from '~/constants/enum'

export interface VideoStatusType {
  _id?: ObjectId
  name: string
  status: VideoEncodingStatus
  created_at?: Date
  updated_at?: Date
}

export class VideoStatus {
  _id?: ObjectId
  name: string
  status: VideoEncodingStatus
  created_at: Date
  updated_at: Date
  constructor({ _id, name, status, created_at, updated_at }: VideoStatusType) {
    const date = new Date()
    this._id = _id
    this.name = name
    this.status = status
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
