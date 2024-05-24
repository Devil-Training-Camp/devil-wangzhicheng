import Router from '@koa/router'
import {
  checkFileExists,
  uploadChunk,
  mergeFile
} from '@src/controllers/filesController'
import { koaBody } from 'koa-body'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'

const router = new Router()

router.get('/files/checkFileExists', checkFileExists)

router.post(
  '/files/uploadChunk',
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: UPLOAD_FOLDER_PATH
    }
  }),
  uploadChunk
)

router.post('/files/mergeFile', mergeFile)

export default router
