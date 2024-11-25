import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI, EnhancedGenerateContentResponse } from '@google/generative-ai'
import { createWorker } from 'tesseract.js'
import * as mammoth from 'mammoth'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

async function processImage(buffer: Buffer): Promise<string> {
  try {
    const worker = await createWorker()
    await worker.reinitialize('eng')
    const { data } = await worker.recognize(buffer)
    await worker.terminate()
    return data.text
  } catch (error) {
    console.error('Error processing image with Tesseract:', error)
    throw new Error('Failed to process image content')
  }
}

async function processDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

async function processAudio(buffer: Buffer, mimeType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })
  
  // Convert buffer to base64
  const base64Audio = buffer.toString('base64')
  
  // Create parts array with audio data
  const parts = [
    {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio
      }
    },
    {
      text: "Please transcribe this audio and provide a detailed summary of its content. Focus on key points, main ideas, and important details."
    }
  ]

  try {
    const result = await model.generateContent(parts)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error processing audio with Gemini:', error)
    throw new Error('Failed to process audio content')
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    let extractedText = ''

    // Process based on file type
    const fileType = file.type.toLowerCase()
    
    try {
      if (fileType.includes('image')) {
        extractedText = await processImage(buffer)
      } else if (fileType.includes('wordprocessingml') || fileType.includes('docx')) {
        extractedText = await processDocx(buffer)
      } else if (fileType.includes('audio')) {
        extractedText = await processAudio(buffer, file.type)
      } else if (fileType.includes('pdf')) {
        // For PDFs, we'll still use client-side processing
        return NextResponse.json({
          success: false,
          error: 'PDF files should be processed client-side',
          isPdf: true
        })
      } else {
        throw new Error('Unsupported file type')
      }

      return NextResponse.json({
        success: true,
        text: extractedText
      })
    } catch (error: any) {
      console.error('Error processing file:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to process file'
      })
    }
  } catch (error) {
    console.error('Error in document processing:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}
