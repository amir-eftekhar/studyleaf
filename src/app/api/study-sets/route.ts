import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

async function generateTermsFromContent(content: string, numTerms: number = 15, questionType: string = 'definition') {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

  let promptTemplate = ''
  switch (questionType) {
    case 'multiple-choice':
      promptTemplate = `Create ${numTerms} multiple-choice questions from this content. Format as JSON array with this structure:
[
  {
    "term": "Question text here?\\nA) First option\\nB) Second option\\nC) Third option\\nD) Fourth option",
    "definition": "Correct Answer: [letter]\\n\\nExplanation: [Detailed explanation of why this answer is correct]"
  }
]

Guidelines for multiple choice questions:
1. Include 4 options (A through D) in the question itself
2. Make sure options are clear and distinct
3. In the definition, only include the correct letter and explanation
4. Explanation should be thorough but concise
5. Options should be realistic and plausible

Example:
  {
    "term": "Question text here?",
    "definition": "ANSWER: (A) Correct option\\nA) Option 1\\nB) Option 2\\nC) Option 3\\nD) Option 4"
  }
]`
      break
    
    case 'conceptual':
      promptTemplate = `Create ${numTerms} conceptual understanding questions from this content. Questions should test deeper understanding and application of concepts. Format as JSON array:
[
  {
    "term": "How does X relate to Y?",
    "definition": "Detailed explanation of the relationship and concept..."
  }
]`
      break
    
    case 'definition':
      promptTemplate = `Create ${numTerms} term-definition pairs from this content. Focus on key terms and their clear, concise definitions. Format as JSON array:
[
  {
    "term": "Key Term",
    "definition": "Clear, concise definition"
  }
]`
      break
    
    case 'descriptive':
      promptTemplate = `Create ${numTerms} descriptive questions from this content. Questions should require detailed explanations. Format as JSON array:
[
  {
    "term": "Explain in detail...",
    "definition": "Comprehensive explanation covering key points..."
  }
]`
      break
  }

  const prompt = `${promptTemplate}

Content to process:
${content.slice(0, 5000)}`

  try {
    console.log('Sending prompt to Gemini...')
    const result = await model.generateContent(prompt)
    const response = result.response
    const textResponse = response.text()
    console.log('Raw AI response:', textResponse)

    // Try to clean up the response before parsing
    const cleanedResponse = textResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    console.log('Cleaned response:', cleanedResponse)

    // Create fallback terms from content
    const fallbackTerms = Array.from({ length: Math.min(5, numTerms) }, (_, i) => ({
      term: `Section ${i + 1}`,
      definition: content.split('\n\n')[i]?.trim() || 'No content available'
    }))

    try {
      const parsedTerms = JSON.parse(cleanedResponse)
      if (Array.isArray(parsedTerms) && parsedTerms.length > 0 && 
          parsedTerms.every(t => t.term && t.definition)) {
        console.log('Successfully parsed terms:', parsedTerms)
        return parsedTerms
      }
      throw new Error('Invalid terms structure')
    } catch (e) {
      console.log('Direct parsing failed, trying to extract JSON...')
      
      const startIndex = cleanedResponse.indexOf('[')
      const endIndex = cleanedResponse.lastIndexOf(']')
      
      if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        console.log('Failed to find JSON array markers, using fallback terms')
        return fallbackTerms
      }

      try {
        const jsonStr = cleanedResponse.slice(startIndex, endIndex + 1)
        const extractedTerms = JSON.parse(jsonStr)
        
        if (Array.isArray(extractedTerms) && extractedTerms.length > 0 && 
            extractedTerms.every(t => t.term && t.definition)) {
          console.log('Successfully extracted terms:', extractedTerms)
          return extractedTerms
        }
      } catch (parseError) {
        console.log('Failed to parse extracted JSON:', parseError)
      }
      
      console.log('Extracted invalid terms, using fallback')
      return fallbackTerms
    }
  } catch (error) {
    console.error('Error in term generation:', error)
    return Array.from({ length: Math.min(5, numTerms) }, (_, i) => ({
      term: `Section ${i + 1}`,
      definition: content.split('\n\n')[i]?.trim() || 'No content available'
    }))
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Convert string ID to ObjectId for proper MongoDB query
    const { ObjectId } = require('mongodb');
    const userId = new ObjectId(session.user.id);
    
    // Add logging to debug the query
    console.log('Fetching study sets for user:', userId);
    
    const studySets = await db.collection('studysets')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Found study sets:', studySets.length);
    
    return NextResponse.json(studySets);
  } catch (error) {
    console.error('Error fetching study sets:', error);
    return NextResponse.json(
      { error: 'Error fetching study sets' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const { title, description, content, source = 'manual', preferences } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Convert string ID to ObjectId
    const { ObjectId } = require('mongodb');
    const userId = new ObjectId(session.user.id);

    let terms = [];
    if (content) {
      terms = await generateTermsFromContent(
        content, 
        preferences?.numTerms || 15,
        preferences?.questionType || 'definition'
      );
    }

    const studySet = {
      userId,
      title,
      description,
      terms: terms.map(term => ({
        ...term,
        mastered: false,
        lastReviewed: null
      })),
      source,
      createdAt: new Date(),
      lastStudied: null,
      studyProgress: 0,
      totalReviews: 0,
      tags: []
    };

    const result = await db.collection('studysets').insertOne(studySet);
    
    if (!result.insertedId) {
      throw new Error('Failed to create study set');
    }

    console.log('Created study set:', result.insertedId);
    
    return NextResponse.json({
      success: true,
      studySet: { ...studySet, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating study set:', error);
    return NextResponse.json(
      { error: 'Error creating study set' },
      { status: 500 }
    );
  }
}