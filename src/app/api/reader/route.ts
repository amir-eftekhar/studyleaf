import { NextResponse } from 'next/server';
import { generateSpeech } from './openai';

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const response = await generateSpeech(text);
    return response;
  } catch (error) {
    console.error('Error in TTS route:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
