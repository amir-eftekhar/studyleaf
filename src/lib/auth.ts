import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./mongodb"
import { connectToDatabase } from "./mongodb"
import bcrypt from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"
import jwt from "jsonwebtoken"
import { getServerSession } from "next-auth/next"

// Define the structure of our JWT token
interface CustomJWT extends JWT {
  id?: string;
  email?: string;
  name?: string;
}

// Define our custom session structure
interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials')
          }

          const { db } = await connectToDatabase()
          const user = await db.collection('users').findOne({ 
            email: credentials.email.toLowerCase() 
          })
          
          if (!user) {
            console.log('User not found:', credentials.email)
            throw new Error('Invalid credentials')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email)
            throw new Error('Invalid credentials')
          }

          console.log('User authenticated successfully:', credentials.email)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          }
        } catch (error) {
          console.error('Authorization error:', error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token as CustomJWT
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session as CustomSession
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
    signOut: '/auth'
  },
  secret: process.env.NEXTAUTH_SECRET
}

export const signJWT = async (payload: any) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1d'
  });
  return token;
};

export const getSession = async (req: Request) => {
  // Your session logic here
  // This should match how you're handling sessions in your app
  const session = await getServerSession(authOptions);
  return session;
};