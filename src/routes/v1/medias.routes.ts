import { Router } from 'express'
import {
  getVideoStatusController,
  uploadImageController,
  uploadVideoController,
  uploadVideoHlsController
} from '~/controllers/medias.controllers'

const router = Router()

router.post('/upload-images', uploadImageController)
router.post('/upload-video', uploadVideoController)
router.post('/upload-video-hls', uploadVideoHlsController)
router.get('/video-status/:name', getVideoStatusController)

export default router
