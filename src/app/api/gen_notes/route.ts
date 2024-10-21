import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { setupVectorSearch, getDocumentSections, storeNote, updateStreamNote, getLatestStreamNote, getNotes } from '@/lib/vectorDb';

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
  const { documentId, sectionId, config, mode } = await request.json();

  if (!documentId || !config || !mode) {
    return NextResponse.json({ error: 'Document ID, configuration, and mode are required' }, { status: 400 });
  }

  try {
    await setupVectorSearch();

    if (mode === 'section') {
      const sections = await getDocumentSections(documentId);
      const sectionContent = sectionId ? sections.find(s => s.id === sectionId)?.content : sections.map(s => s.content).join('\n\n');

      if (!sectionContent) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      }

      const notes = await generateNotes(sectionContent, config);
      await storeNote({
        documentId,
        sectionId,
        content: notes,
        style: config.style,
      });

      return NextResponse.json({ notes });
    } else if (mode === 'stream') {
      const { streamContent } = await request.json();
      if (!streamContent) {
        return NextResponse.json({ error: 'Stream content is required for stream mode' }, { status: 400 });
      }

      const latestNote = await getLatestStreamNote(documentId);
      const previousNotes = latestNote ? latestNote.content : '';
      const previousContent = latestNote ? latestNote.previousContent : '';

      const newNotes = await generateNotes(streamContent, config, previousNotes);
      const updatedNotes = previousNotes + '\n\n' + newNotes;

      await updateStreamNote(documentId, updatedNotes, previousContent + streamContent, (latestNote?.streamPosition || 0) + 1);

      return NextResponse.json({ notes: newNotes });
    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating notes:', error);
    return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');
  const sectionId = searchParams.get('sectionId');

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
  }

  try {
    const notes = await getNotes(documentId, sectionId || undefined);
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error retrieving notes:', error);
    return NextResponse.json({ error: 'Failed to retrieve notes' }, { status: 500 });
  }
}
