import { NextRequest, NextResponse } from 'next/server';
import { getProcessingStatus } from '@/lib/vectorDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Extract just the filename part after /uploads/
    const match = documentId.match(/\/uploads\/(.+)$/);
    const cleanDocumentId = match ? match[1] : documentId;

    console.log('Checking processing status for:', cleanDocumentId);

    const status = await getProcessingStatus(cleanDocumentId);
    
    if (!status) {
      return NextResponse.json({
        documentId: cleanDocumentId,
        status: 'pending',
        processedSections: 0,
        totalSections: 0,
        updatedAt: new Date()
      });
    }

    return NextResponse.json(status);

  } catch (error) {
    console.error('Error checking processing status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
