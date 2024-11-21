'use client'
import { useState } from 'react'
import { FiYoutube, FiLoader } from 'react-icons/fi'
import axios from 'axios'

interface StudySetPreferences {
  numTerms: number;
  focusAreas: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  strugglingTopics: string[];
}

interface YoutubeProcessorProps {
  isDark: boolean;
  onProcess: (terms: { term: string; definition: string }[]) => void;
  preferences: StudySetPreferences;
}

export default function YoutubeProcessor({ isDark, onProcess, preferences }: YoutubeProcessorProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [videoInfo, setVideoInfo] = useState<{ title: string; description: string } | null>(null)

  const handleProcess = async () => {
    if (!url) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/process/youtube', {
        url,
        additionalInfo,
        numTerms: preferences.numTerms,
        focusAreas: preferences.focusAreas,
        difficultyLevel: preferences.difficultyLevel,
        strugglingTopics: preferences.strugglingTopics
      })

      setVideoInfo(response.data.videoInfo)
      onProcess(response.data.terms)
    } catch (err) {
      setError('Failed to process YouTube video. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-6 rounded-lg ${
      isDark ? 'bg-gray-800' : 'bg-white'
    } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center mb-4">
        <FiYoutube className={`mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Create from YouTube Video
        </h3>
      </div>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Paste YouTube video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-indigo-500`}
        />
        
        {videoInfo && (
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {videoInfo.title}
            </h4>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {videoInfo.description}
            </p>
          </div>
        )}
        
        <textarea
          placeholder="Add any additional information or specific topics you want to focus on..."
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-indigo-500`}
          rows={4}
        />
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <button
          onClick={handleProcess}
          disabled={loading || !url}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg ${
            loading || !url
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white font-medium transition-colors duration-200`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <FiLoader className="animate-spin" />
              <span>Processing Video...</span>
            </div>
          ) : (
            <>
              <FiYoutube className="mr-2" />
              Process Video
            </>
          )}
        </button>
      </div>
    </div>
  )
}
