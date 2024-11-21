import { NextResponse } from 'next/server';
import { User } from '@/models/user';
import { connectToDatabase } from '@/lib/mongodb';
import { signJWT } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { 
      name, 
      email, 
      password, 
      phone,
      isInitialSignup = true 
    } = await req.json();

    // Validate input
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    try {
      // Create new user with default preferences
      const user = await User.create({
        name,
        email,
        password,
        phone,
        academicLevel: 'undergraduate', // Default value
        studyPreferences: {
          preferredSubjects: [],
          studyGoals: [],
          dailyStudyTime: 60,
          preferredLearningStyle: 'visual', // Default value
          difficultyLevel: 'intermediate',
          reminderFrequency: 'daily',
          focusAreas: []
        }
      });

      // Generate JWT token
      const token = await signJWT({
        id: user._id,
        email: user.email,
        name: user.name
      });

      const response = NextResponse.json(
        { 
          success: true,
          requiresPreferences: isInitialSignup,
          redirectUrl: isInitialSignup ? '/auth/preferences' : '/home',
          userId: user._id 
        },
        { status: 201 }
      );

      // Set the token cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 1 day
        path: '/',
      });

      return response;
    } catch (validationError: any) {
      // Handle mongoose validation errors
      if (validationError.name === 'ValidationError') {
        const errors = Object.values(validationError.errors).map((err: any) => err.message);
        return NextResponse.json(
          { error: 'Validation failed', details: errors.join(', ') },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        error: 'Error creating user',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 