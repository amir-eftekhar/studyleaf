'use client'
import { useState } from 'react'
import { FiUpload, FiFile, FiX } from 'react-icons/fi'
import axios from 'axios'

interface DocumentUploaderProps {
  isDark: boolean;
  onProcessed?: (text: string) => void;
}

export default function DocumentUploader({ isDark, onProcessed }: DocumentUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [processedText, setProcessedText] = useState<string>('')
  const [title, setTitle] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles])
      setError('')
      setProcessedText('')
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0 || !title.trim()) return

    setLoading(true)
    setError('')
    let allProcessedText = ''

    try {
      // Process each file sequentially
      for (const file of files) {
        const formData = new FormData()
        formData.append('document', file)

        const response = await axios.post('/api/study-sets/document', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (!response.data.success) {
          throw new Error(`Failed to process ${file.name}: ${response.data.error}`)
        }

        // Combine processed text with a separator
        allProcessedText += (allProcessedText ? '\n\n---\n\n' : '') + response.data.text
      }

      // Store the combined processed text
      setProcessedText(allProcessedText)

      // If onProcessed callback exists, use it
      if (onProcessed) {
        onProcessed(allProcessedText)
      } else {
        // Otherwise, create a study set with the processed text
        const studySetResponse = await axios.post('/api/study-sets', {
          title: title.trim(),
          description: `Study set created from ${files.length} document${files.length > 1 ? 's' : ''}: ${files.map(f => f.name).join(', ')}`,
          content: allProcessedText,
          source: 'document',
          preferences: {
            numTerms: 15,
            questionType: 'definition',
            focusAreas: [],
            difficultyLevel: 'intermediate'
          }
        })

        if (studySetResponse.data.success && studySetResponse.data.studySet._id) {
          window.location.href = `/sets/${studySetResponse.data.studySet._id}`
        } else {
          throw new Error('Failed to create study set')
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Failed to process documents')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label 
          htmlFor="title" 
          className={`block mb-2 text-sm font-medium ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Study Set Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your study set"
          required
          className={`w-full p-2.5 rounded-lg border ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:ring-2 focus:ring-indigo-500`}
        />
      </div>

      <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
      } transition-colors duration-200`}>
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="document-upload"
          multiple
        />
        <label
          htmlFor="document-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <FiFile className={`h-12 w-12 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Choose documents
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Upload any document type
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Selected Files:
          </p>
          {files.map((file, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-2 rounded ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {file.name}
              </span>
              <button
                onClick={() => removeFile(index)}
                className={`p-1 rounded-full hover:bg-gray-700 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-800'
        }`}>
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={files.length === 0 || loading || !title.trim()}
        className={`w-full py-3 rounded-lg ${
          isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white font-medium disabled:opacity-50 transition-colors duration-200`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Create Study Set from Documents'
        )}
      </button>
    </div>
  )
}