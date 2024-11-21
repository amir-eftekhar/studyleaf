'use client'
import { useState, useRef } from 'react'
import { FiFile, FiLoader } from 'react-icons/fi'
import { PDFDocumentProxy } from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist'
import axios from 'axios'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type QuestionType = 'multiple-choice' | 'conceptual' | 'definition' | 'descriptive'

export default function DocumentUploader({ isDark, onProcessed }: { 
  isDark: boolean;
  onProcessed: (text: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [extractedText, setExtractedText] = useState<string>('')
  const [isCreatingSet, setIsCreatingSet] = useState(false)
  const [questionType, setQuestionType] = useState<QuestionType>('definition')
  const [title, setTitle] = useState('')

  const processFile = async (file: File) => {
    setLoading(true)
    setError('')
    setProgress(0)
    
    try {
      if (file.type.includes('pdf')) {
        // Process PDFs client-side
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        
        for (let i = 1; i <= pdf.numPages; i++) {
          setProgress(Math.round((i / pdf.numPages) * 100))
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items
            .map((item: any) => item.str)
            .join(' ')
          fullText += pageText + '\n\n'
        }
        
        setExtractedText(fullText.trim())
      } else {
        // Process other file types server-side
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await axios.post('/api/documents/process', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0
            setProgress(progress)
          }
        })

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to process file')
        }

        setExtractedText(response.data.text)
      }
    } catch (error: any) {
      setError('Failed to process file: ' + (error.message || 'Unknown error'))
      setExtractedText('')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      setExtractedText('')
      await processFile(selectedFile)
    }
  }

  const handleCreateSet = async () => {
    if (!extractedText || isCreatingSet || !title.trim()) return

    setIsCreatingSet(true)
    setError('')

    try {
      const response = await axios.post('/api/study-sets', {
        title: title.trim(),
        description: `Study set created from ${file?.name || 'document'}`,
        content: extractedText,
        source: file?.type.includes('pdf') ? 'pdf' : 'document',
        preferences: {
          numTerms: 15,
          questionType,
          focusAreas: [],
          difficultyLevel: 'intermediate'
        }
      })

      if (response.data.success && response.data.studySet._id) {
        window.location.href = `/sets/${response.data.studySet._id}`
      } else {
        throw new Error('Failed to create study set')
      }
    } catch (error: any) {
      setError('Failed to create study set: ' + (error.message || 'Unknown error'))
    } finally {
      setIsCreatingSet(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
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

      <div>
        <label 
          htmlFor="questionType" 
          className={`block mb-2 text-sm font-medium ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Question Type
        </label>
        <select
          id="questionType"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as QuestionType)}
          className={`w-full p-2.5 rounded-lg border ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-indigo-500`}
        >
          <option value="multiple-choice">Multiple Choice Questions</option>
          <option value="conceptual">Conceptual Questions</option>
          <option value="definition">Term Definitions</option>
          <option value="descriptive">Descriptive Questions</option>
        </select>
      </div>

      <div className={`relative border-2 border-dashed rounded-lg p-6 ${
        isDark 
          ? 'border-gray-600 hover:border-gray-500' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <input
          type="file"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <FiFile className={`mx-auto h-12 w-12 ${
            isDark ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <p className={`mt-2 text-sm ${
            isDark ? 'text-gray-200' : 'text-gray-500'
          }`}>
            {file ? file.name : 'Drop your document here or click to upload'}
          </p>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-gray-400' : 'text-gray-400'
          }`}>
            Supports all document types including PDFs, Word documents, images, audio files, and more
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {loading && (
        <div className="mt-4">
          <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Processing file... {progress}%
          </p>
        </div>
      )}

      <button
        onClick={handleCreateSet}
        disabled={!extractedText || isCreatingSet || !title.trim()}
        className={`w-full py-3 rounded-lg ${
          isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
        } ${
          (!extractedText || isCreatingSet || !title.trim()) ? 'opacity-50 cursor-not-allowed' : ''
        } text-white font-medium`}
      >
        {isCreatingSet ? 'Creating Study Set...' : 'Create Study Set'}
      </button>
    </div>
  )
}