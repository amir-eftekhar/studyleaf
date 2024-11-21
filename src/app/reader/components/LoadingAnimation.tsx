'use client'

import React from 'react'

export const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 text-gray-500">
      <div className="w-2 h-2 rounded-full animate-pulse bg-gray-500"></div>
      <div className="w-2 h-2 rounded-full animate-pulse bg-gray-500" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 rounded-full animate-pulse bg-gray-500" style={{ animationDelay: '0.4s' }}></div>
    </div>
  )
}

export const StreamingMessage: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="relative">
      <div className="markdown-content">{content}</div>
      <div className="absolute bottom-0 left-0">
        <LoadingAnimation />
      </div>
    </div>
  )
}
