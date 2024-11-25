import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    try {
      const user = await db.collection('users').findOne(
        { email: session.user.email },
        { projection: { password: 0 } }
      )

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(user)
    } catch (dbError) {
      console.error('Database query error:', dbError)
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in /api/user/me:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 