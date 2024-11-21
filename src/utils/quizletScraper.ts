import * as cheerio from 'cheerio';
import type { AnyNode } from 'cheerio';
import axios from 'axios';

export interface QuizletSet {
  title: string;
  description?: string;
  author: string;
  cards: {
    term: string;
    definition: string;
    image?: string;
    sourceImage?: string;
  }[];
}

export class QuizletScraper {
  private $: cheerio.CheerioAPI;
  private json: QuizletSet;

  static async fetch(url: string): Promise<string> {
    try {
      // Generate a plausible Chrome version
      const chromeVersion = `${Math.floor(Math.random() * 20) + 90}.0.${Math.floor(Math.random() * 5000)}.${Math.floor(Math.random() * 200)}`;
      
      // Add randomized delays between requests
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

      const response = await axios.get(url, {
        headers: {
          'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Ch-Ua': `"Not.A/Brand";v="8", "Chromium";v="${chromeVersion.split('.')[0]}", "Google Chrome";v="${chromeVersion.split('.')[0]}"`,
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"macOS"',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-User': '?1',
          'Sec-Fetch-Dest': 'document',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'DNT': '1',
          'Referer': 'https://www.google.com/search?q=quizlet+study+sets',
        },
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
        proxy: false, // Disable any proxy settings that might be set
      });

      if (response.status === 403 || response.status === 429) {
        throw new Error('Quizlet is currently limiting access. Please try:\n1. Wait a few minutes and try again\n2. Copy/paste the terms manually\n3. Use a different study set URL');
      }

      if (response.data.includes('Captcha Challenge') || response.data.includes('Please verify you are human')) {
        throw new Error('Quizlet requires CAPTCHA verification. Please try:\n1. Wait a few minutes and try again\n2. Copy/paste the terms manually\n3. Use a different study set URL');
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 429) {
        throw new Error('Access to Quizlet is temporarily restricted. Please try again in a few minutes.');
      }
      throw new Error(`Failed to fetch Quizlet content: ${error.message}`);
    }
  }

  static async scrape(url: string): Promise<QuizletSet> {
    const html = await this.fetch(url);
    const scraper = new QuizletScraper(html);
    return scraper.getJson();
  }

  constructor(html: string) {
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid HTML content provided');
    }
    
    this.$ = cheerio.load(html);
    this.json = this.parseQuizletPage();
  }

  private parseQuizletPage(): QuizletSet {
    const $ = this.$;
    
    if ($('title').text().toLowerCase().includes('captcha') || 
        $('body').text().toLowerCase().includes('please verify you are human')) {
      throw new Error('Quizlet requires CAPTCHA verification. Please try again later.');
    }

    const mainContent = $('.SetPageTerms-content, .SetPage-terms, .SetPageTerms').first();
    if (!mainContent.length) {
      throw new Error('Unable to locate study set content. The page structure may have changed.');
    }

    const obj: QuizletSet = {
      title: $('h1').first().text().trim() || 'Untitled Set',
      author: $('.UserLink-username, .CreatorHeader-username').text().trim() || 'Unknown Author',
      cards: []
    };

    const description = $('.SetPageHeader-description, .SetDescription').first().text().trim();
    if (description) {
      obj.description = description;
    }

    // Support multiple possible selectors for terms
    const termContainers = $('.SetPageTerm-content, .SetPageTerm, .SetPageTerms-term');
    
    if (!termContainers.length) {
      throw new Error('No flashcards found in this study set. The page structure may have changed.');
    }

    termContainers.each((_index: number, container: AnyNode) => {
      const termSelectors = ['.SetPageTerm-wordText', '.SetPageTerm-word', '.TermText'];
      const defSelectors = ['.SetPageTerm-definitionText', '.SetPageTerm-definition', '.TermText'];
      
      const term = termSelectors.reduce((acc, selector) => 
        acc || $(container).find(selector).first().text().trim(), '');
      
      const definition = defSelectors.reduce((acc, selector) => 
        acc || $(container).find(selector).first().text().trim(), '');
      
      if (term && definition) {
        const card = {
          term,
          definition,
        };

        // Try to find associated images
        const imageUrl = $(container).find('img').attr('src');
        if (imageUrl && !imageUrl.includes('placeholder')) {
          card.image = imageUrl;
          card.sourceImage = imageUrl;
        }

        obj.cards.push(card);
      }
    });

    if (obj.cards.length === 0) {
      throw new Error('No valid flashcards found in this study set.');
    }

    return obj;
  }

  getJson(): QuizletSet {
    return this.json;
  }
}
