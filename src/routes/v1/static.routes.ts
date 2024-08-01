import { Router } from 'express'
import {
  servingStaticImageController,
  servingStaticVideoController,
  servingStaticM3U8Controller,
  servingStaticVideoHlsController
} from '~/controllers/medias.controllers'

const router = Router()

router.get('/images/:name', servingStaticImageController)
router.get('/videos/:name', servingStaticVideoController)
router.get('/hls/:name/master.m3u8', servingStaticM3U8Controller)
router.get('/hls/:name/:v/:segment', servingStaticVideoHlsController)
export default router
