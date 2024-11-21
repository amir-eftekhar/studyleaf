import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { title, content, noteType, transcript } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Save the notes to the database
    const notes = await db.collection('notes').insertOne({
      title: title || 'Untitled Notes',
      content,
      noteType,
      transcript,
      userEmail: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Save notes error:', error);
    return NextResponse.json(
      { error: 'Failed to save notes' },
      { status: 500 }
    );
  }
}
