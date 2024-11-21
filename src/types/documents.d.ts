export interface UserDocument {
  _id: string;
  userId: string;
  title: string;
  path: string;
  uploadDate: Date;
  lastAccessed: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  fileSize: number;
  pageCount?: number;
  isVectorized: boolean;
  tags?: string[];
} 