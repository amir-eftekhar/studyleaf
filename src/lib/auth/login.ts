import bcrypt from 'bcrypt'
import { User } from '@/models/user'
import { connectToDatabase } from '../mongodb'
import { signJWT } from '../auth'

export async function login(email: string, password: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ email })
    
    if (!user) {
      throw new Error('User not found')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    const token = await signJWT({
      id: user._id,
      email: user.email,
      name: user.name,
    })

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      token
    }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
} 