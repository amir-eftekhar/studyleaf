export interface StudyPreferences {
  dailyGoal: number;
  preferredStudyTime: string;
  reminderFrequency: string;
  studySessionDuration: number;
  focusAreas: string[];
  preferredLearningStyle: string;
  dailyStudyTime: number;
  difficultyLevel: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  profileImage?: string;
  profileIcon?: string;
  institution?: string;
  major?: string;
  academicLevel?: string;
  studyPreferences: StudyPreferences;
  studySets?: Array<{
    _id: string;
    title: string;
    description?: string;
    terms: Array<{ term: string; definition: string }>;
    createdAt: string;
  }>;
  pdfs?: Array<{
    _id: string;
    title: string;
    size: string;
    createdAt: string;
  }>;
  lectures?: Array<{
    _id: string;
    title: string;
    duration: string;
    createdAt: string;
  }>;
  notes?: Array<{
    _id: string;
    title: string;
    preview: string;
    createdAt: string;
  }>;
  savedSets?: Array<{
    _id: string;
    title: string;
    description?: string;
    terms: Array<{ term: string; definition: string }>;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface StudySet {
  _id: string;
  title: string;
  description?: string;
  terms: Array<{ term: string; definition: string }>;
  createdAt: string;
} 