import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history, pdfUrl, fileType } = await req.json();

    if (!message || !pdfUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Store the chat message in MongoDB
    await db.collection('chats').insertOne({
      userId: session.user.id,
      message,
      pdfUrl,
      timestamp: new Date(),
    });

    // For now, return a simple response
    // TODO: Implement actual AI chat logic here
    const answer = `I received your message about ${pdfUrl}. You asked: ${message}`;

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
