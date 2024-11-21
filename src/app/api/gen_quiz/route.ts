import { NextResponse } from 'next/server';
import { getContentForPages } from '@/lib/vectorDb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface QuizQuestion {
  type: 'multiple_choice' | 'free_response' | 'true_false';
  question: string;
  options?: string[];
  correct_answer: string | boolean;
  explanation: string;
}

export async function POST(request: Request) {
  try {
    const { documentId, quizConfig } = await request.json();
    console.log('Received POST request to /api/gen_quiz');
    console.log('Request payload:', { documentId, quizConfig });

    if (!documentId || !quizConfig) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanDocumentId = documentId.includes('/uploads/') 
      ? documentId.split('/uploads/')[1] 
      : documentId;

    const content = await getContentForPages(
      cleanDocumentId,
      quizConfig.pageRange[0],
      quizConfig.pageRange[1]
    );

    if (!content) {
      return NextResponse.json({ 
        error: 'Document not ready or no content found for specified pages.' 
      }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    // First, get key concepts to ask about
    const conceptPrompt = `
      Analyze this educational content and identify ${quizConfig.numQuestions.multiple_choice + 
      quizConfig.numQuestions.free_response + quizConfig.numQuestions.true_false} key concepts 
      that would be important to test students on. For each concept, provide:
      1. The main idea
      2. Why it's important
      3. Related details from the content

      Content to analyze:
      ${content}

      Format as a simple list of concepts.
    `;

    const conceptResult = await model.generateContent(conceptPrompt);
    const concepts = conceptResult.response.text();
    console.log('\nIdentified Concepts:', concepts);

    // Then, generate questions based on these concepts
    const questionPrompt = `
      Using these key concepts:
      ${concepts}

      Create a quiz with exactly:
      - ${quizConfig.numQuestions.multiple_choice} multiple choice questions
      - ${quizConfig.numQuestions.free_response} free response questions
      - ${quizConfig.numQuestions.true_false} true/false questions

      Difficulty level: ${quizConfig.difficulty}
      ${quizConfig.focus ? `Focus on: ${quizConfig.focus}` : ''}

      For each question:
      1. Make it test understanding rather than memorization
      2. Include clear, specific explanations
      3. For multiple choice, make all options plausible
      4. Ensure questions are based on the content provided

      Format each question as a JSON object following this structure exactly:
      {
        "type": "multiple_choice" | "free_response" | "true_false",
        "question": "question text",
        "options": ["array of choices"] (for multiple choice only),
        "correct_answer": "correct answer" | true/false,
        "explanation": "brief explanation"
      }

      Return only a JSON array of question objects.
    `;

    const result = await model.generateContent(questionPrompt);
    const response = result.response.text();
    console.log('\nRaw AI Response:', response);
    
    try {
      const cleanResponse = response
        .replace(/```json\n?|\n?```/g, '')
        .replace(/\n/g, '')
        .replace(/,\s*([\]}])/g, '$1')
        .trim();

      const questions = JSON.parse(cleanResponse);
      
      const validQuestions = questions.filter((q: any): q is QuizQuestion => {
        const isValidType = ['multiple_choice', 'free_response', 'true_false'].includes(q.type);
        const hasRequiredFields = q.question && 'correct_answer' in q && q.explanation;
        const hasValidOptions = q.type !== 'multiple_choice' || (Array.isArray(q.options) && q.options.length > 0);
        
        if (q.type === 'true_false' && typeof q.correct_answer === 'string') {
          q.correct_answer = q.correct_answer.toLowerCase() === 'true';
        }
        
        return isValidType && hasRequiredFields && hasValidOptions;
      });

      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }

      console.log('\nGenerated Quiz Questions:');
      validQuestions.forEach((q: QuizQuestion, index: number) => {
        console.log(`\nQuestion ${index + 1}:`);
        console.log('Type:', q.type);
        console.log('Question:', q.question);
        if (q.options) {
          console.log('Options:', q.options);
        }
        console.log('Correct Answer:', q.correct_answer);
        console.log('Explanation:', q.explanation);
        console.log('---');
      });

      return NextResponse.json({ questions: validQuestions });
    } catch (error) {
      console.error('Error parsing quiz response:', error);
      console.error('Raw response:', response);
      return NextResponse.json({ error: 'Failed to generate valid quiz' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in gen_quiz POST route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
