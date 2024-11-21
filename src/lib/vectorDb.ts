import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Add caching for embeddings
const embeddingCache = new Map<string, number[]>();
const searchCache = new Map<string, any[]>();

interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'error';
  processedSections: number;
  totalSections: number;
  error?: string;
  documentId: string;
  updatedAt: Date;
}

interface EmbeddingDocument {
  documentId: string;
  content: string;
  embedding: number[];
  sectionNumber: number;
  timestamp: Date;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const cacheKey = text;
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await embeddingModel.embedContent(text);
  const embedding = result.embedding.values;
  
  embeddingCache.set(cacheKey, embedding);
  return embedding;
}

async function setupVectorSearch(documentId: string) {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    // Create indexes if they don't exist
    await db.collection('embeddings').createIndex({ documentId: 1 });
    await db.collection('embeddings').createIndex({ 
      documentId: 1,
      sectionNumber: 1 
    });
    
    // Clear existing embeddings for this document
    await db.collection('embeddings').deleteMany({ documentId });
    
    // Initialize processing status
    await updateProcessingStatus(documentId, 'pending', 0, 0);
    
    console.log('Vector search setup completed for:', documentId);
  } catch (error) {
    console.error('Error setting up vector search:', error);
    throw error;
  }
}

async function insertEmbedding(
  documentId: string, 
  content: string, 
  embedding: number[],
  sectionNumber: number
) {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    const embeddingDoc: EmbeddingDocument = {
      documentId,
      content,
      embedding,
      sectionNumber,
      timestamp: new Date()
    };

    await db.collection<EmbeddingDocument>('embeddings').updateOne(
      { documentId, sectionNumber },
      { $set: embeddingDoc },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error inserting embedding:', error);
    throw error;
  }
}

async function getVectorStore(documentId: string) {
  try {
    await client.connect();
    const db = client.db('pdf_database');

    return {
      async similaritySearch(query: string, k: number = 5) {
        const cacheKey = `${documentId}:${query}:${k}`;
        if (searchCache.has(cacheKey)) {
          return searchCache.get(cacheKey)!;
        }

        const queryEmbedding = await generateEmbedding(query);
        
        const results = await db.collection('embeddings')
          .aggregate([
            { $match: { documentId } },
            {
              $addFields: {
                similarity: {
                  $reduce: {
                    input: { $range: [0, { $size: "$embedding" }] },
                    initialValue: 0,
                    in: {
                      $add: [
                        "$$value",
                        { $multiply: [
                          { $arrayElemAt: ["$embedding", "$$this"] },
                          { $arrayElemAt: [queryEmbedding, "$$this"] }
                        ]}
                      ]
                    }
                  }
                }
              }
            },
            { $sort: { similarity: -1 } },
            { $limit: k },
            { $project: { content: 1, similarity: 1 } }
          ]).toArray();

        searchCache.set(cacheKey, results);
        return results;
      }
    };
  } catch (error) {
    console.error('Error getting vector store:', error);
    return null;
  }
}

async function updateProcessingStatus(
  documentId: string,
  status: ProcessingStatus['status'],
  totalSections: number,
  processedSections: number,
  error?: string
) {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    await db.collection('processing_status').updateOne(
      { documentId },
      { 
        $set: {
          documentId,
          status,
          totalSections,
          processedSections,
          error,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating processing status:', error);
    throw error;
  }
}

async function getProcessingStatus(documentId: string): Promise<ProcessingStatus | null> {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    const result = await db.collection('processing_status').findOne({ documentId });
    
    if (!result) return null;

    // Transform the MongoDB document into ProcessingStatus type
    return {
      status: result.status as ProcessingStatus['status'],
      processedSections: result.processedSections,
      totalSections: result.totalSections,
      documentId: result.documentId,
      updatedAt: new Date(result.updatedAt),
      error: result.error
    };
  } catch (error) {
    console.error('Error getting processing status:', error);
    return null;
  }
}

// Export all functions in a single export statement
export {
  generateEmbedding,
  setupVectorSearch,
  insertEmbedding,
  getVectorStore,
  updateProcessingStatus,
  getProcessingStatus
};
