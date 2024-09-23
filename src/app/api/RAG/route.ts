import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { pipeline } from '@xenova/transformers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
//const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

async function connectToDatabase() {
  if (!client.connect()) await client.connect();
  return client.db('pdf_database');
}

async function generateEmbedding(text: string) {
  const embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function generateAnswer(model: string, context: string, question: string) {
  switch (model) {
    case 'openai':
      const openaiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant that answers questions based on the provided context." },
          { role: "user", content: `Context: ${context}\n\nQuestion: ${question}` },
        ],
      });
      return openaiResponse.choices[0].message.content;
    /*case 'gemini':
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const geminiResponse = await geminiModel.generateContent(`Context: ${context}\n\nQuestion: ${question}`);
      return geminiResponse.response.text();
    case 'anthropic':
      const anthropicResponse = await anthropic.completions.create({
        model: "claude-2",
        prompt: `Context: ${context}\n\nHuman: ${question}\n\nAssistant:`,
        max_tokens_to_sample: 300,
      });
      return anthropicResponse.completion;
      */
    default:
      throw new Error('Invalid model specified');
  }
}

export async function POST(request: Request) {
  const { question, pdfContent, model = 'openai' } = await request.json();

  try {
    const db = await connectToDatabase();
    const embeddingsCollection = db.collection('embeddings');

    const newEmbedding = await generateEmbedding(pdfContent);
    await embeddingsCollection.insertOne({ content: pdfContent, embedding: newEmbedding });

    const questionEmbedding = await generateEmbedding(question);

    const similarDocs = await embeddingsCollection.aggregate([
      {
        $vectorSearch: {
          index: "default",
          path: "embedding",
          queryVector: questionEmbedding,
          numCandidates: 100,
          limit: 5
        }
      },
      {
        $project: {
          content: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]).toArray();

    const relevantContent = similarDocs.map(doc => doc.content).join('\n');
    const answer = await generateAnswer(model, relevantContent, question);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error in RAG process:', error);
    return NextResponse.json({ error: 'Failed to process the question' }, { status: 500 });
  } finally {
    await client.close();
  }
}
