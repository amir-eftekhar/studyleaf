import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore, generateEmbedding } from '@/lib/vectorDb';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    if (!vectorStore) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    try {
      // Perform search and prepare prompt in parallel
      const searchPromise = vectorStore.similaritySearch(message, 3);
      const promptTemplate = `Answer based on this context:
{context}

Question: ${message}

Format your response using these rules:
- Use **bold** for important terms, names, and key points
- Start each main point with a clear heading in **bold**
- Use proper indentation and bullet points for lists
- Add a single line break between sections
- Format lists and enumerations clearly with bullet points (*)
- Keep paragraphs concise and well-structured
- Use markdown formatting for better readability
- Avoid excessive line breaks or spaces
- If listing items, use consistent formatting throughout
- If mentioning dates, addresses, or numbers, make them **bold**

Provide a clear, well-structured response that is easy to read.`;

      const searchResults = await searchPromise;
      
      if (!searchResults.length) {
        return NextResponse.json({ 
          response: "I couldn't find relevant information. Please rephrase your question."
        });
      }

      // Build context and generate response immediately
      const context = searchResults
        .map(result => result.content)
        .join('\n')
        .slice(0, 3000);

      const prompt = promptTemplate.replace('{context}', context);
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
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
