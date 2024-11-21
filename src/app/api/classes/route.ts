import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MongoClient, ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

// GET /api/classes - Get all classes for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await client.connect();
    const db = client.db('studyleaf');
    
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const classes = await db.collection('classes')
      .aggregate([
        {
          $match: { userId: user._id }
        },
        {
          $lookup: {
            from: 'studysets',
            localField: 'studySetIds',
            foreignField: '_id',
            as: 'studySets'
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Error fetching classes' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// POST /api/classes - Create a new class
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    await client.connect();
    const db = client.db('studyleaf');
    
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newClass = await db.collection('classes').insertOne({
      name,
      description,
      userId: user._id,
      studySetIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      _id: newClass.insertedId,
      name,
      description,
      userId: user._id,
      studySetIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Error creating class' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 