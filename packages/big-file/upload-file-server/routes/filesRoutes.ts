import Router from '@koa/router'
import { checkFileExists } from '../controllers/filesController'

const router = new Router()
router.get('/files/checkFileExists', checkFileExists)

export default router
