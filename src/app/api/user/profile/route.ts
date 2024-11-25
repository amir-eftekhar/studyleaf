import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Only exclude password, include everything else
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

    // Get user's study sets
    const studySets = await db.collection('studySets')
      .find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .toArray()

    // Get user's saved sets
    const savedSets = await db.collection('savedSets')
      .find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .toArray()

    // Combine all user data
    const userData = {
      ...user,
      id: user._id.toString(),
      studySets,
      savedSets,
      studyPreferences: user.studyPreferences || {
        dailyGoal: 30,
        preferredStudyTime: 'morning',
        reminderFrequency: 'daily',
        studySessionDuration: 25,
        focusAreas: [],
        preferredLearningStyle: 'visual',
        dailyStudyTime: 60,
        difficultyLevel: 'intermediate'
      }
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Error fetching user profile' },
      { status: 500 }
    )
  }
}