import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { storeNote, updateStreamNote, getLatestStreamNote } from '@/lib/vectorDb';
import fs from 'fs';
import path from 'path';
import os from 'os';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

type NoteStyle = 'cornell' | 'bullet' | 'outline' | 'summary';

interface NoteConfig {
  style: NoteStyle;
  focus?: string;
}

const stylePrompts: Record<NoteStyle, string> = {
  cornell: "Generate Cornell-style notes with a main notes section, cue column, and summary.",
  bullet: "Create concise bullet-point notes highlighting key information.",
  outline: "Produce an outline-style set of notes with main topics and subtopics.",
  summary: "Write a comprehensive summary of the main points and key details.",
};

async function generateNotes(content: string, config: NoteConfig, previousNotes: string = ''): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const focusPrompt = config.focus ? `Focus on the topic of ${config.focus}.` : "Cover all important information.";
  const prompt = `${stylePrompts[config.style]} ${focusPrompt}

Content:
${content}

${previousNotes ? `Previous Notes:\n${previousNotes}\n\n` : ''}
Generate notes:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function POST(request: Request) {
  const { lectureId, text, config } = await request.json();

  if (!lectureId || !text || !config) {
    return NextResponse.json({ error: 'Lecture ID, text, and configuration are required' }, { status: 400 });
  }

  try {
    const latestNote = await getLatestStreamNote(lectureId);
    const previousNotes = latestNote ? latestNote.content : '';
    const previousContent = latestNote ? latestNote.previousContent : '';

    const newNotes = await generateNotes(text, config, previousNotes);
    const updatedNotes = previousNotes + '\n\n' + newNotes;

    await updateStreamNote(lectureId, updatedNotes, previousContent + text, (latestNote?.streamPosition || 0) + 1);

    // Save audio (assuming text is base64 encoded audio)
    const audioBuffer = Buffer.from(text, 'base64');
    const audioFilename = path.join(os.tmpdir(), `lecture_${lectureId}_${Date.now()}.wav`);
    await fs.promises.writeFile(audioFilename, audioBuffer);

    return NextResponse.json({ notes: newNotes, audioFilename });
  } catch (error) {
    console.error('Error generating lecture notes:', error);
    return NextResponse.json({ error: 'Failed to generate lecture notes' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lectureId = searchParams.get('lectureId');

  if (!lectureId) {
    return NextResponse.json({ error: 'Lecture ID is required' }, { status: 400 });
  }

  try {
    const latestNote = await getLatestStreamNote(lectureId);
    return NextResponse.json({ notes: latestNote?.content || '' });
  } catch (error) {
    console.error('Error retrieving lecture notes:', error);
    return NextResponse.json({ error: 'Failed to retrieve lecture notes' }, { status: 500 });
  }
}
