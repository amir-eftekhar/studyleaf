import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { setupVectorSearch, insertEmbedding, vectorSearch, wordSearch, closeConnection, getSystemPrompt } from '@/lib/vectorDb';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function generateEmbedding(text: string) {
  console.log('Generating embedding for:', text.substring(0, 50) + '...');
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await embeddingModel.embedContent(text);
  const embedding = result.embedding;
  console.log('Embedding generated, length:', embedding.values.length);
  return embedding.values;
}

async function generateAnswer(context: string, question: string, systemPrompt: string) {
  console.log('Generating answer for question:', question);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I'll answer questions based on the provided context and system prompt." }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1000,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const result = await chat.sendMessage(`Context: ${context}\n\nQuestion: ${question}`);
  console.log('Answer generated');
  return result.response.text();
}

function splitIntoSections(text: string, maxLength: number = 1000): string[] {
  console.log('Splitting text into sections, total length:', text.length);
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const sections: string[] = [];
  let currentSection = '';

  for (const sentence of sentences) {
    if (currentSection.length + sentence.length > maxLength) {
      sections.push(currentSection.trim());
      currentSection = '';
    }
    currentSection += sentence + ' ';
  }

  if (currentSection.trim()) {
    sections.push(currentSection.trim());
  }

  console.log('Number of sections created:', sections.length);
  return sections;
}

export async function POST(request: Request) {
  console.log('Received POST request to /api/RAG');
  const { question, content, documentId, fileType } = await request.json();

  if (!question || !content || !documentId || !fileType) {
    console.error('Missing required fields');
    return NextResponse.json({ error: 'Question, content, document ID, and file type are required' }, { status: 400 });
  }

  try {
    console.log('Setting up vector search');
    await setupVectorSearch();

    console.log('Splitting content into sections');
    const sections = splitIntoSections(content);

    console.log('Generating embeddings for sections');
    for (let i = 0; i < sections.length; i++) {
      const embedding = await generateEmbedding(sections[i]);
      await insertEmbedding(sections[i], embedding, { pageNumber: i + 1, documentId, fileType });
    }

    console.log('Generating embedding for question');
    const questionEmbedding = await generateEmbedding(question);

    console.log('Performing vector search');
    const similarDocs = await vectorSearch(questionEmbedding, 5, documentId);

    console.log('Performing word search');
    const wordSearchResults = await wordSearch(question, 5, documentId);

    console.log('Combining and deduplicating results');
    const combinedResults = [...similarDocs, ...wordSearchResults];
    const uniqueResults = Array.from(new Set(combinedResults.map(doc => doc.content)))
      .map(content => combinedResults.find(doc => doc.content === content))
      .filter((doc): doc is NonNullable<typeof doc> => doc !== undefined);

    console.log('Sorting results');
    uniqueResults.sort((a, b) => ((b as any).score || 0) - ((a as any).score || 0));

    const relevantContent = uniqueResults.map(doc => doc.content).join('\n\n');

    console.log('Retrieving system prompt');
    const systemPrompt = await getSystemPrompt(documentId) || "You are a helpful assistant that answers questions based on the provided context.";

    console.log('Generating final answer');
    const answer = await generateAnswer(relevantContent, question, systemPrompt);

    console.log('Returning response');
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error in RAG process:', error);
    return NextResponse.json({ error: 'Failed to process the question', details: (error as Error).message }, { status: 500 });
  } finally {
    console.log('Closing database connection');
    await closeConnection();
  }
}
