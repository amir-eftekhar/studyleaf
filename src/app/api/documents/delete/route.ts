import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { FileService } from '@/lib/fileService';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(request: Request) {
  try {
    const { fileId } = await request.json();
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete file from database
    await FileService.deleteFile(fileId, session.user.id);

    // Delete physical file
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.unlink(path.join(uploadsDir, fileId));
    } catch (error) {
      console.error('Error deleting physical file:', error);
      // Continue even if physical file deletion fails
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 