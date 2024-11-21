import { NextResponse } from 'next/server'
import { YouTubeScraper } from '@/utils/youtubeScraper'
import { StudySetGenerator } from '@/services/studySetGenerator'

export async function POST(req: Request) {
  try {
    const { 
      url, 
      additionalInfo = '',
      numTerms = 15,
      focusAreas = [],
      difficultyLevel = 'intermediate',
      strugglingTopics = []
    } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: 'Please provide a YouTube video URL' },
        { status: 400 }
      )
    }

    try {
      // Get video data using scraper
      const scraper = new YouTubeScraper(url)
      const videoData = await scraper.getVideoData()

      // Check if we got any content to work with
      if (!videoData.transcriptText || videoData.transcriptText.trim().length === 0) {
        return NextResponse.json(
          { 
            error: 'No transcript available for this video. Please try a different video or use one with closed captions.',
            videoInfo: {
              title: videoData.title,
              description: videoData.description,
              duration: videoData.duration
            }
          },
          { status: 400 }
        )
      }

      try {
        // Create study set using generator
        const generator = new StudySetGenerator()
        const studySetData = await generator.generateStudySet(
          {
            type: 'youtube',
            content: videoData.transcriptText,
            metadata: {
              title: videoData.title,
              description: videoData.description
            }
          },
          {
            numTerms,
            focusAreas,
            difficultyLevel: difficultyLevel as 'beginner' | 'intermediate' | 'advanced',
            strugglingTopics,
            additionalInfo
          }
        )

        return NextResponse.json({
          studySet: studySetData,
          videoInfo: {
            title: videoData.title,
            description: videoData.description,
            duration: videoData.duration
          }
        })
      } catch (aiError: any) {
        console.error('AI generation error:', aiError)
        if (aiError.message?.includes('API key')) {
          return NextResponse.json(
            { error: 'AI service configuration error. Please try again later or contact support.' },
            { status: 503 }
          )
        }
        return NextResponse.json(
          { error: 'Failed to generate study set. Please try again.' },
          { status: 500 }
        )
      }
    } catch (scrapingError: any) {
      console.error('Video scraping error:', scrapingError)
      return NextResponse.json(
        { error: scrapingError.message || 'Failed to process video. Please check the URL and try again.' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Request processing error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

async function fetchVideoData(videoId: string) {
  // TODO: Implement YouTube API integration to fetch video data
  // This is a placeholder that should be replaced with actual YouTube API calls
  return {
    title: "Sample Video",
    description: "Sample description",
    transcript: "Sample transcript"
  }
}
