import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MEDIA_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { ServingHlsReqParameters, ServingStaticReqParameters } from '~/models/requests/media.requests'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mediasService.uploadImage(req)

    res.status(StatusCodes.OK).json({ message: MEDIA_MESSAGE.UPLOAD_SUCCESS, result })
  } catch (error) {
    next(error)
  }
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    const result = await mediasService.uploadVideo(req)
    res.status(StatusCodes.OK).json({ message: MEDIA_MESSAGE.UPLOAD_SUCCESS, result })
  } catch (error) {
    next(error)
  }
}

export const uploadVideoHlsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mediasService.uploadVideoHls(req)
    res.status(StatusCodes.OK).json({ message: MEDIA_MESSAGE.UPLOAD_SUCCESS, result })
  } catch (error) {
    next(error)
  }
}

export const servingStaticImageController = async (
  req: Request<ServingStaticReqParameters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const filename = req.params?.name
    let file = path.resolve(UPLOAD_IMAGE_DIR, filename)

    if (!file) throw new ErrorWithStatus({ status: StatusCodes.NOT_FOUND, message: MEDIA_MESSAGE.NO_FILE_OR_PATH })
    if (!file.endsWith('.jpg')) file = file.concat('.jpg')
    res.sendFile(file, (err) => {
      if (err) {
        next(
          new ErrorWithStatus({
            status: StatusCodes.NOT_FOUND,
            message: MEDIA_MESSAGE.NO_FILE_OR_PATH
          })
        )
      }
    })
  } catch (error) {
    next(error)
  }
}

export const servingStaticVideoController = async (
  req: Request<ServingStaticReqParameters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const range = req.headers.range
    if (!range) throw new ErrorWithStatus({ status: StatusCodes.BAD_REQUEST, message: MEDIA_MESSAGE.RANGE_IS_REQUIRED })
    const filename = req.params?.name
    const videoFile = path.resolve(UPLOAD_VIDEO_DIR, filename)
    if (!fs.existsSync(videoFile)) {
      throw new ErrorWithStatus({ status: StatusCodes.NOT_FOUND, message: MEDIA_MESSAGE.NO_FILE_OR_PATH })
    }
    // video size
    const videoSize = fs.statSync(videoFile).size
    // dung luong moi phan doan
    const chunkSize = 10 ** 6 // 1MB
    // dung luong phan doan hien tai
    const start = Number.parseInt(range.replace(/\D/g, ''), 10)
    const end = Math.min(start + chunkSize, videoSize - 1)
    const contentLength = end - start + 1
    const mine = (await import('mime')).default
    const contentType = mine.getType(videoFile) || 'video/*'
    const headers = {
      'Content-range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType
    }
    res.writeHead(StatusCodes.PARTIAL_CONTENT, headers)
    const videoSteams = fs.createReadStream(videoFile, { start, end })
    videoSteams.pipe(res)
  } catch (error) {
    next(error)
  }
}

export const servingStaticM3U8Controller = async (
  req: Request<ServingStaticReqParameters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const name = req.params?.name
    const file = path.resolve(UPLOAD_VIDEO_DIR, name, 'master.m3u8')
    if (!file) throw new ErrorWithStatus({ status: StatusCodes.NOT_FOUND, message: MEDIA_MESSAGE.NO_FILE_OR_PATH })
    res.sendFile(file, (err) => {
      if (err) {
        next(
          new ErrorWithStatus({
            status: StatusCodes.NOT_FOUND,
            message: MEDIA_MESSAGE.NO_FILE_OR_PATH
          })
        )
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getVideoStatusController = async (
  req: Request<ServingStaticReqParameters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const name = req.params?.name
    const result = await mediasService.getVideoStatus(name)
    res.status(StatusCodes.OK).json({ ...result })
  } catch (error) {
    next(error)
  }
}

export const servingStaticVideoHlsController = async (
  req: Request<ServingHlsReqParameters>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, segment, v } = req.params

    const file = path.resolve(UPLOAD_VIDEO_DIR, name, v, segment)
    if (!file) throw new ErrorWithStatus({ status: StatusCodes.NOT_FOUND, message: MEDIA_MESSAGE.NO_FILE_OR_PATH })
    res.sendFile(file, (err) => {
      if (err) {
        next(
          new ErrorWithStatus({
            status: StatusCodes.NOT_FOUND,
            message: MEDIA_MESSAGE.NO_FILE_OR_PATH
          })
        )
      }
    })
  } catch (error) {
    next(error)
  }
}
