import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    academicLevel: String,
    institution: String,
    major: String,
    preferredSubjects: [String],
    studyGoals: [String],
    dailyStudyTime: Number,
    preferredLearningStyle: String,
    difficultyLevel: String,
    reminderFrequency: String,
    focusAreas: [String]
  }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);