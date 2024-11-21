'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { FiPlus, FiTrash2, FiBook, FiArrowLeft } from 'react-icons/fi'
import { useTheme } from 'next-themes'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function ClassPage({ params }: { params: { classId: string } }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [classData, setClassData] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [availableStudySets, setAvailableStudySets] = useState<StudySet[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudySets, setSelectedStudySets] = useState<string[]>([])

  useEffect(() => {
    fetchClassData()
    fetchAvailableStudySets()
  }, [params.classId])

  const fetchClassData = async () => {
    try {
      const response = await axios.get(`/api/classes/${params.classId}`)
      setClassData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching class:', error)
      setLoading(false)
    }
  }

  const fetchAvailableStudySets = async () => {
    try {
      const response = await axios.get('/api/study-sets')
      setAvailableStudySets(response.data)
    } catch (error) {
      console.error('Error fetching study sets:', error)
    }
  }

  const handleAddStudySets = async () => {
    try {
      await axios.post(`/api/classes/${params.classId}/study-sets`, {
        studySetIds: selectedStudySets
      })
      setShowAddModal(false)
      setSelectedStudySets([])
      fetchClassData()
    } catch (error) {
      console.error('Error adding study sets:', error)
    }
  }

  const handleRemoveStudySet = async (studySetId: string) => {
    try {
      await axios.delete(`/api/classes/${params.classId}/study-sets`, {
        data: { studySetIds: [studySetId] }
      })
      fetchClassData()
    } catch (error) {
      console.error('Error removing study set:', error)
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

  if (!classData) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Class not found</h2>
            <Link href="/classes" className="text-indigo-500 hover:text-indigo-600">
              Return to Classes
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/classes')}
            className={`p-2 rounded-lg mr-4 ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {classData.name}
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {classData.description}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Study Sets
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isDark 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            <FiPlus size={20} />
            <span>Add Study Sets</span>
          </motion.button>
        </div>

        {classData.studySets.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border ${
            isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FiBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Study Sets Yet
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Add study sets to this class to start organizing your learning
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className={`px-4 py-2 rounded-lg ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Add Study Sets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classData.studySets.map((studySet) => (
              <motion.div
                key={studySet._id}
                whileHover={{ scale: 1.02 }}
                className={`${
                  isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } rounded-xl p-6 border relative group`}
              >
                <Link href={`/study-sets/${studySet._id}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {studySet.title}
                  </h3>
                  <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {studySet.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {studySet.terms.length} terms
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Created {new Date(studySet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemoveStudySet(studySet._id)
                  }}
                  className={`absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiTrash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Study Sets Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md mx-4 p-6 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Study Sets
              </h2>
              <div className="max-h-96 overflow-y-auto">
                {availableStudySets
                  .filter(set => !classData.studySets.some(cs => cs._id === set._id))
                  .map(studySet => (
                    <label
                      key={studySet._id}
                      className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${
                        isDark 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudySets.includes(studySet._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudySets([...selectedStudySets, studySet._id])
                          } else {
                            setSelectedStudySets(selectedStudySets.filter(id => id !== studySet._id))
                          }
                        }}
                        className="mr-3"
                      />
                      <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {studySet.title}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {studySet.terms.length} terms
                        </p>
                      </div>
                    </label>
                  ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedStudySets([])
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudySets}
                  disabled={selectedStudySets.length === 0}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  } text-white disabled:opacity-50`}
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
