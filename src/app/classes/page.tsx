'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiPlus, FiFolder, FiBook, FiMoreVertical } from 'react-icons/fi'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'

interface StudySet {
  _id: string
  title: string
  description: string
  terms: { term: string; definition: string }[]
  createdAt: string
  lastStudied: string | null
}

interface Class {
  _id: string
  name: string
  description: string
  studySets: StudySet[]
  createdAt: string
}

export default function ClassesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassDescription, setNewClassDescription] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes')
      setClasses(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching classes:', error)
      setLoading(false)
    }
  }

  const handleCreateClass = async () => {
    try {
      await axios.post('/api/classes', {
        name: newClassName,
        description: newClassDescription
      })
      setShowCreateModal(false)
      setNewClassName('')
      setNewClassDescription('')
      fetchClasses()
    } catch (error) {
      console.error('Error creating class:', error)
    }
  }

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
              My Classes
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Organize your study sets by class
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isDark 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            <FiPlus size={20} />
            <span>Create Class</span>
          </motion.button>
        </div>

        {classes.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border ${
            isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Classes Yet
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your first class to start organizing your study sets
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`px-4 py-2 rounded-lg ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Create a Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <motion.div
                key={classItem._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push(`/classes/${classItem._id}`)}
                className={`${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } rounded-xl p-6 border cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {classItem.name}
                  </h3>
                  <button className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}>
                    <FiMoreVertical size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  </button>
                </div>
                
                <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {classItem.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiBook className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {classItem.studySets?.length || 0} study sets
                    </span>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Created {new Date(classItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md mx-4 p-6 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create New Class
              </h2>
              <input
                type="text"
                placeholder="Class Name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className={`w-full p-2 mb-4 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-900 border-gray-200'
                } border`}
              />
              <textarea
                placeholder="Description (optional)"
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
                className={`w-full p-2 mb-6 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-900 border-gray-200'
                } border`}
                rows={3}
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClass}
                  disabled={!newClassName.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  } disabled:opacity-50`}
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 