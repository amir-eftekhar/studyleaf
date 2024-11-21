import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  studySetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudySet',
    default: null
  },
  allDay: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#10B981' // Default emerald color for regular events
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
scheduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
