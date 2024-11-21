import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { FileService } from '@/lib/fileService';
import fs from 'fs/promises';

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

    // Create unique filename
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

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(fullPath, filename), buffer);

    // Create file asset record
    const fileAsset = await FileService.createFile({
      userId: session.user.id,
      documentId: timestamp.toString(),
      originalName: file.name,
      fileName: filename,
      filePath: filepath,
      fileType: 'pdf',
      fileSize: buffer.length,
      uploadDate: new Date(),
      lastAccessed: new Date(),
      isProcessed: false,
      processingStatus: 'pending',
      metadata: {
        mimeType: file.type,
        encoding: 'utf-8'
      },
      tags: [],
      isArchived: false,
      isDeleted: false
    });

    // Start processing immediately
    try {
      const processResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rag_chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: filepath,
          message: 'Initialize processing'
        }),
      });

      if (!processResponse.ok) {
        console.error('Failed to start processing:', await processResponse.text());
      }
    } catch (error) {
      console.error('Error starting processing:', error);
    }

    return NextResponse.json({ 
      fileAsset,
      status: 'processing',
      message: 'File uploaded and processing started'
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
} 