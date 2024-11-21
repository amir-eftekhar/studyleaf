import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, numPairs = 10 } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-" });

    const prompt = `
      Create ${numPairs} pairs of matching terms and definitions from the following content.
      Format as JSON array of objects with properties:
      - id: unique string
      - term: the term or concept
      - definition: the matching definition
      
      Content: ${content}
      
      Return only the JSON array, no other text.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const pairs = JSON.parse(text);

    return NextResponse.json(pairs);

  } catch (error) {
    console.error('Error generating match pairs:', error);
    return NextResponse.json(
      { error: 'Error generating match pairs' }, 
      { status: 500 }
    );
  }
} 