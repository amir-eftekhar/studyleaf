const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

async function migrateStudySets() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Try both databases
    const databases = ['studyleaf', 'test'];
    
    for (const dbName of databases) {
      console.log(`\nChecking database: ${dbName}`);
      const db = client.db(dbName);
      
      // Your current user ID and study set ID
      const currentUserId = '67341e7c514602ad1cd139b2';
      const studySetId = '673421d2514602ad1cd139de';
      
      console.log('\nChecking studysets collection...');
      
      // First, let's check if the study set exists
      const studySet = await db.collection('studysets').findOne({
        _id: new ObjectId(studySetId)
      });
      
      if (studySet) {
        console.log('Found study set:', studySet);
        
        // Update the specific study set with your user ID
        const result = await db.collection('studysets').updateOne(
          { _id: new ObjectId(studySetId) },
          { 
            $set: { 
              userId: currentUserId, // Store as string instead of ObjectId
              updatedAt: new Date()
            } 
          }
        );

        console.log(`Updated ${result.modifiedCount} study sets`);

        // Verify the update
        const studySets = await db.collection('studysets')
          .find({ userId: currentUserId })
          .toArray();

        console.log(`Found ${studySets.length} study sets for user:`);
        studySets.forEach(set => {
          console.log(`- ${set.title} (${set._id})`);
        });
        
        // If we found and updated the study set, we can break
        break;
      } else {
        console.log('Study set not found in this database');
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

// Run the migration
migrateStudySets();
