import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FileService } from '@/lib/fileService';
import type { FileDocument } from '@/types/files';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id || (session.user as any).userId;
    if (!userId) {
      console.error('No user ID found in session:', session);
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    console.log('Fetching files for user:', userId);
    const files = await FileService.getFilesByUserId(userId);
    console.log('Found files:', files);
    
    if (!files || files.length === 0) {
      return NextResponse.json({ documents: [] });
    }

    const documents = files.map((file: FileDocument) => ({
      id: file._id,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.uploadedAt,
      url: file.path,
      status: 'completed',
      processingProgress: 100
    }));

    console.log('Transformed documents:', documents);
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 