import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: process.env.NODE_ENV === 'development',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
}

const client = new MongoClient(uri, options);
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect()
      .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = client.connect()
    .catch(error => {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    });
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log('Database connection test successful');
    
    return { client, db };
  } catch (error) {
    console.error('Error connecting to database:', error);
    // Try to reconnect
    clientPromise = client.connect();
    throw new Error('Unable to connect to database');
  }
}

client.on('connectionPoolCleared', () => {
  console.warn('MongoDB connection pool cleared, attempting to reconnect...');
  clientPromise = client.connect();
});

client.on('close', () => {
  console.warn('MongoDB connection closed, attempting to reconnect...');
  clientPromise = client.connect();
});

export default clientPromise;