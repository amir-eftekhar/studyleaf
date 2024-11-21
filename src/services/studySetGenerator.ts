import { GoogleGenerativeAI } from '@google/generative-ai';

export interface StudySetPreferences {
  numTerms: number;
  focusAreas: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  strugglingTopics: string[];
  additionalInfo?: string;
}

export interface ContentInput {
  type: 'text' | 'pdf' | 'youtube';
  content: string;
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
  };
}

export class StudySetGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  }

  async generateStudySet(
    input: ContentInput,
    preferences: StudySetPreferences
  ) {
    try {
      // Validate input
      if (!input.content || input.content.trim().length === 0) {
        throw new Error('Content is required');
      }

      const prompt = this.buildPrompt(input, preferences);
      
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        try {
          const parsedResponse = JSON.parse(text);
          if (!Array.isArray(parsedResponse)) {
            throw new Error('Invalid response format');
          }
          return parsedResponse;
        } catch (parseError) {
          console.error('Error parsing AI response:', text);
          throw new Error('Failed to parse study set from AI response');
        }
      } catch (aiError: any) {
        console.error('AI generation error:', aiError);
        if (aiError.message?.includes('API key')) {
          throw new Error('Invalid or expired API key');
        }
        throw new Error('Failed to generate study set: ' + aiError.message);
      }
    } catch (error: any) {
      console.error('Error in generateStudySet:', error);
      throw error;
    }
  }

  private buildPrompt(
    input: ContentInput,
    preferences: StudySetPreferences
  ): string {
    const {
      numTerms,
      focusAreas,
      difficultyLevel,
      strugglingTopics,
      additionalInfo
    } = preferences;

    return `
    Create a comprehensive study set from the following content.
    
    Content Type: ${input.type.toUpperCase()}
    ${input.metadata?.title ? `Title: ${input.metadata.title}` : ''}
    ${input.metadata?.description ? `Description: ${input.metadata.description}` : ''}
    ${input.metadata?.author ? `Author: ${input.metadata.author}` : ''}
    
    Content:
    ${input.content}
    
    Study Set Requirements:
    1. Generate exactly ${numTerms} study terms
    2. Target difficulty level: ${difficultyLevel}
    3. Focus areas: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'general understanding'}
    4. Address these struggling topics: ${strugglingTopics.length > 0 ? strugglingTopics.join(', ') : 'none specified'}
    ${additionalInfo ? `5. Additional context: ${additionalInfo}` : ''}
    
    Instructions:
    1. Each term should be concise (1-3 words)
    2. Each definition should be clear and comprehensive (2-3 sentences)
    3. Include relevant examples where appropriate
    4. Adapt the complexity based on the specified difficulty level
    5. Pay special attention to the struggling topics
    6. Focus on practical applications and real-world examples
    7. Include key concepts, formulas, and relationships
    8. Ensure definitions build upon each other logically
    
    Format the output as a JSON array of objects with 'term' and 'definition' properties.
    Example format:
    [
      {
        "term": "Example Term",
        "definition": "Clear and comprehensive definition with context."
      }
    ]
    
    IMPORTANT: Ensure the response is valid JSON and follows the exact format shown above.
    `;
  }

  async generateQuestionSet(terms: { term: string; definition: string }[]) {
    const prompt = `
    Create a set of practice questions based on these study terms:
    ${JSON.stringify(terms, null, 2)}
    
    Generate 3 different types of questions for each term:
    1. Multiple choice
    2. True/False
    3. Short answer
    
    Format the output as a JSON array of objects with this structure:
    {
      "term": "The term being tested",
      "questions": [
        {
          "type": "multiple_choice",
          "question": "The question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "The correct option"
        },
        {
          "type": "true_false",
          "question": "The statement to evaluate",
          "correctAnswer": true/false
        },
        {
          "type": "short_answer",
          "question": "The question text",
          "sampleAnswer": "An example of a correct answer"
        }
      ]
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate practice questions');
    }
  }

  async generateExplanations(terms: { term: string; definition: string }[]) {
    const prompt = `
    Create detailed explanations and examples for these study terms:
    ${JSON.stringify(terms, null, 2)}
    
    For each term, provide:
    1. A detailed explanation
    2. Real-world examples
    3. Common misconceptions
    4. Related concepts
    5. Memory aids or mnemonics
    
    Format the output as a JSON array of objects with this structure:
    {
      "term": "The term",
      "explanation": "Detailed explanation",
      "examples": ["Example 1", "Example 2"],
      "misconceptions": ["Common misconception 1", "Common misconception 2"],
      "relatedConcepts": ["Related concept 1", "Related concept 2"],
      "memoryAid": "A helpful mnemonic or memory aid"
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating explanations:', error);
      throw new Error('Failed to generate explanations');
    }
  }
}
