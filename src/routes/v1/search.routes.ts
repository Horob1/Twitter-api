import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { searchValidator } from '~/middlewares/search.middlewares'
import { validate } from '~/utils/validation'

const router = Router()

/**
 * Description: Search tweet
 * Path: /
 * Method: GET
 * Parameters: { }
 */
router.get('/', validate(searchValidator), searchController)
export default router
