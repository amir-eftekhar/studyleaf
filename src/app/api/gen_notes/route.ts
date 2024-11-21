import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getVectorStore, getProcessingStatus } from '@/lib/vectorDb';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { documentId, pageRange, focus } = body;

    if (!documentId) {
      console.log('Missing documentId');
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    if (!pageRange || !Array.isArray(pageRange) || pageRange.length !== 2) {
      console.log('Invalid page range:', pageRange);
      return NextResponse.json({ error: 'Valid page range is required' }, { status: 400 });
    }

    // Check processing status first
    const processingStatus = await getProcessingStatus(documentId);
    console.log('Processing status:', processingStatus);

    if (!processingStatus || processingStatus.status === 'pending') {
      return NextResponse.json(
        { 
          error: 'Document is not yet processed',
          status: 'pending',
          message: 'Please wait while we process your document.'
        },
        { status: 202 }
      );
    }

    if (processingStatus.status === 'processing') {
      return NextResponse.json(
        { 
          error: 'Document is still being processed',
          status: 'processing',
          progress: (processingStatus.processedSections / processingStatus.totalSections) * 100,
          message: 'Document is being processed. Please wait.'
        },
        { status: 202 }
      );
    }

    if (processingStatus.status === 'error') {
      return NextResponse.json(
        { 
          error: processingStatus.error || 'Document processing failed',
          status: 'error'
        },
        { status: 500 }
      );
    }
    
    // Get the vector store instance
    console.log('Getting vector store for document:', documentId);
    const vectorStore = await getVectorStore(documentId);
    
    // Get content for the specified page range
    console.log('Retrieving content for pages:', pageRange);
    const content = await vectorStore.getContentForPages(pageRange[0], pageRange[1]);
    
    if (!content) {
      console.log('No content found for page range:', pageRange);
      return NextResponse.json({ 
        error: 'No content found for the specified page range' 
      }, { status: 404 });
    }

    console.log('Generating notes with content length:', content.length);
    const model = genAI.getGenerativeModel({ model: "gemini-" });

    const prompt = `Generate detailed study notes for the following text${focus ? ` focusing on ${focus}` : ''}. 
    Format the notes in markdown with:
    - Clear hierarchical headings
    - Bullet points for key concepts
    - Bold text for important terms
    - Numbered lists for steps or sequences
    - Brief summary at the end

    Content to analyze:
    ${content}

    Please ensure the notes are well-structured and academically focused.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const notes = response.text();

    console.log('Successfully generated notes');
    return NextResponse.json({ notes });

  } catch (error) {
    console.error('Error generating notes:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
  }

  try {
    const processingStatus = await getProcessingStatus(documentId);
    return NextResponse.json({ status: processingStatus });
  } catch (error) {
    console.error('Error getting notes status:', error);
    return NextResponse.json({ error: 'Failed to get notes status' }, { status: 500 });
  }
}
