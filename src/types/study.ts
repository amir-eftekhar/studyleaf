export interface FlashCard {
  id: string;
  term: string;
  definition: string;
  type?: 'term' | 'definition';
  isFlipped?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface TimedTest {
  id: string;
  term: string;
  definition: string;
  userAnswer?: string;
  timeSpent?: number;
  isCorrect?: boolean;
}

export interface WritingPrompt {
  id: string;
  prompt: string;
  context: string;
  suggestedLength?: string;
  rubric?: string[];
}

export interface StudySession {
  id: string;
  type: 'match' | 'quiz' | 'timed' | 'write';
  score?: number;
  timeSpent?: number;
  completedAt?: Date;
} 