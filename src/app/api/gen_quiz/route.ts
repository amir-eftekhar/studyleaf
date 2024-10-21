import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { setupVectorSearch, getDocumentSections } from '@/lib/vectorDb';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface QuizQuestion {
  type: 'multiple_choice' | 'free_response';
  question: string;
  choices?: { text: string; correct: boolean }[];
  answer?: string;
}

interface QuizConfig {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  types: ('multiple_choice' | 'free_response')[];
  adaptive: boolean;
}

async function generateQuiz(content: string, config: QuizConfig): Promise<QuizQuestion[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const prompt = `Generate a quiz based on the following content. The quiz should have ${config.numQuestions} questions, with a difficulty level of ${config.difficulty}. Include a mix of ${config.types.join(' and ')} questions.

Content:
${content}

For multiple-choice questions, provide 4 options and mark the correct answer. For free-response questions, provide a sample answer for evaluation.

Generate the quiz in the following JSON format:
[
  {
    "type": "multiple_choice",
    "question": "Question text",
    "choices": [
      { "text": "Option A", "correct": false },
      { "text": "Option B", "correct": true },
      { "text": "Option C", "correct": false },
      { "text": "Option D", "correct": false }
    ]
  },
  {
    "type": "free_response",
    "question": "Question text",
    "answer": "Sample answer for evaluation"
  }
]`;

  const result = await model.generateContent(prompt);
  const quizJson = result.response.text();
  return JSON.parse(quizJson);
}

async function checkFreeResponse(question: string, userAnswer: string, sampleAnswer: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const prompt = `Evaluate the user's answer to the following question:

Question: ${question}

User's Answer: ${userAnswer}

Sample Answer: ${sampleAnswer}

Provide feedback on the user's answer, highlighting strengths and areas for improvement. Be constructive and encouraging in your feedback.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateAdaptiveQuestion(previousQuestions: QuizQuestion[], userAnswers: string[], config: QuizConfig): Promise<QuizQuestion> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const prompt = `Based on the following previous questions and user answers, generate a new adaptive question:

Previous Questions and Answers:
${previousQuestions.map((q, i) => `Q: ${q.question}\nA: ${userAnswers[i]}`).join('\n\n')}

Generate a new ${config.types[Math.floor(Math.random() * config.types.length)]} question that adapts to the user's performance and knowledge level.

Use the same JSON format as before for the new question.`;

  const result = await model.generateContent(prompt);
  const questionJson = result.response.text();
  return JSON.parse(questionJson);
}

export async function POST(request: Request) {
  const { documentId, quizConfig } = await request.json();

  if (!documentId || !quizConfig) {
    return NextResponse.json({ error: 'Document ID and quiz configuration are required' }, { status: 400 });
  }

  try {
    await setupVectorSearch();

    const sections = await getDocumentSections(documentId);
    const content = sections.join('\n\n');

    const quiz = await generateQuiz(content, quizConfig);

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { question, userAnswer } = await request.json();

  if (!question || !userAnswer) {
    return NextResponse.json({ error: 'Question and user answer are required' }, { status: 400 });
  }

  try {
    if (question.type === 'multiple_choice') {
      const correctChoice = question.choices?.find((choice: { text: string; correct: boolean }) => choice.correct);
      if (correctChoice) {
        const isCorrect = userAnswer === correctChoice.text;
        return NextResponse.json({ correct: isCorrect, feedback: isCorrect ? 'Correct!' : 'Incorrect. The correct answer is: ' + correctChoice.text });
      } else {
        return NextResponse.json({ error: 'Invalid question format' }, { status: 400 });
      }
    } else {
      const feedback = await checkFreeResponse(question.question, userAnswer, question.answer || '');
      return NextResponse.json({ feedback });
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return NextResponse.json({ error: 'Failed to check answer' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { previousQuestions, userAnswers, quizConfig } = await request.json();

  if (!previousQuestions || !userAnswers || !quizConfig) {
    return NextResponse.json({ error: 'Previous questions, user answers, and quiz configuration are required' }, { status: 400 });
  }

  try {
    const newQuestion = await generateAdaptiveQuestion(previousQuestions, userAnswers, quizConfig);
    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    console.error('Error generating adaptive question:', error);
    return NextResponse.json({ error: 'Failed to generate adaptive question' }, { status: 500 });
  }
}
