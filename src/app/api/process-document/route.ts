import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createWorker } from 'tesseract.js';
import * as mammoth from 'mammoth';
import { FileService } from '@/lib/fileService';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Change runtime to nodejs since we need file system access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    // Use pdfjs-dist for PDF parsing
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    try {
      // Load and parse PDF using pdfjs-dist
      const loadingTask = pdfjsLib.getDocument(documentId);
      const pdf = await loadingTask.promise;
      
      let content = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        content += textContent.items.map((item: any) => item.str).join(' ') + '\n';
      }

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
