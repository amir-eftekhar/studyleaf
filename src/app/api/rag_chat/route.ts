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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // First, analyze the document context to determine its subject matter
    const analysisPrompt = `
      Analyze this content and tell me in one word what subject or field it's about:
      ${context.join('\n').substring(0, 1000)}
    `;
    
    const analysisResult = await model.generateContent(analysisPrompt);
    const subject = analysisResult.response.text().trim().toLowerCase();
    
    // If the query is asking for questions
    if (query.toLowerCase().includes('ask') && query.toLowerCase().includes('question')) {
      const prompt = `
        You are an expert ${subject} tutor. Based on this content:
        ---------------------
        ${context.join('\n\n')}
        ---------------------

        Generate 3-4 detailed questions that test understanding of the key concepts from this specific content.
        For each question:
        1. Write a clear, specific question about the content
        2. Explain why understanding this concept is important in ${subject}
        3. Provide the correct answer with a detailed explanation using examples from the content

        Format your response in markdown with:
        - Questions in bold
        - Important terms highlighted
        - Clear section breaks between questions
        - Numbered lists for multi-part explanations
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }
    
    // For regular queries
    const prompt = `
      You are an expert ${subject} tutor. Use this specific content to answer the question:
      ---------------------
      ${context.join('\n\n')}
      ---------------------
      Question: ${query}
      
      Instructions:
      1. If the answer cannot be found in the provided content, say "I cannot find information about that in the document."
      2. Base your answer ONLY on the provided content, not on general knowledge
      3. Use direct references from the content to support your answer
      4. Format your response in markdown:
         - Use **bold** for key terms and concepts
         - Use bullet points for lists
         - Include specific examples from the content
         - Use quotes when directly citing the content
      5. Make your explanation clear and appropriate for a ${subject} student
      6. If relevant, explain how this connects to other concepts mentioned in the content
      
      Provide a well-structured response that shows understanding of the specific ${subject} concepts from this document.
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

    if (!documentId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cacheKey = `${documentId}:${message}`;
    if (responseCache.has(cacheKey)) {
      return NextResponse.json({ response: responseCache.get(cacheKey) });
    }

    // Initialize both vector store and model in parallel
    const [vectorStore, modelPromise] = await Promise.all([
      getVectorStore(documentId),
      model.generateContent('') // Warm up the model
    ]);

    if (!vectorStore || vectorStore.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    try {
      // No need for type assertion since vectorStore is properly typed now
      const searchResults = await findRelevantSections(message, vectorStore);
      
      if (searchResults.length === 0) {
        return NextResponse.json({ 
          response: "I couldn't find relevant information. Please rephrase your question."
        });
      }

      // Build context from search results
      const context = searchResults.map(result => result.content);

      // Generate response using the context
      const response = await generateResponse(message, context);
      
      responseCache.set(cacheKey, response);
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
