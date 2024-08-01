import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import path from 'path'
import sharp from 'sharp'
import { env } from '~/config/environment'
import { getDB } from '~/config/mongodb'
import { VIDEO_STATUS_COLLECTION_NAME } from '~/constants/collection'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType, VideoEncodingStatus } from '~/constants/enum'
import { MEDIA_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { Media } from '~/models/schemas/media.schema'
import { VideoStatus } from '~/models/schemas/videoStatus.schema'
import { getNameFromFullName, handleUploadImage, handleUploadVideo, handleUploadVideoHls } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  enqueue(item: string) {
    this.items.push(item)
    this.processQueue()
  }
  async processQueue() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const videoName = getNameFromFullName(videoPath.split('\\').pop() as string)
      try {
        await Promise.all([
          encodeHLSWithMultipleVideoStreams(videoPath),
          getDB()
            .collection(VIDEO_STATUS_COLLECTION_NAME)
            .updateOne({ name: videoName }, [
              {
                $set: { status: VideoEncodingStatus.Processing, updated_at: '$$NOW' }
              }
            ])
        ])
        this.items.shift()
        await getDB()
          .collection(VIDEO_STATUS_COLLECTION_NAME)
          .updateOne({ name: videoName }, [
            {
              $set: { status: VideoEncodingStatus.Success, updated_at: '$$NOW' }
            }
          ])
      } catch (error) {
        await getDB()
          .collection(VIDEO_STATUS_COLLECTION_NAME)
          .updateOne({ name: videoName }, [
            {
              $set: { status: VideoEncodingStatus.Failed, updated_at: '$$NOW' }
            }
          ])
          .catch((err) => {
            console.log(err)
          })
      }
      this.encoding = false
      this.processQueue()
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg({ quality: 50 }).toFile(newPath)
        return {
          url:
            process.env.BUILD_MODE === 'dev'
              ? `http://localhost:3000/medias/images/${newName}.jpg`
              : `${env.HOSTNAME}/medias/images/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const file = await handleUploadVideo(req)
    return [
      {
        url:
          process.env.BUILD_MODE === 'dev'
            ? `http://localhost:3000/medias/videos/${file.newFilename}`
            : `${env.HOSTNAME}/medias/videos/${file.newFilename}`,
        type: MediaType.Video
      }
    ]
  }
  async uploadVideoHls(req: Request) {
    const file = await handleUploadVideoHls(req)
    const name = getNameFromFullName(file.newFilename)
    await getDB()
      .collection(VIDEO_STATUS_COLLECTION_NAME)
      .insertOne(new VideoStatus({ name: name, status: VideoEncodingStatus.Pending }))

    queue.enqueue(file.filepath)
    return [
      {
        url:
          process.env.BUILD_MODE === 'dev'
            ? `http://localhost:3000/static/hls/${name}/master.m3u8`
            : `${env.HOSTNAME}/static/hls/${name}/master.m3u8`,
        type: MediaType.HLS
      }
    ]
  }
  async getVideoStatus(videoName: string) {
    const videoStatus = await getDB()
      .collection(VIDEO_STATUS_COLLECTION_NAME)
      .findOne(
        { name: videoName },
        {
          projection: {
            _id: 0,
            status: 0,
            name: 1,
            created_at: 1,
            updated_at: 1
          }
        }
      )
    if (!videoStatus)
      throw new ErrorWithStatus({ status: StatusCodes.NOT_FOUND, message: MEDIA_MESSAGE.NO_FILE_OR_PATH })
    let message
    switch (videoStatus.status) {
      case 0:
        message = MEDIA_MESSAGE.WAITING_FOR_ENCODING
        break
      case 1:
        message = MEDIA_MESSAGE.ENCODING_IN_PROGRESS
        break
      case 2:
        message = MEDIA_MESSAGE.ENCODING_SUCCESSFUL
        break
      case 3:
        message = MEDIA_MESSAGE.ENCODING_FAILED
        break
      default:
        message = MEDIA_MESSAGE.UNKNOWN_ERROR
    }
    return { ...videoStatus, message }
  }
}

const mediasService = new MediasService()

export default mediasService
