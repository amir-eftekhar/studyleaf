import { MongoClient, ObjectId } from 'mongodb';
import type { FileDocument } from '@/types/files';
import { connectToDatabase } from '@/lib/mongodb';

export class FileService {
  static async getCollection() {
    const { db } = await connectToDatabase();
    return db.collection<FileDocument>('files');
  }

  static async getFilesByUserId(userId: string): Promise<FileDocument[]> {
    const collection = await this.getCollection();
    return collection
      .find({ 
        userId, 
        isDeleted: { $ne: true }
      })
      .sort({ uploadedAt: -1 })
      .toArray();
  }

  static async createFile(fileData: Omit<FileDocument, '_id'>): Promise<FileDocument> {
    const collection = await this.getCollection();
    const fileDoc = {
      ...fileData,
      _id: new ObjectId().toString(),
      isDeleted: false
    };
    
    await collection.insertOne(fileDoc);
    return fileDoc;
  }

  static async deleteFile(fileId: string, userId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: fileId, userId },
      { $set: { isDeleted: true } }
    );
  }

  static async getFileByPath(path: string): Promise<FileDocument | null> {
    const collection = await this.getCollection();
    return collection.findOne({ path, isDeleted: { $ne: true } });
  }
} 