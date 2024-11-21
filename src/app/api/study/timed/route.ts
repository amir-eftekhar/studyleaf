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

    const { content, numQuestions = 10 } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Create ${numQuestions} timed test questions from the following content.
      Format as JSON array of objects with properties:
      - id: unique string
      - term: the term or concept to be defined
      - definition: the correct definition
      
      Content: ${content}
      
      Return only the JSON array, no other text.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const questions = JSON.parse(text);

    return NextResponse.json(questions);

  } catch (error) {
    console.error('Error generating timed test:', error);
    return NextResponse.json(
      { error: 'Error generating timed test' }, 
      { status: 500 }
    );
  }
} 