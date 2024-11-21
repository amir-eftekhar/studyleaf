import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
      .then(client => {
        console.log('Successfully connected to MongoDB.')
        return client
      })
      .catch(error => {
        console.error('Error connecting to MongoDB:', error)
        throw error
      })
  }
  clientPromise = global._mongoClientPromise
} else {
  const client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .then(client => {
      console.log('Successfully connected to MongoDB.')
      return client
    })
    .catch(error => {
      console.error('Error connecting to MongoDB:', error)
      throw error
    })
}

export default clientPromise

export async function connectToDatabase() {
  try {
    const client = await clientPromise
    const db = client.db()
    console.log('Database connection test successful')
    return { db, client }
  } catch (error) {
    console.error('Error connecting to database:', error)
    throw error
  }
}