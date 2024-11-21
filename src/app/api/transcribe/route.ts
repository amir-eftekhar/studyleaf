import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

// Initialize the transcription pipeline
let transcriber = null;

async function getTranscriber() {
  if (!transcriber) {
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
  }
  return transcriber;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create tmp directory if it doesn't exist
    const tmpDir = join(process.cwd(), 'tmp');
    await mkdir(tmpDir, { recursive: true });

    // Save the file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(tmpDir, `upload-${Date.now()}.mp3`);
    await writeFile(filePath, buffer);

    // Get the transcriber
    const model = await getTranscriber();

    // Transcribe the audio
    const result = await model(filePath, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: 'english',
      task: 'transcribe'
    });

    // Clean up temporary file
    await unlink(filePath).catch(console.error);

    return NextResponse.json({ transcript: result.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
