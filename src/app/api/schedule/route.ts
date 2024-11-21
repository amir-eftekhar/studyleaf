import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/schedule - Get all schedule events for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const events = await db.collection('schedule')
      .find({ userId: user._id })
      .sort({ start: 1 })
      .toArray();

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching schedule events:', error);
    return NextResponse.json(
      { error: 'Error fetching schedule events' },
      { status: 500 }
    );
  }
}

// POST /api/schedule - Create a new schedule event
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, start, end, studySetId, allDay } = await req.json();

    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If studySetId is provided, verify it exists and belongs to the user
    if (studySetId) {
      const studySet = await db.collection('studysets').findOne({
        _id: new ObjectId(studySetId),
        userId: user._id
      });

      if (!studySet) {
        return NextResponse.json({ error: 'Study set not found' }, { status: 404 });
      }
    }

    const newEvent = await db.collection('schedule').insertOne({
      userId: user._id,
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      studySetId: studySetId ? new ObjectId(studySetId) : null,
      allDay: allDay || false,
      color: studySetId ? '#4F46E5' : '#10B981', // Indigo for study sets, Emerald for regular events
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const event = {
      _id: newEvent.insertedId,
      userId: user._id,
      title,
      description,
      start,
      end,
      studySetId,
      allDay: allDay || false,
      color: studySetId ? '#4F46E5' : '#10B981',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating schedule event:', error);
    return NextResponse.json(
      { error: 'Error creating schedule event' },
      { status: 500 }
    );
  }
}

// DELETE /api/schedule - Delete a schedule event
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await req.json();

    const { db } = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await db.collection('schedule').deleteOne({
      _id: new ObjectId(eventId),
      userId: user._id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule event:', error);
    return NextResponse.json(
      { error: 'Error deleting schedule event' },
      { status: 500 }
    );
  }
}
