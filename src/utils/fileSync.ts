import { S3 } from 'aws-sdk';
import { connectToDatabase } from '@/lib/mongodb';

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function syncFilesWithStorage(userId: string) {
  const { db } = await connectToDatabase();
  const user = await db.collection('users').findOne({ _id: userId });
  
  if (!user?.files) return;

  // Check each file in user's files
  for (const file of user.files) {
    try {
      // Check if file exists in S3
      await s3.headObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: file.path.replace('/uploads/', ''),
      }).promise();
    } catch (error) {
      // If file doesn't exist in S3, remove it from user's files
      await db.collection('users').updateOne(
        { _id: userId },
        { $pull: { files: { path: file.path } } }
      );
    }
  }
} 