'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StudySet {
  _id: string
  title: string
  description: string
  terms: Array<{ term: string; definition: string }>
  createdAt: string
  lastStudied: string | null
  studyProgress: number
}

export function StudySetGrid() {
  const [studySets, setStudySets] = useState<StudySet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudySets() {
      try {
        const response = await fetch('/api/study-sets')
        if (!response.ok) {
          throw new Error('Failed to fetch study sets')
        }
        const data = await response.json()
        setStudySets(data)
      } catch (err) {
        console.error('Error fetching study sets:', err)
        setError('Failed to load study sets')
      } finally {
        setLoading(false)
      }
    }

    fetchStudySets()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading your study sets...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (studySets.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CreateSetCard />
        <div className="col-span-2 flex items-center justify-center text-muted-foreground">
          You haven't created any study sets yet. Click the + to create your first set!
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {studySets.map((set) => (
        <StudySetCard key={set._id} studySet={set} />
      ))}
      <CreateSetCard />
    </div>
  )
}

interface StudySetCardProps {
  studySet: StudySet
}

function StudySetCard({ studySet }: StudySetCardProps) {
  const router = useRouter()
  const termCount = studySet.terms.length
  const progress = Math.round((studySet.studyProgress || 0) * 100)
  const lastStudied = studySet.lastStudied 
    ? new Date(studySet.lastStudied).toLocaleDateString()
    : 'Never'

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      onClick={() => router.push(`/sets/${studySet._id}`)}
    >
      <Card className="p-6 cursor-pointer hover:border-primary/50 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{studySet.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{studySet.description}</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="text-primary">
              {Math.round(progress * termCount / 100)}/{termCount} terms
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Last studied {lastStudied}</span>
          </div>
          <span>{termCount} cards</span>
        </div>
      </Card>
    </motion.div>
  )
}

function CreateSetCard() {
  const router = useRouter()
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      onClick={() => router.push('/create')}
    >
      <Card className="p-6 cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center min-h-[200px]">
        <div className="p-3 rounded-full bg-primary/10 mb-4">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Create New Set</h3>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          Add a new study set to your collection
        </p>
      </Card>
    </motion.div>
  )
}