export const USER_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_MUST_BE_BETWEEN_1_AND_100_CHARACTERS: 'Name must be between 1 and 100 characters',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_MUST_BE_A_VALID_EMAIL: 'Email must be a valid email',
  EMAIL_ALREADY_IN_USE: 'Email already in use',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_BETWEEN_8_AND_20_CHARACTERS: 'Password must be between 8 and 20 characters',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_MATCH_PASSWORD: 'Confirm password must match password',
  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
  DATE_OF_BIRTH_MUST_BE_A_VALID_ISO8601_DATE: 'Date of birth must be a valid ISO8601 date',
  USER_NOT_FOUND: 'Email or password is incorrect',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',
  LOGOUT_SUCCESS: 'Logout success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_INVALID: 'Access token is invalid',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_ARE_USED_OR_NOT_EXIST: 'Refresh token are used or not exist',
  REFRESH_TOKEN_SUCCESSFUL: 'User token refreshed successfully',
  SENDED_RESET_PASSWORD_EMAIL: 'Sended to your email to reset password',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  RESET_PASSWORD_SUCCESS: 'Password reset successfully',
  FORGOT_PASSWORD_TOKEN_IS_USED_OR_NOT_EXIST: 'Forgot password token is used or not exist',
  USER_FORBIDDEN: 'User is not allowed to do this action',
  USER_ID_IS_REQUIRED: 'User ID is required',
  FOLLOW_SUCCESS: 'User follow success',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_ALREADY_IN_USE: 'Username already in use',
  MUST_BE_A_URL: 'This field must be a URL',
  UNFOLLOW_SUCCESS: 'User unfollow success',
  CHANGE_PASSWORD_SUCCESS: 'User change password success',
  EMAIL_IS_NOT_VERIFIED: 'Email is not verified',
  FOUNDED_USER: 'Founded user',
  UPDATE_USER_SUCCESSFULLY: 'User update success',
  GET_USER_INFO_SUCCESSFULLY: 'Get user info success'
} as const

export const MEDIA_MESSAGE = {
  UPLOAD_SUCCESS: 'File uploaded successfully',
  NO_FILE_OR_PATH: 'No such file or directory',
  RANGE_IS_REQUIRED: 'REQUIRES RANGE HEADER',
  WAITING_FOR_ENCODING: 'Wait for encoding',
  ENCODING_IN_PROGRESS: 'Encoding already in progress',
  ENCODING_SUCCESSFUL: 'File uploaded successfully uploaded',
  ENCODING_FAILED: 'Encoding is failed',
  UNKNOWN_ERROR: 'Unknown error'
} as const

export const TWEET_MESSAGE = {
  TWEET_TYPE_MUST_BE_MATCH_WITH_TYPE: 'Tweet type must be match with a specific type in TweetType enum',
  TWEET_TYPE_IS_REQUIRED: 'Tweet type is required',
  TWEET_AUDIENCE_IS_REQUIRED: 'Tweet audience is required',
  TWEET_AUDIENCE_MUST_BE_MATCH_WITH_SPECIFIC_TYPE: 'Tweet audience must be a specific type in TweetType enum',
  TWEET_PARENT_ID_IS_REQUIRED: 'Tweet parent id must be required',
  TWEET_PARENT_ID_IS_NULL: 'Tweet parent id must be null',
  TWEET_CONTENT_IS_REQUIRED: 'Tweet content type must be required',
  TWEET_CONTENT_MUST_BE_NULL: 'Tweet content type must be null',
  TWEET_HASHTAG_MUST_BE_A_STRING: 'Tweet hashtag must be a string',
  TWEET_MENTION_MUST_BE_VALID_ID: 'Tweet mention must be a valid id',
  TWEET_MEDIA_MUST_BE_VALID_MEDIA_OBJ: 'Tweet media must be a valid media object',
  CREATED_TWEET_SUCCESSFULLY: 'Tweet created successfully',
  BOOKMARK_TWEET_SUCCESSFULLY: 'Tweet bookmark successfully created successfully',
  TWEET_ID_IS_REQUIRED: 'Tweet id must be required',
  TWEET_NOT_FOUND: 'Tweet not found',
  DELETE_BOOKMARK_SUCCESSFULLY: 'Delete bookmark successfully',
  LIKE_TWEET_SUCCESSFULLY: 'Like tweet successfully',
  DELETE_LIKE_SUCCESSFULLY: 'Delete tweet successfully',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  GET_TWEET_SUCCESSFULLY: 'Get tweet successfully',
  MEDIA_TYPE_MUST_BE_MATCH_WITH_TYPE: 'Media type must be a valid media type',
  OF_MUST_BE_REQUIRED: 'Only followers option must be required',
  OF_MUST_BE_MATCH_WITH_TYPE: 'Only followers option must be a valid type'
} as const

export const PAGINATION_MESSAGE = {
  LIMIT_IS_REQUIRED: 'Limit is required',
  LIMIT_MUST_BE_POSITIVE_INTEGER: 'Limit must be positive integer and must be less than one hundred',
  PAGE_IS_REQUIRED: 'Page must be required',
  PAGE_MUST_BE_POSITIVE_INTEGER: 'Page must be positive integer'
} as const

export const CONVERSATION_MESSAGE = {
  CONVERSATION_CREATED: 'Conversation created successfully',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  CONVERSATION_ID_MUST_REQUIRED: 'Conversation ID must be provided',
  GET_CONVERSATION_SUCCESSFULLY: 'Get conversation successfully'
} as const
