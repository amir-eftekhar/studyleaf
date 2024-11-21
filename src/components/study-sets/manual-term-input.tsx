'use client'
import { useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Term {
  term: string
  definition: string
  mastered?: boolean
  lastReviewed?: Date | null
}

interface ManualTermInputProps {
  isDark: boolean;
  title: string;
  description: string;
}

export default function ManualTermInput({ isDark, title, description }: ManualTermInputProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [terms, setTerms] = useState<Term[]>([{ term: '', definition: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addTerm = () => {
    setTerms([...terms, { term: '', definition: '' }])
  }

  const removeTerm = (index: number) => {
    if (terms.length > 1) {
      setTerms(terms.filter((_, i) => i !== index))
    }
  }

  const updateTerm = (index: number, field: keyof Term, value: string) => {
    const newTerms = [...terms]
    newTerms[index][field] = value
    setTerms(newTerms)
  }

  const handleSubmit = async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setError('You must be logged in to create a study set')
      return
    }

    if (!title) {
      setError('Title is required')
      return
    }

    if (terms.some(term => !term.term || !term.definition)) {
      setError('All terms and definitions are required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await axios.post('/api/study-sets', {
        title,
        description,
        terms: terms.map(term => ({
          ...term,
          mastered: false,
          lastReviewed: null
        })),
        source: 'manual'
      })

      if (response.data.success) {
        router.push(`/sets/${response.data.studySet._id}`)
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error creating study set:', error)
      setError(error.response?.data?.error || 'Failed to create study set')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {terms.map((term, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex space-x-4 p-4 rounded-lg ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-sm`}
          >
            <div className="flex-1">
              <input
                type="text"
                placeholder="Term"
                value={term.term}
                onChange={(e) => updateTerm(index, 'term', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-50 text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Definition"
                value={term.definition}
                onChange={(e) => updateTerm(index, 'definition', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-50 text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <button
              onClick={() => removeTerm(index)}
              className={`p-2 rounded-lg hover:bg-red-100 ${
                isDark ? 'text-red-400' : 'text-red-500'
              }`}
              disabled={terms.length === 1}
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <button
          onClick={addTerm}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Term</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || status !== 'authenticated'}
          className={`px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Creating...' : 'Create Study Set'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}