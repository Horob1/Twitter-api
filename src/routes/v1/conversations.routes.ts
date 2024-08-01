import { Router } from 'express'
import { createConversationController, getConversationController } from '~/controllers/conversations.controllers'
import { createConversationValidator, getConversationValidator } from '~/middlewares/conversations.middlewares'
import { validate } from '~/utils/validation'

const router = Router()

/**
 * Description: Create new conversation
 * Method: POST
 * Path: /:user_id
 * Parameters: {user_id: string}
 */
router.post('/:user_id', validate(createConversationValidator), createConversationController)

/**
 * Description: Get conversation
 * Method: GET
 * Path: /:conversation_id
 * Parameters: {conversation_id: string}
 * Query Parameters: {limit, page}
 */
router.get('/:conversation_id', validate(getConversationValidator), getConversationController)
export default router
