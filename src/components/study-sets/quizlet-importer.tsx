'use client'
import { useState } from 'react'
import { FiLink, FiDownload } from 'react-icons/fi'
import axios from 'axios'

interface QuizletImporterProps {
  isDark: boolean;
  onImport: (terms: { term: string; definition: string }[]) => void;
}

export default function QuizletImporter({ isDark, onImport }: QuizletImporterProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/import/quizlet', { url })
      onImport(response.data.terms)
    } catch (err) {
      setError('Failed to import from Quizlet. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-6 rounded-lg ${
      isDark ? 'bg-gray-800' : 'bg-white'
    } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center mb-4">
        <FiLink className={`mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Import from Quizlet
        </h3>
      </div>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Paste Quizlet URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-indigo-500`}
        />
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <button
          onClick={handleImport}
          disabled={loading || !url}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg ${
            loading || !url
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white font-medium transition-colors duration-200`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <FiDownload className="mr-2" />
              Import Set
            </>
          )}
        </button>
      </div>
    </div>
  )
}
