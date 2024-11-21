import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { signJWT } from '@/lib/auth/utils'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log('Login attempt for:', email)

    const { db } = await connectToDatabase()
    
    // Find user
    const user = await db.collection('users').findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create token
    const token = signJWT(
      { userId: user._id, email: user.email },
      { expiresIn: '1d' }
    )

    // Set cookie and redirect
    const response = NextResponse.json({ 
      success: true,
      user: { 
        id: user._id,
        email: user.email,
        name: user.name 
      }
    })

    // Set auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 1 day
    })

    return response

  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 