import axios from 'axios';
import * as cheerio from 'cheerio';

export interface YouTubeVideo {
  title: string;
  description: string;
  duration: string;
  transcriptText?: string;
  videoId: string;
}

export class YouTubeScraper {
  private videoId: string;
  private static readonly HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  };

  constructor(url: string) {
    this.videoId = this.extractVideoId(url);
    if (!this.videoId) {
      throw new Error('Invalid YouTube URL or video ID. Please provide a valid YouTube video URL or ID.');
    }
  }

  private extractVideoId(urlOrId: string): string {
    // Regular expression for YouTube ID format
    const regExpID = /^[a-zA-Z0-9_-]{11}$/;

    // Check if the input is already a YouTube ID
    if (regExpID.test(urlOrId)) {
      return urlOrId;
    }

    // Regular expressions for different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = urlOrId.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return '';
  }

  async getVideoData(): Promise<YouTubeVideo> {
    try {
      // Get video metadata from YouTube page
      const metadata = await this.getVideoMetadata();
      
      // Get transcript from external service
      const transcriptText = await this.getTranscript();

      return {
        ...metadata,
        transcriptText,
        videoId: this.videoId
      };
    } catch (error) {
      console.error('Error fetching video data:', error);
      throw new Error('Failed to fetch video data. Please check if the video exists and is publicly available.');
    }
  }

  private async getVideoMetadata(): Promise<Omit<YouTubeVideo, 'transcriptText' | 'videoId'>> {
    try {
      const response = await axios.get(`https://www.youtube.com/watch?v=${this.videoId}`, {
        headers: YouTubeScraper.HEADERS
      });

      const $ = cheerio.load(response.data);

      // Extract metadata with error handling
      const title = $('meta[property="og:title"]').attr('content') || 'Untitled Video';
      const description = $('meta[property="og:description"]').attr('content') || 'No description available';
      const duration = $('meta[itemprop="duration"]').attr('content') || 'Unknown duration';

      return {
        title,
        description,
        duration
      };
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      throw new Error('Failed to fetch video metadata');
    }
  }

  private async getTranscript(): Promise<string | undefined> {
    try {
      // Using external transcript service
      const response = await axios.get(
        `https://deserving-harmony-9f5ca04daf.strapiapp.com/utilai/yt-transcript/${this.videoId}`,
        { headers: YouTubeScraper.HEADERS }
      );

      if (!response.data) {
        console.warn('No transcript available for video:', this.videoId);
        return undefined;
      }

      // If response is already a string, return it
      if (typeof response.data === 'string') {
        return response.data;
      }

      // If response is an array of transcript segments, join them
      if (Array.isArray(response.data)) {
        return response.data
          .map(segment => segment.text)
          .filter(text => text && text.trim().length > 0)
          .join(' ');
      }

      console.warn('Unexpected transcript format for video:', this.videoId);
      return undefined;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return undefined;
    }
  }
}
