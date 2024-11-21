import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function signJWT(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  })
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
