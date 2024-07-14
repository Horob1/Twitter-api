import { getDB } from '~/config/mongodb'
import { User } from '~/models/schemas/user.schema'

const USER_COLLECTION_NAME = 'users'

class UsersService {
  async register(payload: { email: string; password: string; name: string; date_of_birth: Date }) {
    return await getDB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(new User({ email: payload.email, password: payload.password }))
  }

  async checkExist(email: string) {
    const user = await getDB().collection(USER_COLLECTION_NAME).findOne({ email })
    if (user) return true
    return false
  }
}

export const usersService = new UsersService()
