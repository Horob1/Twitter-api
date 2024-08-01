import { validate } from './../../utils/validation'
import { Router } from 'express'
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getUserIdController,
  loginController,
  logoutController,
  oauthGoogleController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateProfileReqBody } from '~/models/requests/user.requests'

const router = Router()

/**
 * Description: User login
 * Path: /login
 * Method: POST
 * Body: {email: string, password: string}
 */
router.post('/login', validate(loginValidator), loginController)

/**
 * Description: Register new user
 * Patch: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
router.post('/register', validate(registerValidator), registerController)

/**
 * Description: Logout
 * Path: /logout
 * Method: POST
 * Headers: {Authorization: string}
 * Body: {refresh_token: string}
 */
router.post('/logout', validate(accessTokenValidator), validate(refreshTokenValidator), logoutController)

/**
 * Description: Get new access token and refresh token
 * Path: /refresh_token
 * Method: POST
 * Body: {refresh_token: string}
 */
router.post('/refresh_token', validate(refreshTokenValidator), refreshTokenController)

/**
 * Description: Verify email address
 * Path: /verify_email/:verify_email_token
 * Method: GET
 * Parameters: verify_email_token
 */
router.get('/verify_email/:verify_email_token', verifyEmailController)

/**
 * Description: Resend verify email
 * Path: /resend_verify_email
 * Method: GET
 * Parameters: verify_email_token
 */
router.get('/resend_verify_email/:verify_email_token', resendVerifyEmailController)

/**
 * Description: Forgot password
 * Path: /forgot_password
 * Method: POST
 * Body: { email: string}
 */
router.post('/forgot_password', validate(forgotPasswordValidator), forgotPasswordController)

/**
 * Description: Verify forgot password token
 * Path: /verify_forgot_password
 * Method: GET
 * Parameters: forget_password_token
 */
// router.get('/verify_forgot_password/:forgot_password_token', verifyForgotPasswordController)

/**
 * Description: Reset password
 * Path: /reset_password
 * Method: POST
 * Body: {password: string, confirm_password: string, forgot_password_token: string}
 */
router.post('/reset_password', validate(resetPasswordValidator), resetPasswordController)

/**
 * Description: get your information
 * Path: /me
 * Method: GET
 * Headers { Authorization: string}
 */
router.get('/me', validate(accessTokenValidator), getMeController)

/**
 * Description: update your information
 * Path: /me
 * Method: PATCH
 * body: {name: string, date_of_birth: ISO8601, bio: string, location: string, website: string, username: string, avatar: string, cover_photo: string}
 */
router.patch(
  '/update_me',
  validate(accessTokenValidator),
  verifyUserValidator,
  filterMiddleware<UpdateProfileReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  validate(updateMeValidator),
  updateMeController
)

/**
 * Description: change password
 * Path: /change_password
 * Method: PUT
 * body: { password: string, confirm_password: string, old_password: string}
 */

router.put(
  '/change_password',
  validate(accessTokenValidator),
  verifyUserValidator,
  validate(changePasswordValidator),
  changePasswordController
)

/**
 * Description: follow
 * Path: /follow
 * Method: POST
 * Headers { Authorization: string}
 * body: { follower_id: string }
 */
router.post('/follow', validate(accessTokenValidator), verifyUserValidator, validate(followValidator), followController)

/**
 * Description: unfollow user
 * Path: /unfollow/:follower_id
 * Method: DELETE
 * Headers { Authorization: string}
 * Parameters: { follower_id: string }
 */
router.delete(
  '/unfollow/:follower_id',
  validate(accessTokenValidator),
  verifyUserValidator,
  validate(unfollowValidator),
  unfollowController
)

/**
 * Description: Login with google account
 * Method: GET
 */
router.get('/oauth/google', oauthGoogleController)

/**
 * Description: get user id
 * Path: /:username
 * Method: GET
 * Parameters: {usernames: string}
 */
router.get('/:username', getUserIdController)

export default router
