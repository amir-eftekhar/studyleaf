// Declare the self type for the Web Worker scope
declare const self: Worker;

interface TranscriptionChunk {
  text: string;
  timestamp: [number, number | null];
  finalised: boolean;
  offset: number;
}

// Mock transcription for now - we'll implement the actual Whisper integration later
async function mockTranscribe(audioBlob: Blob): Promise<TranscriptionChunk[]> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [{
    text: "This is a test transcription.",
    timestamp: [0, 2],
    finalised: true,
    offset: 0
  }];
}

self.addEventListener('message', async (event) => {
  try {
    const { audio } = event.data;
    
    // Send processing status
    self.postMessage({
      status: 'update',
      data: {
        chunks: [],
        tps: 0
      }
    });

    // Process the audio
    const chunks = await mockTranscribe(audio);

    // Send the final result
    self.postMessage({
      status: 'complete',
      data: {
        chunks,
        tps: 1.0
      }
    });
  } catch (error) {
    console.error('Transcription error:', error);
    self.postMessage({
      status: 'error',
      data: {
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    });
  }
});
