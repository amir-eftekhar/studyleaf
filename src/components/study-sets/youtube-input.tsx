'use client'
import { useState } from 'react'
import { FiYoutube } from 'react-icons/fi'
import axios from 'axios'

export default function YoutubeInput({ isDark }: { isDark: boolean }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!url) return

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/study-sets/youtube', { url })

      if (response.data.success) {
        window.location.href = `/sets/${response.data.studySet._id}`
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to process video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center mb-4">
          <FiYoutube className="h-8 w-8 text-red-600 mr-3" />
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create from YouTube Video
          </h3>
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube video URL"
          className={`w-full px-4 py-3 rounded-lg ${
            isDark 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-indigo-500`}
        />
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-800'
        }`}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!url || loading}
        className={`w-full py-3 rounded-lg ${
          isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white font-medium disabled:opacity-50`}
      >
        {loading ? 'Processing...' : 'Create Study Set from Video'}
      </button>
    </div>
  )
} 