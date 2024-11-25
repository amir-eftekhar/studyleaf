import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSignedFileUrl } from '@/lib/s3';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const files = await db.collection('files')
      .find({ userId: session.user.id })
      .toArray();

    // Generate signed URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        ...file,
        signedUrl: await getSignedFileUrl(file.fileName)
      }))
    );

    return NextResponse.json(filesWithUrls);

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Error fetching files' }, 
      { status: 500 }
    );
  }
} 