import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { nanoid } from 'nanoid'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_TEMP_IMAGE_DIR, UPLOAD_TEMP_VIDEO_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

export const checkUploadsFolderExist = () => {
  ;[UPLOAD_TEMP_IMAGE_DIR, UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR].map((DIR) => {
    if (!fs.existsSync(DIR))
      fs.mkdirSync(DIR, {
        recursive: true
      })
  })
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_IMAGE_DIR,
    keepExtensions: true,
    maxFiles: 4,
    maxFileSize: 3000 * 1024,
    maxTotalFileSize: 4 * 3000 * 1024, // 3000kb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) form.emit('error' as any, new Error('File type is not valid') as any)
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files?.image)) reject(new Error('File image not found'))
      resolve(files?.image as File[])
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const name = fullName.split('.')
  name.pop()
  return name.join('.')
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 100 * 1024 * 1024, //100mb

    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if (!valid) form.emit('error' as any, new Error('File type is not valid') as any)
      return valid
    }
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files?.video)) reject(new Error('File video not found'))
      resolve((files?.video as unknown as File[])[0])
    })
  })
}

export const getExtensionName = (fullName: string) => {
  const nameArr = fullName.split('.')
  return nameArr[nameArr.length - 1]
}

export const handleUploadVideoHls = async (req: Request) => {
  const id = nanoid()
  const folderPath = path.resolve(UPLOAD_VIDEO_DIR, id)
  fs.mkdirSync(folderPath)
  const form = formidable({
    uploadDir: folderPath,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 100 * 1024 * 1024, //100mb

    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if (!valid) form.emit('error' as any, new Error('File type is not valid') as any)
      return valid
    },
    filename: (name, originalFilename) => `${id}.${getExtensionName(originalFilename)}`
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files?.video)) reject(new Error('File video not found'))
      resolve((files?.video as unknown as File[])[0])
    })
  })
}
