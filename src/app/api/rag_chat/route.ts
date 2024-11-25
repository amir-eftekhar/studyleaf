import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore, generateEmbedding, EmbeddingDocument } from '@/lib/vectorDb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MongoClient } from 'mongodb';
import { cosineSimilarity } from '@/lib/utils';

const client = new MongoClient(process.env.MONGODB_URI!);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const responseCache = new Map<string, string>();
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash-latest",
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 500,
  }
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ChatRequest {
  documentId: string;
  content?: string;
  message?: string;
}

interface SearchResult {
  content: string;
  score: number;
}

async function findRelevantSections(query: string, documents: EmbeddingDocument[], topK: number = 3): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // Calculate similarity scores
    const scoredDocs = documents.map(doc => ({
      content: doc.content,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    // Sort by similarity score and get top K results
    return scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  } catch (error) {
    console.error('Error in similarity search:', error);
    throw error;
  }
}

async function generateResponse(query: string, context: string[]): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    // For regular queries
    const prompt = `
      You are an expert tutor. Based on this content:
      ---------------------
      ${context.join('\n\n')}
      ---------------------

      Question: ${query}
      
      Instructions:
      1. Base your answer ONLY on the provided content, not on general knowledge
      2. Use direct references from the content to support your answer
      3. Format your response in markdown:
         - Use **bold** for key terms and concepts
         - Use bullet points for lists
         - Include specific examples from the content
         - Use quotes when directly citing the content
      4. Make your explanation clear and appropriate for a student
      5. If relevant, explain how this connects to other concepts mentioned in the content
      6. If you cannot find the answer in the content, say so clearly
      
      Provide a well-structured response that shows understanding of the specific concepts from this document.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { documentId, message } = await request.json();
    console.log('Processing chat request:', { documentId, messageLength: message?.length });

    if (!documentId || !message?.trim()) {
      return NextResponse.json({ error: 'Document ID and message are required' }, { status: 400 });
    }

    // Get stored embeddings
    const documents = await getVectorStore(documentId);
    if (!documents || documents.length === 0) {
      return NextResponse.json({ error: 'Document not found or not processed' }, { status: 404 });
    }

    try {
      // Find relevant sections
      const searchResults = await findRelevantSections(message, documents);
      
      if (searchResults.length === 0) {
        return NextResponse.json({ 
          response: "I couldn't find relevant information. Please rephrase your question."
        });
      }

      // Build context from search results
      const context = searchResults.map(result => result.content);

      // Generate response using the context
      const response = await generateResponse(message, context);
      
      return NextResponse.json({ response });

    } catch (error) {
      console.error('Error in chat processing:', error);
      return NextResponse.json({ 
        error: 'Error processing chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in RAG chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' });
}