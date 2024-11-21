'use client'

import React from 'react'
import { LoadingAnimation } from './LoadingAnimation'
import { MarkdownRenderer } from './MarkdownRenderer'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  streamingContent?: string
  isLast?: boolean
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  isStreaming,
  streamingContent,
  isLast
}) => {
  return (
    <div
      className={`p-4 rounded-lg mb-4 ${
        role === 'assistant' 
          ? 'bg-secondary text-secondary-foreground ml-4' 
          : 'bg-muted text-muted-foreground mr-4'
      }`}
    >
      {role === 'assistant' && isStreaming && isLast ? (
        <div className="relative">
          <MarkdownRenderer>{streamingContent || ''}</MarkdownRenderer>
          <div className="mt-2">
            <LoadingAnimation />
          </div>
        </div>
      ) : (
        <MarkdownRenderer>{content}</MarkdownRenderer>
      )}
    </div>
  )
}
