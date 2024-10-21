import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

interface EmbeddingDocument {
  _id: ObjectId;
  content: string;
  embedding: number[];
  metadata: {
    pageNumber: number;
    documentId: string;
    fileType: string;
    createdAt: Date;
  };
}

interface SystemPrompt {
  _id: ObjectId;
  documentId: string;
  prompt: string;
  createdAt: Date;
}

interface Note {
  _id: ObjectId;
  documentId: string;
  sectionId?: string;
  content: string;
  style: 'cornell' | 'bullet' | 'outline' | 'summary';
  createdAt: Date;
  updatedAt: Date;
}

interface StreamNote extends Note {
  previousContent: string;
  streamPosition: number;
}

interface LectureNote extends Note {
  lectureId: string;
  audioFilename: string;
}

export async function setupVectorSearch() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('pdf_database');
    const embeddingsCollection = db.collection<EmbeddingDocument>('embeddings');

    // Create vector index
    await embeddingsCollection.createIndex(
      { embedding: 1 } as any,
      {
        name: "vector_index",
        vectorSearchOptions: {
          numDimensions: 768, // Adjust based on your embedding model
          similarity: "cosine"
        }
      } as any
    );
    console.log('Vector index created successfully');

    // Create text index
    await embeddingsCollection.createIndex(
      { content: "text" },
      { name: "text_index" }
    );
    console.log('Text index created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

export async function insertEmbedding(content: string, embedding: number[], metadata: Omit<EmbeddingDocument['metadata'], 'createdAt'>) {
  const db = client.db('pdf_database');
  const embeddingsCollection = db.collection<EmbeddingDocument>('embeddings');

  await embeddingsCollection.insertOne({
    content,
    embedding,
    metadata: { ...metadata, createdAt: new Date() },
    _id: new ObjectId()
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function vectorSearch(queryEmbedding: number[], limit: number = 5, documentId?: string) {
  const db = client.db('pdf_database');
  const embeddingsCollection = db.collection<EmbeddingDocument>('embeddings');

  const filter = documentId ? { "metadata.documentId": documentId } : {};

  const results = await embeddingsCollection.aggregate([
    { $match: filter },
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: limit
      }
    },
    {
      $project: {
        content: 1,
        metadata: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]).toArray();

  return results;
}

export async function wordSearch(query: string, limit: number = 5, documentId?: string) {
  const db = client.db('pdf_database');
  const embeddingsCollection = db.collection<EmbeddingDocument>('embeddings');

  const filter = documentId ? { "metadata.documentId": documentId, $text: { $search: query } } : { $text: { $search: query } };

  const results = await embeddingsCollection.find(
    filter,
    { projection: { content: 1, metadata: 1, score: { $meta: "textScore" } } }
  ).sort({ score: { $meta: "textScore" } }).limit(limit).toArray();

  return results;
}

export async function storeSystemPrompt(documentId: string, prompt: string) {
  const db = client.db('pdf_database');
  const systemPromptsCollection = db.collection<SystemPrompt>('system_prompts');

  await systemPromptsCollection.updateOne(
    { documentId },
    { $set: { prompt, createdAt: new Date() } },
    { upsert: true }
  );
}

export async function getSystemPrompt(documentId: string): Promise<string | null> {
  const db = client.db('pdf_database');
  const systemPromptsCollection = db.collection<SystemPrompt>('system_prompts');

  const result = await systemPromptsCollection.findOne({ documentId });
  return result ? result.prompt : null;
}

export async function getDocumentSections(documentId: string): Promise<string[]> {
  const db = client.db('pdf_database');
  const embeddingsCollection = db.collection<EmbeddingDocument>('embeddings');

  const results = await embeddingsCollection.find(
    { "metadata.documentId": documentId },
    { projection: { content: 1 } }
  ).toArray();

  return results.map(doc => doc.content);
}

export async function closeConnection() {
  await client.close();
}

export async function storeNote(note: Omit<Note, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = client.db('pdf_database');
  const notesCollection = db.collection<Note>('notes');

  const now = new Date();
  await notesCollection.insertOne({
    ...note,
    _id: new ObjectId(),
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateStreamNote(documentId: string, content: string, previousContent: string, streamPosition: number) {
  const db = client.db('pdf_database');
  const streamNotesCollection = db.collection<StreamNote>('stream_notes');

  const now = new Date();
  await streamNotesCollection.updateOne(
    { documentId },
    {
      $set: {
        content,
        previousContent,
        streamPosition,
        updatedAt: now,
      },
    },
    { upsert: true }
  );
}

export async function getLatestStreamNote(documentId: string): Promise<StreamNote | null> {
  const db = client.db('pdf_database');
  const streamNotesCollection = db.collection<StreamNote>('stream_notes');

  return streamNotesCollection.findOne({ documentId }, { sort: { streamPosition: -1 } });
}

export async function getNotes(documentId: string, sectionId?: string): Promise<Note[]> {
  const db = client.db('pdf_database');
  const notesCollection = db.collection<Note>('notes');

  const query = sectionId ? { documentId, sectionId } : { documentId };
  return notesCollection.find(query).sort({ createdAt: 1 }).toArray();
}

export async function storeLectureNote(note: Omit<LectureNote, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = client.db('pdf_database');
  const lectureNotesCollection = db.collection<LectureNote>('lecture_notes');

  const now = new Date();
  await lectureNotesCollection.insertOne({
    ...note,
    _id: new ObjectId(),
    createdAt: now,
    updatedAt: now,
  });
}

export async function getLectureNotes(lectureId: string): Promise<LectureNote[]> {
  const db = client.db('pdf_database');
  const lectureNotesCollection = db.collection<LectureNote>('lecture_notes');

  return lectureNotesCollection.find({ lectureId }).sort({ createdAt: 1 }).toArray();
}
