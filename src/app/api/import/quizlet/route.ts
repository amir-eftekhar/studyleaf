import { NextResponse } from 'next/server'
import { QuizletScraper } from '@/utils/quizletScraper'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: 'Please provide a valid Quizlet URL' },
        { status: 400 }
      )
    }

    if (!url.includes('quizlet.com')) {
      return NextResponse.json(
        { error: 'Please provide a valid Quizlet URL' },
        { status: 400 }
      )
    }

    const quizletSet = await QuizletScraper.scrape(url)

    if (!quizletSet || !quizletSet.cards || quizletSet.cards.length === 0) {
      return NextResponse.json(
        { error: 'No terms found in the Quizlet set' },
        { status: 400 }
      )
    }

    return NextResponse.json(quizletSet)
  } catch (error: any) {
    console.error('Quizlet import error:', error)

    // Handle Quizlet blocking or CAPTCHA
    if (error.message.includes('blocking') || 
        error.message.includes('CAPTCHA') || 
        error.message.includes('limiting access')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    // Handle network errors
    if (error.message.includes('Failed to fetch')) {
      return NextResponse.json(
        { error: 'Failed to connect to Quizlet. Please check your internet connection and try again.' },
        { status: 503 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'An unexpected error occurred while importing from Quizlet. Please try again later.' },
      { status: 500 }
    )
  }
}
