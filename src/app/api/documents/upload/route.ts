import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { FileService } from '@/lib/fileService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create unique filename with UUID
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filepath = `/uploads/${filename}`;
    const fullPath = path.join(process.cwd(), 'public', 'uploads');

    // Ensure uploads directory exists
    try {
      await fs.access(fullPath);
    } catch {
      await fs.mkdir(fullPath, { recursive: true });
    }

    // Save file to uploads folder
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(fullPath, filename), buffer);

    // Create file record using FileService
    const fileDoc = await FileService.createFile({
      userId: session.user.id,
      name: file.name,
      path: filepath,
      size: buffer.length,
      type: file.type,
      uploadedAt: new Date(),
      isDeleted: false
    });

    console.log('Created file document:', fileDoc); // Add logging

    return NextResponse.json({ 
      success: true,
      file: fileDoc
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
} 