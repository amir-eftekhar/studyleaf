import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI

async function migrateStudySets() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('studyleaf')
    
    // Your current user ID
    const currentUserId = '67341e7c514602ad1cd139b2'
    
    // Update all study sets with the specified ID to have your user ID
    const result = await db.collection('studySets').updateMany(
      { 
        $or: [
          { userId: { $exists: false } },  // Study sets without userId
          { userId: null },                // Study sets with null userId
          { userId: '' }                   // Study sets with empty userId
        ]
      },
      { 
        $set: { 
          userId: currentUserId,
          updatedAt: new Date()
        } 
      }
    )

    console.log(`Updated ${result.modifiedCount} study sets`)

    // Verify the update
    const studySets = await db.collection('studySets')
      .find({ userId: currentUserId })
      .toArray()

    console.log(`Found ${studySets.length} study sets for user:`)
    studySets.forEach(set => {
      console.log(`- ${set.title} (${set._id})`)
    })

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await client.close()
  }
}

// Run the migration
migrateStudySets()
