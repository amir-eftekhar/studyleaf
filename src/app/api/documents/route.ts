import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FileService } from '@/lib/fileService';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all documents for the user
    const documents = await FileService.getFilesByUser(session.user.id);

    // Transform the documents to match the expected format in the library
    const transformedDocuments = documents.map(doc => ({
      id: doc._id,
      name: doc.originalName,
      type: doc.fileType,
      size: doc.fileSize,
      lastModified: doc.lastAccessed,
      url: doc.filePath,
      status: doc.processingStatus,
      processingProgress: 0, // You might want to calculate this based on your processing status
      uploadDate: doc.uploadDate
    }));

    return NextResponse.json({ documents: transformedDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    await FileService.deleteFile(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 