import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { setupVectorSearch, insertEmbedding, updateProcessingStatus } from '@/lib/vectorDb';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

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
  let currentDocumentId: string | undefined;
  
  try {
    const { documentContent, documentId } = await request.json();
    currentDocumentId = documentId;

    if (!documentContent || !documentId) {
      return NextResponse.json({ error: 'Document content and ID are required' }, { status: 400 });
    }

    // Check if document is already processed
    const db = client.db('pdf_database');
    const statusCollection = db.collection('processing_status');
    const existingStatus = await statusCollection.findOne({ documentId });
    
    if (existingStatus && existingStatus.status === 'completed') {
      console.log('Document already processed:', documentId);
      return NextResponse.json({ 
        success: true,
        message: 'Document already processed',
        totalSections: existingStatus.totalSections,
        processedSections: existingStatus.processedSections
      });
    }

    // Initialize processing status only if not already processing
    if (!existingStatus || existingStatus.status === 'error') {
      await setupVectorSearch(documentId);
    } else if (existingStatus.status === 'processing') {
      return NextResponse.json({ 
        success: true,
        message: 'Document processing in progress',
        totalSections: existingStatus.totalSections,
        processedSections: existingStatus.processedSections
      });
    }

    // Split document into sections
    const sections = splitIntoSections(documentContent);
    if (sections.length === 0) {
      throw new Error('No valid sections found in document');
    }

    console.log(`Processing ${sections.length} sections...`);
    await updateProcessingStatus(documentId, 'processing', sections.length, 0);

    // Process sections in parallel with a concurrency limit
    const concurrencyLimit = 3;
    let processedCount = 0;

    for (let i = 0; i < sections.length; i += concurrencyLimit) {
      const chunk = sections.slice(i, Math.min(i + concurrencyLimit, sections.length));
      
      await Promise.all(chunk.map(async (section, index) => {
        try {
          const embedding = await generateEmbedding(section);
          await insertEmbedding(documentId, section, embedding, i + index + 1);
          processedCount++;
          await updateProcessingStatus(documentId, 'processing', sections.length, processedCount);
          console.log(`Processed section ${processedCount}/${sections.length}`);
        } catch (error) {
          console.error('Error processing section:', error);
          throw error;
        }
      }));
    }

    // Mark as completed
    await updateProcessingStatus(documentId, 'completed', sections.length, sections.length);
    console.log('Document processing completed successfully');

    return NextResponse.json({ 
      success: true,
      totalSections: sections.length,
      processedSections: sections.length
    });

  } catch (error) {
    console.error('Error in document processing:', error);
    if (currentDocumentId) {
      await updateProcessingStatus(
        currentDocumentId, 
        'error',
        0,
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
