import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;

export async function getClient() {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}
