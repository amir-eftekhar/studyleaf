import { MongoClient, ObjectId } from 'mongodb';
import type { FileAsset } from '@/types/files';
import path from 'path';
import fs from 'fs/promises';

const client = new MongoClient(process.env.MONGODB_URI!);

export class FileService {
  private static async getCollection() {
    await client.connect();
    const db = client.db('pdf_database');
    return db.collection<FileAsset>('file_assets');
  }

  static async createFile(fileData: Omit<FileAsset, '_id'>): Promise<FileAsset> {
    const collection = await this.getCollection();
    const result = await collection.insertOne({
      ...fileData,
      _id: new ObjectId().toString()
    } as FileAsset);

    return {
      ...fileData,
      _id: result.insertedId.toString()
    } as FileAsset;
  }

  static async getFilesByUser(userId: string): Promise<FileAsset[]> {
    const collection = await this.getCollection();
    return collection
      .find({ 
        userId, 
        isDeleted: false 
      })
      .sort({ uploadDate: -1 })
      .toArray();
  }

  static async getFileByPath(filePath: string): Promise<FileAsset | null> {
    const collection = await this.getCollection();
    return collection.findOne({ filePath });
  }

  static async getFileContent(fileId: string): Promise<Buffer | null> {
    const collection = await this.getCollection();
    const file = await collection.findOne({ _id: fileId });
    
    if (!file) return null;
    
    try {
      const filePath = path.join(process.cwd(), 'public', file.filePath);
      return fs.readFile(filePath);
    } catch (error) {
      console.error('Error reading file content:', error);
      return null;
    }
  }

  static async updateFileStatus(
    fileId: string, 
    status: FileAsset['processingStatus'],
    metadata?: Partial<FileAsset['metadata']>
  ): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: fileId },
      { 
        $set: { 
          processingStatus: status,
          ...(metadata && { metadata: { $merge: metadata } }),
          lastAccessed: new Date()
        } 
      }
    );
  }

  static async deleteFile(fileId: string, permanent: boolean = false): Promise<void> {
    const collection = await this.getCollection();
    
    if (permanent) {
      const file = await collection.findOne({ _id: fileId });
      if (file) {
        // Delete physical file
        try {
          await fs.unlink(path.join(process.cwd(), 'public', file.filePath));
        } catch (error) {
          console.error('Error deleting physical file:', error);
        }
      }
      await collection.deleteOne({ _id: fileId });
    } else {
      await collection.updateOne(
        { _id: fileId },
        { 
          $set: { 
            isDeleted: true,
            deletedAt: new Date()
          } 
        }
      );
    }
  }

  static async addTags(fileId: string, tags: string[]): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: fileId },
      { $addToSet: { tags: { $each: tags } } }
    );
  }

  static async removeTags(fileId: string, tags: string[]): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: fileId },
      { $pullAll: { tags } }
    );
  }

  static async archiveFile(fileId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: fileId },
      { $set: { isArchived: true } }
    );
  }

  static async unarchiveFile(fileId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: fileId },
      { $set: { isArchived: false } }
    );
  }

  static async updateLastAccessed(fileId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: fileId },
      { $set: { lastAccessed: new Date() } }
    );
  }

  static async searchFiles(
    userId: string,
    query: string,
    tags?: string[],
    fileType?: FileAsset['fileType']
  ): Promise<FileAsset[]> {
    const collection = await this.getCollection();
    
    const searchQuery: any = {
      userId,
      isDeleted: false,
      $or: [
        { originalName: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    if (tags?.length) {
      searchQuery.tags = { $all: tags };
    }

    if (fileType) {
      searchQuery.fileType = fileType;
    }

    return collection
      .find(searchQuery)
      .sort({ uploadDate: -1 })
      .toArray();
  }

  static async cleanup(): Promise<void> {
    // Cleanup files marked as deleted more than 30 days ago
    const collection = await this.getCollection();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filesToDelete = await collection
      .find({
        isDeleted: true,
        deletedAt: { $lt: thirtyDaysAgo }
      })
      .toArray();

    for (const file of filesToDelete) {
      await this.deleteFile(file._id, true);
    }
  }
} 