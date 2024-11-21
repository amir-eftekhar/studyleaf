'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FiBook, FiClock, FiTarget, FiBrain, FiSliders, FiBell } from 'react-icons/fi'
import axios from 'axios'

const academicLevels = [
  { id: 'high_school', label: 'High School' },
  { id: 'undergraduate', label: 'Undergraduate' },
  { id: 'graduate', label: 'Graduate' },
  { id: 'professional', label: 'Professional' },
  { id: 'other', label: 'Other' }
]

const learningStyles = [
  { id: 'visual', label: 'Visual', icon: '👁️', description: 'Learn best through images, diagrams, and spatial understanding' },
  { id: 'auditory', label: 'Auditory', icon: '👂', description: 'Prefer learning through listening and speaking' },
  { id: 'reading', label: 'Reading/Writing', icon: '📚', description: 'Learn best through written words' },
  { id: 'kinesthetic', label: 'Kinesthetic', icon: '🤸', description: 'Learn through hands-on experience and practice' }
]

const difficultyLevels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
]

export default function PreferencesSetup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    academicLevel: '',
    institution: '',
    major: '',
    preferredSubjects: [] as string[],
    studyGoals: [] as string[],
    dailyStudyTime: 60,
    preferredLearningStyle: '',
    difficultyLevel: 'intermediate',
    reminderFrequency: 'daily',
    focusAreas: [] as string[]
  })

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await axios.put('/api/user/preferences', preferences)
      router.push('/home')
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Set Up Your Study Preferences</h2>
          <p className="mt-2 text-gray-600">Help us personalize your learning experience</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">Step {step} of 4</div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Academic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Level
                  </label>
                  <select
                    value={preferences.academicLevel}
                    onChange={(e) => setPreferences({ ...preferences, academicLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select your level</option>
                    {academicLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution (Optional)
                  </label>
                  <input
                    type="text"
                    value={preferences.institution}
                    onChange={(e) => setPreferences({ ...preferences, institution: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your school or institution"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major/Field of Study (Optional)
                  </label>
                  <input
                    type="text"
                    value={preferences.major}
                    onChange={(e) => setPreferences({ ...preferences, major: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your major or field of study"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Learning Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setPreferences({ ...preferences, preferredLearningStyle: style.id })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      preferences.preferredLearningStyle === style.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.icon}</div>
                    <div className="font-medium">{style.label}</div>
                    <div className="text-sm text-gray-600">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Study Goals & Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Study Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={preferences.dailyStudyTime}
                    onChange={(e) => setPreferences({ ...preferences, dailyStudyTime: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Study Times
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Morning', 'Afternoon', 'Evening', 'Late Night'].map((time) => (
                      <label key={time} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.studyGoals.includes(time)}
                          onChange={(e) => {
                            const newGoals = e.target.checked
                              ? [...preferences.studyGoals, time]
                              : preferences.studyGoals.filter(g => g !== time);
                            setPreferences({ ...preferences, studyGoals: newGoals });
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Frequency
                  </label>
                  <select
                    value={preferences.reminderFrequency}
                    onChange={(e) => setPreferences({ ...preferences, reminderFrequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Focus Areas & Difficulty</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Subjects
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Mathematics', 'Science', 'History', 'Literature',
                      'Languages', 'Computer Science', 'Arts', 'Business'
                    ].map((subject) => (
                      <label key={subject} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.preferredSubjects.includes(subject)}
                          onChange={(e) => {
                            const newSubjects = e.target.checked
                              ? [...preferences.preferredSubjects, subject]
                              : preferences.preferredSubjects.filter(s => s !== subject);
                            setPreferences({ ...preferences, preferredSubjects: newSubjects });
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={preferences.difficultyLevel}
                    onChange={(e) => setPreferences({ ...preferences, difficultyLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {difficultyLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Areas
                  </label>
                  <div className="space-y-2">
                    {[
                      'Exam Preparation', 'Homework Help', 'Concept Understanding',
                      'Problem Solving', 'Memory Improvement', 'Speed Learning'
                    ].map((area) => (
                      <label key={area} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.focusAreas.includes(area)}
                          onChange={(e) => {
                            const newAreas = e.target.checked
                              ? [...preferences.focusAreas, area]
                              : preferences.focusAreas.filter(a => a !== area);
                            setPreferences({ ...preferences, focusAreas: newAreas });
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-700"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 