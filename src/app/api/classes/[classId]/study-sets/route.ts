import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MongoClient, ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

// POST /api/classes/[classId]/study-sets - Add study sets to a class
export async function POST(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studySetIds } = await req.json();
    const classId = params.classId;

    await client.connect();
    const db = client.db('studyleaf');
    
    // Verify user owns the class
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const classDoc = await db.collection('classes').findOne({
      _id: new ObjectId(classId),
      userId: user._id
    });

    if (!classDoc) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Add study sets to class
    const result = await db.collection('classes').updateOne(
      { _id: new ObjectId(classId) },
      { 
        $addToSet: { 
          studySetIds: { 
            $each: studySetIds.map((id: string) => new ObjectId(id))
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    // Get updated class with study sets
    const updatedClass = await db.collection('classes')
      .aggregate([
        { $match: { _id: new ObjectId(classId) } },
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

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error adding study sets to class:', error);
    return NextResponse.json(
      { error: 'Error adding study sets to class' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// DELETE /api/classes/[classId]/study-sets - Remove study sets from a class
export async function DELETE(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studySetIds } = await req.json();
    const classId = params.classId;

    await client.connect();
    const db = client.db('studyleaf');
    
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await db.collection('classes').updateOne(
      { 
        _id: new ObjectId(classId),
        userId: user._id
      },
      { 
        $pull: { 
          studySetIds: { 
            $in: studySetIds.map((id: string) => new ObjectId(id))
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Get updated class with study sets
    const updatedClass = await db.collection('classes')
      .aggregate([
        { $match: { _id: new ObjectId(classId) } },
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

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error removing study sets from class:', error);
    return NextResponse.json(
      { error: 'Error removing study sets from class' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
