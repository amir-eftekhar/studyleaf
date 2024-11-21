import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MongoClient, ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

// GET /api/classes/[classId] - Get a single class with its study sets
export async function GET(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classId = params.classId;

    await client.connect();
    const db = client.db('studyleaf');
    
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the class with its study sets using aggregation
    const classWithSets = await db.collection('classes')
      .aggregate([
        { 
          $match: { 
            _id: new ObjectId(classId),
            userId: user._id
          }
        },
        {
          $lookup: {
            from: 'studysets',
            localField: 'studySetIds',
            foreignField: '_id',
            as: 'studySets'
          }
        }
      ])
      .next();

    if (!classWithSets) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(classWithSets);
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Error fetching class' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// DELETE /api/classes/[classId] - Delete a class
export async function DELETE(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classId = params.classId;

    await client.connect();
    const db = client.db('studyleaf');
    
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await db.collection('classes').deleteOne({
      _id: new ObjectId(classId),
      userId: user._id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Error deleting class' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
