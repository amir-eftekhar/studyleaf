import mongoose from 'mongoose'

interface Term {
  term: string;
  definition: string;
  mastered: boolean;
  lastReviewed?: Date;
}

const termSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
    trim: true
  },
  definition: {
    type: String,
    required: true,
    trim: true
  },
  mastered: {
    type: Boolean,
    default: false
  },
  lastReviewed: {
    type: Date,
    default: null
  }
})

const studySetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  terms: [termSchema],
  source: {
    type: String,
    enum: ['manual', 'pdf', 'document', 'youtube'],
    default: 'manual'
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastStudied: {
    type: Date,
    default: null
  },
  studyProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
})

export const StudySet = mongoose.models.StudySet || mongoose.model('StudySet', studySetSchema)
export type { Term } 