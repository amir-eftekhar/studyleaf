export interface StudyTerm {
  term: string;
  definition: string;
  image?: string;
  sourceImage?: string;
}

export interface StudySetPreferences {
  numTerms: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas?: string[];
  strugglingTopics?: string[];
}

export interface StudySet {
  title: string;
  description?: string;
  terms: StudyTerm[];
  preferences: StudySetPreferences;
  createdAt: Date;
  updatedAt: Date;
}
