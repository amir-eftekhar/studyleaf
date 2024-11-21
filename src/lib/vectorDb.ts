import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cosineSimilarity } from '@/lib/utils';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const client = new MongoClient(process.env.MONGODB_URI || '');

export interface EmbeddingDocument {
  _id: string;
  documentId: string;
  content: string;
  embedding: number[];
  sectionIndex?: number;
  createdAt: Date;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export async function setupVectorSearch(documentId: string) {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    await db.collection('processing_status').updateOne(
      { documentId },
      { 
        $set: {
          documentId,
          status: 'processing',
          totalSections: 0,
          processedSections: 0,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error setting up vector search:', error);
    throw error;
  }
}

export async function insertEmbedding(
  documentId: string,
  content: string,
  embedding: number[],
  sectionIndex?: number
) {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    const doc = {
      documentId,
      content,
      embedding,
      sectionIndex: sectionIndex || null,
      createdAt: new Date()
    };

    console.log(`Inserting embedding for section ${sectionIndex || 'unknown'}`);
    
    await db.collection('embeddings').insertOne(doc);
  } catch (error) {
    console.error('Error inserting embedding:', error);
    throw error;
  }
}

export async function updateProcessingStatus(
  documentId: string,
  status: 'pending' | 'processing' | 'completed' | 'error',
  totalSections: number,
  processedSections: number = 0,
  error?: string
) {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    await db.collection('processing_status').updateOne(
      { documentId },
      { 
        $set: {
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

export async function getVectorStore(documentId: string): Promise<EmbeddingDocument[]> {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    const documents = await db.collection('embeddings')
      .find({ documentId })
      .toArray();
    
    return documents.map(doc => ({
      _id: doc._id.toString(),
      documentId: doc.documentId,
      content: doc.content,
      embedding: doc.embedding,
      sectionIndex: doc.sectionIndex,
      createdAt: new Date(doc.createdAt)
    })) as EmbeddingDocument[];
  } catch (error) {
    console.error('Error getting vector store:', error);
    throw error;
  }
}

interface ProcessingStatus {
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  totalSections: number;
  processedSections: number;
  error?: string;
  updatedAt: Date;
}

export async function getProcessingStatus(documentId: string): Promise<ProcessingStatus | null> {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    const status = await db.collection('processing_status').findOne({ documentId });
    
    if (!status) {
      return null;
    }

    return {
      documentId: status.documentId,
      status: status.status,
      totalSections: status.totalSections || 0,
      processedSections: status.processedSections || 0,
      error: status.error,
      updatedAt: new Date(status.updatedAt)
    };
  } catch (error) {
    console.error('Error getting processing status:', error);
    throw error;
  }
}

export async function vectorSearch(queryEmbedding: number[], limit: number = 5, documentId: string): Promise<SearchResult[]> {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    const documents = await db.collection('embeddings')
      .find({ documentId })
      .toArray();

    console.log(`Found ${documents.length} documents for search`);

    // Calculate similarity scores
    const scoredDocs = documents.map(doc => {
      // Validate embedding exists and has correct length
      if (!doc.embedding || !Array.isArray(doc.embedding)) {
        console.error('Invalid embedding for document:', doc._id);
        return null;
      }

      if (doc.embedding.length !== queryEmbedding.length) {
        console.error(`Embedding length mismatch: query=${queryEmbedding.length}, doc=${doc.embedding.length}`);
        return null;
      }

      try {
        return {
          content: doc.content,
          score: cosineSimilarity(queryEmbedding, doc.embedding),
          metadata: {
            pageNumber: doc.sectionIndex || 1
          }
        };
      } catch (error) {
        console.error('Error calculating similarity for document:', doc._id, error);
        return null;
      }
    })
    .filter((doc): doc is SearchResult => doc !== null);

    if (scoredDocs.length === 0) {
      console.log('No valid documents found for comparison');
      return [];
    }

    // Sort by similarity score and get top results
    return scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in vector search:', error);
    throw error;
  }
}

interface SearchResult {
  content: string;
  score: number;
  metadata: {
    pageNumber: number;
  };
}

// Add this function to validate embeddings
export async function validateEmbeddings(documentId: string): Promise<boolean> {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    const documents = await db.collection('embeddings')
      .find({ documentId })
      .toArray();

    let isValid = true;
    const expectedLength = 1536; // Google's embedding length

    for (const doc of documents) {
      if (!doc.embedding || !Array.isArray(doc.embedding)) {
        console.error(`Invalid embedding format for document ${doc._id}`);
        isValid = false;
        continue;
      }

      if (doc.embedding.length !== expectedLength) {
        console.error(`Wrong embedding length for document ${doc._id}: ${doc.embedding.length}`);
        isValid = false;
      }
    }

    return isValid;
  } catch (error) {
    console.error('Error validating embeddings:', error);
    return false;
  }
}

// Update the search route to use validation
export async function search(query: string, documentId: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    console.log('Generating embedding for query:', query);
    const queryEmbedding = await generateEmbedding(query);
    
    console.log('Getting vector store for document:', documentId);
    const documents = await getVectorStore(documentId);
    
    if (!documents || documents.length === 0) {
      console.log('No documents found in vector store');
      return [];
    }

    console.log(`Found ${documents.length} documents in store`);

    // Calculate similarity scores
    const scoredDocs = documents.map(doc => {
      try {
        return {
          content: doc.content,
          score: cosineSimilarity(queryEmbedding, doc.embedding),
          metadata: {
            pageNumber: doc.sectionIndex || 1
          }
        };
      } catch (error) {
        console.error('Error calculating similarity for document:', doc._id, error);
        return null;
      }
    }).filter((doc): doc is SearchResult => doc !== null);

    // Sort by similarity score and get top results
    return scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    console.error('Error in search:', error);
    throw error;
  }
}

// Update the getContentForPages function
export async function getContentForPages(documentId: string, startPage: number, endPage: number): Promise<string | null> {
  try {
    await client.connect();
    const db = client.db('pdf_database');
    
    // First check if document exists and is processed
    const status = await db.collection('processing_status').findOne({ documentId });
    if (!status || status.status !== 'completed') {
      console.log('Document not fully processed:', { documentId, status: status?.status });
      return null;
    }

    // Get all embeddings for the document
    const sections = await db.collection('embeddings')
      .find({ 
        documentId,
        $or: [
          // Match documents with sectionIndex in range
          {
            sectionIndex: { 
              $gte: startPage, 
              $lte: endPage 
            }
          },
          // Also match documents without sectionIndex (for backward compatibility)
          { sectionIndex: { $exists: false } }
        ]
      })
      .sort({ sectionIndex: 1 })
      .toArray();

    if (!sections || sections.length === 0) {
      console.log('No sections found for pages:', { documentId, startPage, endPage });
      return null;
    }

    console.log(`Found ${sections.length} sections for pages ${startPage}-${endPage}`);

    // If no sections have sectionIndex, return all content
    const hasPageNumbers = sections.some(s => s.sectionIndex !== undefined);
    if (!hasPageNumbers) {
      console.log('No page numbers found, returning all content');
      return sections.map(section => section.content).join('\n\n');
    }

    // Filter sections within the page range
    const validSections = sections
      .filter(section => {
        const pageNum = section.sectionIndex || 1;
        return pageNum >= startPage && pageNum <= endPage;
      })
      .sort((a, b) => (a.sectionIndex || 1) - (b.sectionIndex || 1));

    if (validSections.length === 0) {
      console.log('No valid sections found in page range');
      return null;
    }

    console.log(`Returning ${validSections.length} valid sections`);
    return validSections.map(section => section.content).join('\n\n');

  } catch (error) {
    console.error('Error getting content for pages:', error);
    return null;
  }
}
