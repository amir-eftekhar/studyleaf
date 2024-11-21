const checkProcessingStatus = async (documentId: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/process-document?documentId=${encodeURIComponent(documentId)}`);
    
    if (!response.ok) {
      console.error('Error checking status:', response.status, await response.text());
      throw new Error('Failed to check processing status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking processing status:', error);
    throw error;
  }
}; 