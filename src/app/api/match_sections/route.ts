import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { setupVectorSearch, vectorSearch, wordSearch } from '@/lib/vectorDb';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function generateEmbedding(text: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

interface SearchResult {
  content: string;
  score: number;
}

export async function POST(request: Request) {
  const { query, documentId } = await request.json();

  if (!query || !documentId) {
    return NextResponse.json({ error: 'Query and document ID are required' }, { status: 400 });
  }

  try {
    await setupVectorSearch(documentId);

    const queryEmbedding = await generateEmbedding(query);
    const vectorResults = await vectorSearch(queryEmbedding, 5, documentId);
    const wordResults = await wordSearch(query, 5, documentId);

    // Ensure both results are arrays
    const vectorArray = Array.isArray(vectorResults) ? vectorResults : [];
    const wordArray = Array.isArray(wordResults) ? wordResults : [];

    const combinedResults = [...vectorArray, ...wordArray] as SearchResult[];
    const uniqueResults = Array.from(new Set(combinedResults.map(doc => doc.content)))
      .map(content => combinedResults.find(doc => doc.content === content))
      .filter((doc): doc is SearchResult => doc !== undefined)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ 
      status: 'success',
      results: uniqueResults 
    });
  } catch (error) {
    console.error('Error matching sections:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to match sections' 
    }, { status: 500 });
  }
}
