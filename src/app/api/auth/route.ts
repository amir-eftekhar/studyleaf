import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import dbConnect from '@/lib/dbConnect';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  console.log('Received request:', request.url);

  try {
    // Connect to the database
    await dbConnect();
    const body = await request.json();
    console.log('Received body:', body);

    const { action, usertype, name, phone, email, password } = body;

    if (action === 'signup') {
      return handleSignup({ usertype, name, phone, email, password });
    } else if (action === 'login') {
      return handleLogin({ email, password });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('General error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Separate signup logic for better readability
async function handleSignup({ usertype, name, phone, email, password }: any) {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ usertype, name, phone, email, password: hashedPassword });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

    console.log('User created successfully:', email);
    return NextResponse.json({ message: 'User created successfully', token }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating user', details: error.message }, { status: 500 });
  }
}

// Separate login logic for better readability
async function handleLogin({ email, password }: any) {
  try {
    console.log('Attempting login for email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    console.log('Login successful for email:', email);
    return NextResponse.json({ message: 'Login successful', token }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error logging in' }, { status: 500 });
  }
}
