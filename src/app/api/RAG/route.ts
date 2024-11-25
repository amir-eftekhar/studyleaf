import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { setupVectorSearch, insertEmbedding, updateProcessingStatus, getVectorStore } from '@/lib/vectorDb';
import { connectToDatabase } from '@/lib/mongodb';

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

    // First, check if embeddings already exist
    const existingEmbeddings = await getVectorStore(documentId);
    if (existingEmbeddings && existingEmbeddings.length > 0) {
      console.log(`Found existing embeddings for document ${documentId}`);
      return NextResponse.json({ 
        success: true,
        message: 'Document already processed',
        totalSections: existingEmbeddings.length,
        processedSections: existingEmbeddings.length
      });
    }

    // Get database connection
    const { db } = await connectToDatabase();
    
    // Check processing status
    const statusCollection = db.collection('processing_status');
    const existingStatus = await statusCollection.findOne({ documentId });
    
    if (existingStatus?.status === 'processing') {
      console.log(`Document ${documentId} is already being processed`);
      return NextResponse.json({ 
        success: true,
        message: 'Document processing in progress',
        totalSections: existingStatus.totalSections,
        processedSections: existingStatus.processedSections
      });
    }

    // Initialize vector search and processing status
    await setupVectorSearch(documentId);
    
    // Split and process document
    const sections = splitIntoSections(documentContent);
    if (sections.length === 0) {
      throw new Error('No valid sections found in document');
    }

    console.log(`Processing ${sections.length} sections...`);
    await updateProcessingStatus(documentId, 'processing', sections.length, 0);

    // Process sections sequentially
    let processedCount = 0;
    for (const section of sections) {
      try {
        const embedding = await generateEmbedding(section);
        await insertEmbedding(documentId, section, embedding, processedCount + 1);
        processedCount++;
        await updateProcessingStatus(documentId, 'processing', sections.length, processedCount);
        console.log(`Processed section ${processedCount}/${sections.length}`);
      } catch (error) {
        console.error('Error processing section:', error);
        throw error;
      }
    }

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