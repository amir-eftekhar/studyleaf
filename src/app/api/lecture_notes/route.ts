import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

type NoteType = 'summary' | 'detailed' | 'outline' | 'cornell';

const getNoteTypePrompt = (type: NoteType, transcript: string) => {
  const prompts = {
    summary: `
      Create a concise summary of the following lecture transcript. Focus on:
      1. Main topic and key takeaways
      2. Core concepts and their relationships
      3. Important conclusions
      Keep it brief but comprehensive.

      Transcript:
      ${transcript}
    `,
    detailed: `
      Create detailed lecture notes from the following transcript. Include:
      1. Main topics and subtopics
      2. Detailed explanations of concepts
      3. Examples and illustrations mentioned
      4. Important definitions
      5. Key relationships between concepts
      Format with clear headings and bullet points.

      Transcript:
      ${transcript}
    `,
    outline: `
      Create a structured outline of the lecture content using:
      I. Main Topics (Roman numerals)
         A. Subtopics (Capital letters)
            1. Details (Numbers)
               a. Supporting points (Lowercase letters)
      
      Focus on hierarchical relationships between concepts.

      Transcript:
      ${transcript}
    `,
    cornell: `
      Create Cornell-style notes from this lecture with:
      1. Main notes section (right, 70% of space):
         - Detailed content in bullet points
         - Examples and explanations
      2. Cue column (left, 30% of space):
         - Key questions
         - Main terms
         - Important concepts
      3. Summary section (bottom):
         - Brief overview of main points
         - Key takeaways

      Use "---" to separate sections.
      Format as "Cue | Notes" for each row.

      Transcript:
      ${transcript}
    `
  };

  return prompts[type];
};

export async function POST(req: Request) {
  try {
    const { transcript, noteType = 'detailed' } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // Initialize the model (using gemini-1.5-flash-latest)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // Get the appropriate prompt for the note type
    const prompt = getNoteTypePrompt(noteType as NoteType, transcript);

    // Generate notes using the AI model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const notes = response.text();

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Notes generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate notes' },
      { status: 500 }
    );
  }
}
