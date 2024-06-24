import Router from '@koa/router'

import { koaBody } from 'koa-body'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import checkFileExistsController from '@src/controllers/checkFileExistsController'
import uploadChunkController from '@src/controllers/uploadChunkController'
import mergeFileController from '@src/controllers/mergeFileController'

const router = new Router()

router.get('/files/checkFileExists', checkFileExistsController)

router.post(
  '/files/uploadChunk',
  koaBody({
    multipart: true
  }),
  uploadChunkController
)

router.post('/files/mergeFile', mergeFileController)

export default router
