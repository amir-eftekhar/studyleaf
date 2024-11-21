'use client'
import { useState, useEffect } from 'react'
import { motion, PanInfo } from 'framer-motion'
import axios from 'axios'
import { FiRotateCcw, FiCheck, FiX } from 'react-icons/fi'
import MainLayout from '@/components/layout/MainLayout'
import { useTheme } from '@/contexts/ThemeContext'

interface Term {
  _id: string
  term: string
  definition: string
  mastered: boolean
}

interface StudySet {
  _id: string
  title: string
  description: string
  terms: Term[]
  createdAt: string
  lastStudied: string | null
}

export default function StudySetPage({ params }: { params: { setId: string } }) {
  const { isDark } = useTheme()
  const [studySet, setStudySet] = useState<StudySet | null>(null)
  const [currentTermIndex, setCurrentTermIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [loading, setLoading] = useState(true)
  const [studyMode, setStudyMode] = useState<'cards' | 'swipe'>('cards')

  useEffect(() => {
    fetchStudySet()
  }, [params.setId])

  const fetchStudySet = async () => {
    try {
      const response = await axios.get(`/api/study-sets/${params.setId}`)
      setStudySet(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching study set:', error)
      setLoading(false)
    }
  }

  const handleDragEnd = async (info: PanInfo) => {
    if (!studySet) return

    const swipeThreshold = 100
    const direction = info.offset.x > 0 ? 'right' : 'left'
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const known = direction === 'right'
      await updateTermMastery(known)
      nextTerm()
    }
  }

  const updateTermMastery = async (mastered: boolean) => {
    if (!studySet) return
    const currentTerm = studySet.terms[currentTermIndex]

    try {
      await axios.patch(`/api/study-sets/${studySet._id}/terms/${currentTerm._id}`, {
        mastered
      })
    } catch (error) {
      console.error('Error updating term mastery:', error)
    }
  }

  const nextTerm = () => {
    setShowDefinition(false)
    if (currentTermIndex < (studySet?.terms.length || 0) - 1) {
      setCurrentTermIndex(prev => prev + 1)
    } else {
      // Completed all terms
      setCurrentTermIndex(0)
    }
  }

  const previousTerm = () => {
    setShowDefinition(false)
    if (currentTermIndex > 0) {
      setCurrentTermIndex(prev => prev - 1)
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

  if (!studySet) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-4">Study Set Not Found</h2>
          <p>The study set you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </MainLayout>
    )
  }

  const currentTerm = studySet.terms[currentTermIndex]

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ... rest of your component ... */}
      </div>
    </MainLayout>
  )
} 