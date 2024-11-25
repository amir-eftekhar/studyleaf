'use client';

import { useState, useEffect } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number; // milliseconds per character
}

export function StreamingText({ text, speed = 1 }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    if (!text) return;

    let currentIndex = 0;
    const textLength = text.length;
    
    // Process multiple characters per frame for faster streaming
    const charsPerFrame = Math.max(1, Math.floor(textLength / (500 / speed))); // Adjust for desired duration
    
    const streamInterval = setInterval(() => {
      if (currentIndex < textLength) {
        const nextIndex = Math.min(currentIndex + charsPerFrame, textLength);
        setDisplayedText(prev => prev + text.slice(currentIndex, nextIndex));
        currentIndex = nextIndex;
      } else {
        clearInterval(streamInterval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(streamInterval);
  }, [text, speed]);

  // Apply markdown styling to the streamed text
  const formattedText = displayedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  return (
    <div 
      className={`prose dark:prose-invert max-w-none ${!isComplete ? 'animate-pulse' : ''}`}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
} 