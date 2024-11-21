'use client'
import { useState } from 'react'
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi'
import axios from 'axios'

interface Term {
  term: string
  definition: string
}

interface CreateStudySetModalProps {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
}

export default function CreateStudySetModal({ isOpen, onClose, isDark }: CreateStudySetModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [terms, setTerms] = useState<Term[]>([{ term: '', definition: '' }])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const addTerm = () => {
    setTerms([...terms, { term: '', definition: '' }])
  }

  const removeTerm = (index: number) => {
    if (terms.length > 1) {
      setTerms(terms.filter((_, i) => i !== index))
    }
  }

  const updateTerm = (index: number, field: 'term' | 'definition', value: string) => {
    const newTerms = [...terms]
    newTerms[index][field] = value
    setTerms(newTerms)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!title) {
        throw new Error('Title is required')
      }

      if (terms.some(term => !term.term || !term.definition)) {
        throw new Error('All terms and definitions are required')
      }

      const response = await axios.post('/api/study-sets', {
        title,
        description,
        terms,
        source: 'manual'
      })

      if (response.data.success) {
        onClose()
        window.location.href = `/sets/${response.data.studySet._id}`
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Failed to create study set')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create New Study Set
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <FiX className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-indigo-500`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-indigo-500`}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Terms
              </h3>
              <button
                type="button"
                onClick={addTerm}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-500"
              >
                <FiPlus className="h-5 w-5" />
                <span>Add Term</span>
              </button>
            </div>

            {terms.map((term, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={term.term}
                    onChange={(e) => updateTerm(index, 'term', e.target.value)}
                    placeholder="Term"
                    className={`w-full px-4 py-2 rounded-md ${
                      isDark 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border focus:ring-2 focus:ring-indigo-500`}
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={term.definition}
                    onChange={(e) => updateTerm(index, 'definition', e.target.value)}
                    placeholder="Definition"
                    className={`w-full px-4 py-2 rounded-md ${
                      isDark 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border focus:ring-2 focus:ring-indigo-500`}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTerm(index)}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } ${terms.length === 1 ? 'invisible' : ''}`}
                >
                  <FiTrash2 className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Study Set'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 