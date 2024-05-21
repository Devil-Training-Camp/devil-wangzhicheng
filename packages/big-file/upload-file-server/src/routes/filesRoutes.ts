import Router from '@koa/router'
import { checkFileExists, uploadChunk } from '@src/controllers/filesController'

const router = new Router()

router.get('/files/checkFileExists', checkFileExists)

router.post('/files/uploadChunk', uploadChunk)

export default router
