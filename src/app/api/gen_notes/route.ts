import { NextResponse } from 'next/server';
import { getContentForPages } from '@/lib/vectorDb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

type NoteStyle = 'cornell' | 'bullet' | 'flowchart' | 'paragraph';

export async function POST(request: Request) {
  try {
    const { documentId, pageRange, focus, description, type = 'notes', style = 'bullet' } = await request.json();

    if (!documentId || !pageRange) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Clean document ID
    const cleanDocumentId = documentId.includes('/uploads/') 
      ? documentId.split('/uploads/')[1] 
      : documentId;

    // Get content for specified pages
    const content = await getContentForPages(
      cleanDocumentId,
      pageRange[0],
      pageRange[1]
    );

    if (!content) {
      return NextResponse.json({ error: 'No content found for specified pages' }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    let prompt = '';
    
    if (type === 'summary') {
      prompt = `Create a concise summary of the following content.
         ${focus ? `Focus on: ${focus}` : ''}
         ${description ? `Additional requirements: ${description}` : ''}
         
         Content:
         ${content}`;
    } else {
      // Different prompts for each note style
      switch (style as NoteStyle) {
        case 'cornell':
          prompt = `Create Cornell-style notes from the following content.
            ${focus ? `Focus on: ${focus}` : ''}
            ${description ? `Additional requirements: ${description}` : ''}
            
            Format the notes in this structure:
            # Main Topic
            
            ## Key Questions/Cues (Left Column)
            - Important questions about the content
            - Key terms and concepts
            - Main ideas to recall
            
            ## Notes (Right Column)
            - Detailed notes and explanations
            - Examples and supporting details
            - Key concepts and definitions
            
            ## Summary (Bottom)
            - Brief summary of the main points
            - Key takeaways
            
            Content:
            ${content}`;
          break;

        case 'flowchart':
          prompt = `Create a flowchart-style note representation of the following content.
            ${focus ? `Focus on: ${focus}` : ''}
            ${description ? `Additional requirements: ${description}` : ''}
            
            Format the notes as a flowchart using markdown and ASCII characters:
            - Use --> for connections
            - Use [ ] for main concepts
            - Use ( ) for supporting details
            - Use * for important notes
            - Show clear relationships and process flows
            - Include brief explanations at each node
            
            Content:
            ${content}`;
          break;

        case 'bullet':
          prompt = `Create detailed bullet-point notes from the following content.
            ${focus ? `Focus on: ${focus}` : ''}
            ${description ? `Additional requirements: ${description}` : ''}
            
            Format the notes with:
            - Main topics as headers (##)
            - Hierarchical bullet points (-, *, +)
            - Important terms in **bold**
            - Key definitions and examples
            - Clear subtopics and relationships
            
            Content:
            ${content}`;
          break;

        case 'paragraph':
          prompt = `Create well-structured paragraph notes from the following content.
            ${focus ? `Focus on: ${focus}` : ''}
            ${description ? `Additional requirements: ${description}` : ''}
            
            Format the notes with:
            - Clear topic paragraphs
            - Section headers (##)
            - Important terms in **bold**
            - Topic sentences
            - Supporting details
            - Connecting ideas between paragraphs
            - Concluding statements
            
            Content:
            ${content}`;
          break;

        default:
          prompt = `Create detailed study notes from the following content.
            ${focus ? `Focus on: ${focus}` : ''}
            ${description ? `Additional requirements: ${description}` : ''}
            
            Format the notes with:
            - Clear headings and subheadings
            - Bullet points for key concepts
            - Examples where relevant
            - Important definitions
            Use markdown formatting.
            
            Content:
            ${content}`;
      }
    }

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return NextResponse.json({ 
      [type === 'summary' ? 'summary' : 'notes']: response,
      style: style
    });

  } catch (error) {
    console.error('Error in gen_notes POST route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate notes' },
      { status: 500 }
    );
  }
}
