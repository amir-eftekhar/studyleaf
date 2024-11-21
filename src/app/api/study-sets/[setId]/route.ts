import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(
  req: Request,
  { params }: { params: { setId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    const user = await db.collection('users').findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const studySet = await db.collection('studySets').findOne({
      _id: new ObjectId(params.setId),
      userId: user._id.toString()
    })

    if (!studySet) {
      return NextResponse.json(
        { error: 'Study set not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(studySet)
  } catch (error) {
    console.error('Error fetching study set:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study set' },
      { status: 500 }
    )
  }
} 