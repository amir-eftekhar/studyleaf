import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVectorStore } from '@/lib/vectorDb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import { headers } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function generateEmbedding(text: string) {
  console.log('Generating embedding for:', text.substring(0, 50) + '...');
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await embeddingModel.embedContent(text);
  const embedding = result.embedding;
  console.log('Embedding generated, length:', embedding.values.length);
  return embedding.values;
}

function splitIntoSections(text: string, maxLength: number = 1000): string[] {
  // First, split by common section markers
  const sectionMarkers = /(?:Chapter|Section|\d+\.)\s+[A-Z]/g;
  let sections = text.split(sectionMarkers);
  
  // If no natural sections found, split by paragraphs
  if (sections.length <= 1) {
    sections = text.split(/\n\s*\n/);
  }

  // Further split long sections
  const result: string[] = [];
  for (const section of sections) {
    if (section.trim().length === 0) continue;
    
    if (section.length <= maxLength) {
      result.push(section.trim());
      continue;
    }

    // Split long sections by sentences
    const sentences = section.match(/[^.!?]+[.!?]+/g) || [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk.trim()) {
          result.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk.trim()) {
      result.push(currentChunk.trim());
    }
  }

  return result.filter(section => section.length >= 50); // Filter out very short sections
}

export async function POST(request: Request) {
  console.log('Starting document processing...');
  try {
    // Check authorization header
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ') || authHeader.split(' ')[1] !== process.env.NEXTAUTH_SECRET) {
      console.log('Unauthorized request - invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await request.json();
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Check if document is already processed
    const vectorStore = await getVectorStore(documentId);
    const existingStatus = await vectorStore.getStatus(documentId);
    
    if (existingStatus && existingStatus.status === 'completed') {
      console.log('Document already processed:', documentId);
      return NextResponse.json({ 
        success: true,
        message: 'Document already processed',
        totalSections: existingStatus.totalSections,
        processedSections: existingStatus.processedSections
      });
    }

    // Initialize or update processing status
    const status = {
      documentId,
      status: 'processing',
      startedAt: new Date(),
      updatedAt: new Date(),
      error: null
    };
    
    await vectorStore.updateStatus(status);

    // Load and process the PDF
    console.log('Loading PDF:', documentId);
    const response = await fetch(documentId);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const pdfData = await response.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    console.log('PDF loaded, pages:', numPages);

    let processedPages = 0;

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${numPages}`);
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const content = textContent.items.map((item: any) => item.str).join(' ');

        if (content.trim()) {
          // Generate embedding and store content
          const embedding = await generateEmbedding(content);
          await vectorStore.insertEmbedding(content, embedding);
          processedPages++;
          
          // Update processing status
          await vectorStore.updateStatus({
            documentId,
            processedPages,
            totalPages: numPages,
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error(`Error processing page ${pageNum}:`, error);
        // Continue with other pages
      }
    }

    // Update final status
    await vectorStore.updateStatus({
      documentId,
      status: 'completed',
      processedPages,
      totalPages: numPages,
      completedAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true,
      processedPages,
      totalPages: numPages,
      message: 'Document processed successfully'
    });

  } catch (error) {
    console.error('Processing error:', error);
    
    // Update error status
    const vectorStore = await getVectorStore(documentId);
    await vectorStore.updateStatus({
      documentId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: new Date()
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing document' },
      { status: 500 }
    );
  }
}
