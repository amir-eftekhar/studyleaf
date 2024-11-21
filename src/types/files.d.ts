export interface FileAsset {
  _id: string;
  userId: string;
  documentId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: 'pdf' | 'image' | 'audio';
  fileSize: number;
  uploadDate: Date;
  lastAccessed: Date;
  isProcessed: boolean;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  metadata: {
    pageCount?: number;
    duration?: number; // for audio files
    dimensions?: { width: number; height: number }; // for images
    mimeType: string;
    encoding: string;
  };
  tags: string[];
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
} 