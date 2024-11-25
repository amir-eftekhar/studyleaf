'use client';

import { useState, useEffect } from 'react';

export function ProcessingStatus({ documentId }: { documentId: string }) {
  const [status, setStatus] = useState<string>('pending');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // Maximum number of checks

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/processing-status?documentId=${documentId}`);
        const data = await response.json();
        
        setStatus(data.status);
        setProgress(Math.round((data.processedSections / data.totalSections) * 100) || 0);

        if (data.status === 'completed' || data.status === 'error' || attempts >= MAX_ATTEMPTS) {
          return; // Stop checking
        }

        attempts++;
        timeoutId = setTimeout(checkStatus, 2000); // Check every 2 seconds
      } catch (error) {
        console.error('Error checking processing status:', error);
        setStatus('error');
      }
    };

    checkStatus();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [documentId]);

  return (
    <div>
      <p>Status: {status}</p>
      {status === 'processing' && <p>Progress: {progress}%</p>}
      {status === 'error' && <p>Error processing document</p>}
    </div>
  );
} 