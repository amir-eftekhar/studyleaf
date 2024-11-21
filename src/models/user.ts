import mongoose, { Model, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

// Define study preferences interface
interface StudyPreferences {
  preferredSubjects: string[];
  studyGoals: string[];
  dailyStudyTime: number; // in minutes
  preferredLearningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  reminderFrequency: 'daily' | 'weekly' | 'custom';
  focusAreas: string[];
}

// Define the user interface
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  createdAt: Date;
  academicLevel: string;
  institution?: string;
  major?: string;
  bio?: string;
  studyPreferences: StudyPreferences;
  timezone: string;
  language: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  profileImage?: string;
  profileIcon?: string;
  studySets: mongoose.Types.ObjectId[];
  savedSets: mongoose.Types.ObjectId[];
  pdfs: mongoose.Types.ObjectId[];
  lectures: mongoose.Types.ObjectId[];
  notes: mongoose.Types.ObjectId[];
}

// Define methods interface
interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the model interface
interface UserModel extends Model<IUser, {}, UserMethods> {
  findByEmail(email: string): Promise<IUser | null>;
}

// Create the schema
const userSchema = new mongoose.Schema<IUser, UserModel, UserMethods>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  academicLevel: {
    type: String,
    required: [true, 'Academic level is required'],
    enum: ['high_school', 'undergraduate', 'graduate', 'professional', 'other'],
  },
  institution: {
    type: String,
    trim: true,
  },
  major: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  studyPreferences: {
    preferredSubjects: [{
      type: String,
      trim: true,
    }],
    studyGoals: [{
      type: String,
      trim: true,
    }],
    dailyStudyTime: {
      type: Number,
      default: 60,
    },
    preferredLearningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic'],
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    reminderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    focusAreas: [{
      type: String,
      trim: true,
    }],
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  language: {
    type: String,
    default: 'en',
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profileImage: { type: String },
  profileIcon: { type: String },
  studySets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudySet' }],
  savedSets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudySet' }],
  pdfs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PDF' }],
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Add method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password);
};

// Add static method to find by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

// Fix the model initialization
let User: UserModel;

try {
  // Try to get existing model
  User = mongoose.model<IUser, UserModel>('User');
} catch {
  // Model doesn't exist, create new one
  User = mongoose.model<IUser, UserModel>('User', userSchema);
}

export { User, type IUser, type StudyPreferences };