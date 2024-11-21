'use client'
import { useState, useEffect } from 'react'
import { motion, PanInfo } from 'framer-motion'
import axios from 'axios'
import { FiRotateCcw, FiCheck, FiX, FiBook, FiBookOpen, FiTarget, FiEdit3, FiList, FiClock, FiLogOut } from 'react-icons/fi'
import { useTheme } from 'next-themes'
import MainLayout from '@/components/layout/MainLayout'
import { useRouter } from 'next/navigation'
import MatchGame from '@/components/study/MatchGame'
import QuizGame from '@/components/study/QuizGame'
import WriteGame from '@/components/study/WriteGame'
import TimedGame from '@/components/study/TimedGame'

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

export default function SwipeLearnPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [studySets, setStudySets] = useState<StudySet[]>([])
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [currentTermIndex, setCurrentTermIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [activeMode, setActiveMode] = useState<string | null>(null)

  useEffect(() => {
    fetchStudySets()
  }, [])

  const fetchStudySets = async () => {
    try {
      const response = await axios.get('/api/study-sets')
      setStudySets(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching study sets:', error)
      setLoading(false)
    }
  }

  const handleDragEnd = async (info: PanInfo) => {
    if (!selectedSetId) return

    const swipeThreshold = 100
    const direction = info.offset.x > 0 ? 'right' : 'left'
    
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const known = direction === 'right'
      await updateTermMastery(known)
      nextTerm()
    }
  }

  const updateTermMastery = async (mastered: boolean) => {
    if (!selectedSetId) return
    const currentSet = studySets.find(set => set._id === selectedSetId)
    if (!currentSet) return
    const currentTerm = currentSet.terms[currentTermIndex]

    try {
      await axios.patch(`/api/study-sets/${selectedSetId}/terms/${currentTerm._id}`, {
        mastered
      })
    } catch (error) {
      console.error('Error updating term mastery:', error)
    }
  }

  const nextTerm = () => {
    const currentSet = studySets.find(set => set._id === selectedSetId)
    if (!currentSet) return

    setShowDefinition(false)
    if (currentTermIndex < currentSet.terms.length - 1) {
      setCurrentTermIndex(prev => prev + 1)
    } else {
      // Completed all terms
      setCurrentTermIndex(0)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout')
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleComplete = (score: number) => {
    console.log(`Completed with score: ${score}`)
    // Handle completion - maybe show results or save progress
  }

  const handleMatchClick = () => {
    const currentSet = studySets.find(set => set._id === selectedSetId);
    if (!currentSet) return;

    // Convert terms to FlashCard format
    const cards = currentSet.terms.map(term => ({
      id: term._id,
      term: term.term,
      definition: term.definition,
    }));

    setActiveMode('match');
  };

  const handleQuizClick = () => {
    const currentSet = studySets.find(set => set._id === selectedSetId);
    if (!currentSet) return;

    // Convert terms to quiz questions
    const questions = currentSet.terms.map(term => ({
      id: term._id,
      question: term.term,
      correctAnswer: term.definition,
      options: [
        term.definition,
        ...currentSet.terms
          .filter(t => t._id !== term._id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(t => t.definition)
      ].sort(() => Math.random() - 0.5)
    }));

    setActiveMode('quiz');
  };

  const handleWriteClick = () => {
    const currentSet = studySets.find(set => set._id === selectedSetId);
    if (!currentSet) return;

    setActiveMode('write');
  };

  const handleTimedClick = () => {
    const currentSet = studySets.find(set => set._id === selectedSetId);
    if (!currentSet) return;

    setActiveMode('timed');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    )
  }

  if (studySets.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <FiBook className="h-16 w-16 text-indigo-400 mb-6" />
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No Study Sets Found
          </h2>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create a study set to start learning!
          </p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {!selectedSetId ? (
            <>
              <div className="mb-8">
                <h1 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${
                  isDark 
                    ? 'from-indigo-400 to-indigo-600' 
                    : 'from-indigo-500 to-indigo-700'
                } bg-clip-text text-transparent`}>
                  Choose a Set to Study
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select one of your study sets to begin the study session
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {studySets.map((set) => (
                  <div
                    key={set._id}
                    onClick={() => setSelectedSetId(set._id)}
                    className={`${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    } rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:scale-102 border`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {set.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {set.terms.length} terms
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ 
                            width: `${(set.terms.filter(t => t.mastered).length / set.terms.length) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Progress
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {set.terms.filter(t => t.mastered).length}/{set.terms.length} mastered
                        </span>
                      </div>
                    </div>

                    <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {set.lastStudied 
                        ? `Last studied ${new Date(set.lastStudied).toLocaleDateString()}`
                        : 'Not studied yet'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedSetId(null)
                    setCurrentTermIndex(0)
                    setShowDefinition(false)
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } transition-colors duration-200`}
                >
                  ← Back to Sets
                </button>
                <div className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {currentTermIndex + 1} / {studySets.find(set => set._id === selectedSetId)?.terms.length}
                </div>
              </div>

              {activeMode === 'quiz' ? (
                <QuizGame
                  questions={studySets
                    .find(set => set._id === selectedSetId)
                    ?.terms.map(term => ({
                      id: term._id,
                      question: term.term,
                      correctAnswer: term.definition,
                      options: [
                        term.definition,
                        ...studySets
                          .find(set => set._id === selectedSetId)
                          ?.terms.filter(t => t._id !== term._id)
                          .sort(() => Math.random() - 0.5)
                          .slice(0, 3)
                          .map(t => t.definition) || []
                      ].sort(() => Math.random() - 0.5)
                    })) || []}
                  onComplete={(score) => {
                    console.log('Quiz completed with score:', score);
                    setActiveMode(null);
                  }}
                />
              ) : activeMode === 'match' ? (
                <MatchGame
                  cards={studySets.find(set => set._id === selectedSetId)?.terms.map(term => ({
                    id: term._id,
                    term: term.term,
                    definition: term.definition,
                  })) || []}
                  onComplete={(score) => {
                    console.log('Match game completed with score:', score);
                    setActiveMode(null);
                  }}
                />
              ) : activeMode === 'write' ? (
                <WriteGame
                  terms={studySets.find(set => set._id === selectedSetId)?.terms.map(term => ({
                    term: term.term,
                    definition: term.definition
                  })) || []}
                  onComplete={(score) => {
                    console.log('Write game completed with score:', score);
                    setActiveMode(null);
                  }}
                />
              ) : activeMode === 'timed' ? (
                <TimedGame
                  terms={studySets.find(set => set._id === selectedSetId)?.terms.map(term => ({
                    term: term.term,
                    definition: term.definition
                  })) || []}
                  onComplete={(score) => {
                    console.log('Timed game completed with score:', score);
                    setActiveMode(null);
                  }}
                />
              ) : (
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => handleDragEnd(info)}
                  className={`aspect-[2/1.5] w-full max-w-4xl mx-auto rounded-2xl shadow-xl cursor-grab active:cursor-grabbing ${
                    isDark 
                      ? 'bg-indigo-900 border-gray-700' 
                      : 'bg-indigo-100 border-gray-200'
                  } border`}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div 
                    className="h-full p-8 flex flex-col justify-center items-center text-center"
                    onClick={() => setShowDefinition(!showDefinition)}
                  >
                    <div className="w-full max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                      <h2 className={`text-3xl font-medium mb-4 ${
                        isDark 
                          ? 'text-white' 
                          : 'text-gray-900'
                      }`}>
                        {showDefinition ? 'Definition:' : 'Term:'}
                      </h2>
                      <p className={`text-xl sm:text-2xl font-medium ${
                        isDark 
                          ? 'text-white' 
                          : 'text-gray-900'
                      } break-words`}>
                        {showDefinition 
                          ? studySets.find(set => set._id === selectedSetId)?.terms[currentTermIndex].definition
                          : studySets.find(set => set._id === selectedSetId)?.terms[currentTermIndex].term}
                      </p>
                    </div>
                    <p className={`mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click to flip &bull; Swipe right if you know it &bull; Swipe left if you don&apos;t
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-center space-x-6 mt-8 mb-12">
                <button
                  onClick={() => {
                    updateTermMastery(false)
                    nextTerm()
                  }}
                  className="p-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                >
                  <FiX size={24} />
                </button>
                <button
                  onClick={() => setShowDefinition(!showDefinition)}
                  className={`p-4 rounded-full ${
                    isDark 
                      ? 'bg-indigo-900 text-gray-200 hover:bg-indigo-800' 
                      : 'bg-indigo-100 text-gray-600 hover:bg-indigo-200'
                  } transition-colors duration-200`}
                >
                  <FiRotateCcw size={24} />
                </button>
                <button
                  onClick={() => {
                    updateTermMastery(true)
                    nextTerm()
                  }}
                  className="p-4 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200"
                >
                  <FiCheck size={24} />
                </button>
              </div>

              {!activeMode && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleQuizClick}
                    className={`p-6 rounded-xl text-left transition-all ${
                      isDark 
                        ? 'bg-gradient-to-br from-purple-900/90 to-purple-800/80 hover:from-purple-800/90 hover:to-purple-700/80 text-white border-purple-700' 
                        : 'bg-gradient-to-br from-purple-100 to-purple-50/90 hover:from-purple-200 hover:to-purple-100/90 text-gray-900 border-purple-200'
                    } border group`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg ${
                        isDark ? 'bg-purple-800/50' : 'bg-purple-200/50'
                      } group-hover:scale-110 transition-transform`}>
                        <FiTarget className={isDark ? 'text-purple-200' : 'text-purple-700'} size={20} />
                      </div>
                      <span className="ml-3 font-medium">Quiz</span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-purple-200/70' : 'text-purple-900/70'}`}>
                      Test your knowledge
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMatchClick}
                    className={`p-6 rounded-xl text-left transition-all w-full ${
                      isDark 
                        ? 'bg-gradient-to-br from-indigo-900/90 to-indigo-800/80 hover:from-indigo-800/90 hover:to-indigo-700/80 text-white border-indigo-700' 
                        : 'bg-gradient-to-br from-indigo-100 to-indigo-50/90 hover:from-indigo-200 hover:to-indigo-100/90 text-gray-900 border-indigo-200'
                    } border group mb-4`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg ${
                        isDark ? 'bg-indigo-800/50' : 'bg-indigo-200/50'
                      } group-hover:scale-110 transition-transform`}>
                        <FiBookOpen className={isDark ? 'text-indigo-200' : 'text-indigo-700'} size={20} />
                      </div>
                      <span className="ml-3 font-medium">Match</span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-indigo-200/70' : 'text-indigo-900/70'}`}>
                      Pair terms & definitions
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWriteClick}
                    className={`p-6 rounded-xl text-left transition-all ${
                      isDark 
                        ? 'bg-gradient-to-br from-blue-900/90 to-blue-800/80 hover:from-blue-800/90 hover:to-blue-700/80 text-white border-blue-700' 
                        : 'bg-gradient-to-br from-blue-100 to-blue-50/90 hover:from-blue-200 hover:to-blue-100/90 text-gray-900 border-blue-200'
                    } border group`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg ${
                        isDark ? 'bg-blue-800/50' : 'bg-blue-200/50'
                      } group-hover:scale-110 transition-transform`}>
                        <FiEdit3 className={isDark ? 'text-blue-200' : 'text-blue-700'} size={20} />
                      </div>
                      <span className="ml-3 font-medium">Write</span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-blue-200/70' : 'text-blue-900/70'}`}>
                      Practice writing answers
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTimedClick}
                    className={`p-6 rounded-xl text-left transition-all ${
                      isDark 
                        ? 'bg-gradient-to-br from-violet-900/90 to-violet-800/80 hover:from-violet-800/90 hover:to-violet-700/80 text-white border-violet-700' 
                        : 'bg-gradient-to-br from-violet-100 to-violet-50/90 hover:from-violet-200 hover:to-violet-100/90 text-gray-900 border-violet-200'
                    } border group`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg ${
                        isDark ? 'bg-violet-800/50' : 'bg-violet-200/50'
                      } group-hover:scale-110 transition-transform`}>
                        <FiClock className={isDark ? 'text-violet-200' : 'text-violet-700'} size={20} />
                      </div>
                      <span className="ml-3 font-medium">Timed</span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-violet-200/70' : 'text-violet-900/70'}`}>
                      Race against time
                    </p>
                  </motion.button>
                </div>
              )}

              <div className={`rounded-xl p-6 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-200'
              } border`}>
                <h3 className={`text-lg font-medium mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>All Terms</h3>
                
                <div className="space-y-4">
                  {studySets.find(set => set._id === selectedSetId)?.terms.map((term, index) => (
                    <div 
                      key={term._id}
                      className={`p-4 rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-gray-50 border-gray-200'
                      } border`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className={`font-medium mb-1 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {term.term}
                          </h4>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {term.definition}
                          </p>
                        </div>
                        <span className={`text-sm ${
                          isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {index + 1}/{studySets.find(set => set._id === selectedSetId)?.terms.length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
} 