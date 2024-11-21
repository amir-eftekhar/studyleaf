import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: true,
  },
  back: {
    type: String,
    required: true,
  },
  lastReviewed: {
    type: Date,
    default: null,
  },
  confidence: {
    type: Number,
    default: 0, // 0-5 scale
  },
});

const studySetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  cards: [cardSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  averageConfidence: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.StudySet || mongoose.model('StudySet', studySetSchema); 