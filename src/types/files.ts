export interface FileDocument {
  _id: string;
  userId: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: Date;
  isDeleted: boolean;
} 