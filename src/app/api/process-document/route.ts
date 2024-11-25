import { NextResponse } from 'next/server';
import { getProcessingStatus, setupVectorSearch, updateProcessingStatus, insertEmbedding } from '@/lib/vectorDb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { FileService } from '@/lib/fileService';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to generate embeddings
async function generateEmbedding(text: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// Helper function to split text into sections
function splitIntoSections(text: string, maxLength: number = 1000): string[] {
  const sections = text.split(/(?:\r?\n){2,}/).filter(Boolean);
  const result: string[] = [];
  
  let currentSection = '';
  for (const section of sections) {
    if (currentSection.length + section.length > maxLength) {
      if (currentSection) result.push(currentSection.trim());
      currentSection = section;
    } else {
      currentSection += (currentSection ? '\n\n' : '') + section;
    }
  }
  
  if (currentSection) result.push(currentSection.trim());
  return result;
}

export async function POST(request: Request) {
  try {
    const { documentId, startProcessing } = await request.json();
    console.log('Processing document:', documentId, 'startProcessing:', startProcessing);

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Clean up the file path
    const normalizedPath = documentId.replace(/%20/g, ' ').replace(/\+/g, ' ');
    const cleanPath = normalizedPath.startsWith('/uploads/') 
      ? normalizedPath.slice(1) 
      : normalizedPath.startsWith('uploads/') 
        ? normalizedPath 
        : `uploads/${normalizedPath}`;

    const filePath = path.join(process.cwd(), 'public', cleanPath);
    console.log('Looking for file at:', filePath);

    try {
      // Check if file exists
      await fs.access(filePath);
      console.log('File found at:', filePath);
    } catch (error) {
      console.error('File not found at path:', filePath);
      return NextResponse.json({ 
        error: 'File not found',
        details: filePath,
        status: 'error'
      }, { status: 404 });
    }

    try {
      // Read and parse PDF
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const content = pdfData.text;

      if (!content) {
        throw new Error('Failed to extract text from PDF');
      }

      // Process the content
      const sections = splitIntoSections(content);
      console.log(`Processing ${sections.length} sections`);

      // Update status to completed
      await updateProcessingStatus(documentId, 'completed', sections.length);

      return NextResponse.json({ 
        status: 'completed',
        message: 'Document processed successfully',
        sections: sections.length
      });

    } catch (error) {
      console.error('Error processing document:', error);
      await updateProcessingStatus(
        documentId, 
        'error', 
        undefined, 
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  } catch (error) {
    console.error('Error in process-document endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const status = await getProcessingStatus(documentId);
    
    return NextResponse.json({
      status: status?.status || 'pending',
      processedSections: status?.processedSections || 0,
      totalSections: status?.totalSections || 0,
      error: status?.error
    });
  } catch (error) {
    console.error('Error checking processing status:', error);
    return NextResponse.json({ 
      error: 'Failed to check processing status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
