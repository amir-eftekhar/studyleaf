import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { term, definition, userAnswer } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      You are an educational assistant evaluating a student's written answer.
      
      Term: "${term}"
      Correct Definition: "${definition}"
      Student's Answer: "${userAnswer}"

      Please evaluate the student's answer and provide:
      1. Whether it's correct (captures the main concept accurately)
      2. Brief, constructive feedback (2-3 sentences max)
      3. A score between 0 and 1 (can be decimal)

      Respond with only a JSON object in this exact format (no markdown, no backticks):
      {
        "isCorrect": boolean,
        "feedback": "your feedback here",
        "score": number
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean the response text by removing markdown formatting
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      // Parse the cleaned JSON response
      const evaluation = JSON.parse(cleanText);
      return NextResponse.json(evaluation);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Fallback response if parsing fails
      return NextResponse.json({
        isCorrect: false,
        feedback: "Sorry, there was an error evaluating your answer. Please try again.",
        score: 0
      });
    }

  } catch (error) {
    console.error('Error checking answer:', error);
    return NextResponse.json(
      { 
        isCorrect: false,
        feedback: "Error checking answer. Please try again.",
        score: 0
      },
      { status: 500 }
    );
  }
} 