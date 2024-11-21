'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiBook, FiFile, FiClock, FiTag } from 'react-icons/fi'
import { useTheme } from 'next-themes'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'

interface Note {
  _id: string
  title: string
  content: string
  source: string
  sourceType: 'pdf' | 'lecture' | 'other'
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/api/notes')
      setNotes(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching notes:', error)
      setLoading(false)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesTag = !selectedTag || note.tags.includes(selectedTag)
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
              isDark 
                ? 'from-indigo-400 to-indigo-600' 
                : 'from-indigo-500 to-indigo-700'
            } bg-clip-text text-transparent`}>
              My Notes
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              All your generated notes from PDFs and lectures
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-200'
            }`}
          />
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                !selectedTag
                  ? 'bg-indigo-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTag === tag
                    ? 'bg-indigo-500 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border ${
            isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FiBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Notes Found
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery || selectedTag
                ? 'Try adjusting your search or filters'
                : 'Start by uploading PDFs or creating lecture notes'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredNotes.map((note) => (
              <motion.div
                key={note._id}
                whileHover={{ scale: 1.01 }}
                className={`${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } rounded-xl p-6 border`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <FiFile className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {note.sourceType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiClock className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {note.content.length > 200 
                    ? `${note.content.substring(0, 200)}...` 
                    : note.content}
                </p>

                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded-full text-xs ${
                        isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
