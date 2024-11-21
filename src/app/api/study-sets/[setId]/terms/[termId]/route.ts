import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StudySet } from '@/models/study-set'

export async function PATCH(
  req: Request,
  { params }: { params: { setId: string; termId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const { mastered } = await req.json()

    const studySet = await StudySet.findOneAndUpdate(
      {
        _id: params.setId,
        userId: session.id,
        'terms._id': params.termId
      },
      {
        $set: {
          'terms.$.mastered': mastered,
          'terms.$.lastReviewed': new Date()
        }
      },
      { new: true }
    )

    if (!studySet) {
      return NextResponse.json(
        { error: 'Study set or term not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      studySet
    })
  } catch (error) {
    console.error('Error updating term:', error)
    return NextResponse.json(
      { error: 'Failed to update term' },
      { status: 500 }
    )
  }
}