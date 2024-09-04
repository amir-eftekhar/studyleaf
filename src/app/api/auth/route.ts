import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import dbConnect from '@/lib/dbConnect';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  console.log('Received request:', request.url);
  try {
    await dbConnect();
    const body = await request.json();
    console.log('Received body:', body);

    const { action, usertype, name, phone, email, password } = body;

    if (action === 'signup') {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }


        const user = new User({ usertype, name, phone, email, password });

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
    } else if (action === 'login') {
      try {
        console.log('Attempting login for email:', email);
        const user = await User.findOne({ email });
        if (!user) {
          console.log('User not found for email:', email);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
          console.log('Invalid password for email:', email);
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('General error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}