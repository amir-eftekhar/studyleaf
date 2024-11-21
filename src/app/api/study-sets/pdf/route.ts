import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

async function generateTermsFromText(text: string, numTerms: number = 15): Promise<Array<{ term: string; definition: string }>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

  const prompt = `Create ${numTerms} study terms from the following text. Each term should be a key concept, and its definition should be a clear explanation. Format the response as a JSON array of objects with 'term' and 'definition' properties. Keep definitions concise but informative. Here's the text:

${text}

Example format:
[
  {
    "term": "Key Concept",
    "definition": "Clear explanation of the concept"
  }
]`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const textResponse = response.text()
    
    // Extract JSON from the response
    const jsonMatch = textResponse.match(/\\[.*\\]/s)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const terms = JSON.parse(jsonMatch[0])
    return terms
  } catch (error) {
    console.error('Error generating terms:', error)
    throw error
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { text, numTerms } = await req.json()
    const terms = await generateTermsFromText(text, numTerms)

    return NextResponse.json({ terms })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { error: 'Error processing PDF' },
      { status: 500 }
    )
  }
}
