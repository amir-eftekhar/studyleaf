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

    const { content, numPrompts = 5 } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Create ${numPrompts} writing prompts from the following content.
      Format as JSON array of objects with properties:
      - id: unique string
      - prompt: the writing prompt question
      - context: background information for the prompt
      - suggestedLength: suggested response length
      - rubric: array of criteria for evaluation
      
      Content: ${content}
      
      Return only the JSON array, no other text.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const prompts = JSON.parse(text);

    return NextResponse.json(prompts);

  } catch (error) {
    console.error('Error generating writing prompts:', error);
    return NextResponse.json(
      { error: 'Error generating writing prompts' }, 
      { status: 500 }
    );
  }
} 