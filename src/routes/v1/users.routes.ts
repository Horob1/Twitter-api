import { validate } from './../../utils/validation'
import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'

const router = Router()

router.post('/login', loginValidator, loginController)
/**
 * Description: Register new user
 * Patch: /register
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
router.post('/register', validate(registerValidator), registerController)

export default router
