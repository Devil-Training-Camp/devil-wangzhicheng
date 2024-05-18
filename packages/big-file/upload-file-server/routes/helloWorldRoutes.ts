import Router from '@koa/router'
import { helloWorld } from '../controllers/helloWorldController'

const router = new Router()
router.get('/', helloWorld)

export default router
