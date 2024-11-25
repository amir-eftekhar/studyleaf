import { NextResponse } from 'next/server';
import { User } from '@/models/user';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const preferences = await req.json();

    const user = await User.findByIdAndUpdate(
      session.id,
      { 
        $set: {
          academicLevel: preferences.academicLevel,
          institution: preferences.institution,
          major: preferences.major,
          studyPreferences: {
            preferredSubjects: preferences.preferredSubjects,
            studyGoals: preferences.studyGoals,
            dailyStudyTime: preferences.dailyStudyTime,
            preferredLearningStyle: preferences.preferredLearningStyle,
            difficultyLevel: preferences.difficultyLevel,
            reminderFrequency: preferences.reminderFrequency,
            focusAreas: preferences.focusAreas,
          }
        }
      },
      { new: true }
    );

    return NextResponse.json({ message: 'Preferences updated successfully', user });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
} 