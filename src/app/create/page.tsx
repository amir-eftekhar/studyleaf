'use client'
import { useState } from 'react'
import { FiUpload, FiLink, FiFile, FiYoutube, FiPlus } from 'react-icons/fi'
import { motion } from 'framer-motion'
import ManualTermInput from '@/components/study-sets/manual-term-input'
import PDFUploader from '@/components/study-sets/pdf-uploader'
import DocumentUploader from '@/components/study-sets/document-uploader'
import YoutubeProcessor from '@/components/study-sets/youtube-processor'
import QuizletImporter from '@/components/study-sets/quizlet-importer'
import FocusAreasInput from '@/components/study-sets/focus-areas-input'
import { useTheme } from '@/contexts/ThemeContext'
import MainLayout from '@/components/layout/MainLayout'
import axios from 'axios'

interface StudySetPreferences {
  numTerms: number;
  focusAreas: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  strugglingTopics: string[];
}

export default function CreateSetPage() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState<'manual' | 'pdf' | 'doc' | 'youtube' | 'quizlet'>('manual')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([])
  const [additionalInfo, setAdditionalInfo] = useState('')
  
  // Study set preferences
  const [preferences, setPreferences] = useState<StudySetPreferences>({
    numTerms: 15,
    focusAreas: [],
    difficultyLevel: 'intermediate',
    strugglingTopics: []
  })

  const handleTermsUpdate = (newTerms: { term: string; definition: string }[]) => {
    setTerms([...terms, ...newTerms])
  }

  const handleFocusAreaAdd = (area: string) => {
    if (!preferences.focusAreas.includes(area)) {
      setPreferences({
        ...preferences,
        focusAreas: [...preferences.focusAreas, area]
      })
    }
  }

  const handleStrugglingTopicAdd = (topic: string) => {
    if (!preferences.strugglingTopics.includes(topic)) {
      setPreferences({
        ...preferences,
        strugglingTopics: [...preferences.strugglingTopics, topic]
      })
    }
  }

  const handlePDFProcessed = async (text: string) => {
    try {
      // Create a study set directly with the extracted text
      const response = await axios.post('/api/study-sets', {
        title: title || 'PDF Study Set',
        description: description || 'Created from PDF',
        source: 'pdf',
        content: text,
        preferences
      })

      if (response.data.success) {
        window.location.href = `/sets/${response.data.studySet._id}`
      }
    } catch (error: any) {
      console.error('Failed to create study set:', error)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Create New Study Set
        </h1>

        {/* Title and Description */}
        <div className="mb-8 space-y-4">
          <label className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>Title</label>
          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-purple-500`}
          />
          <label className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>Description</label>
          <textarea
            placeholder="Add a description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-purple-500`}
            rows={3}
          />
        </div>

        {/* Study Set Preferences */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Study Set Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                Number of Terms
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={preferences.numTerms}
                onChange={(e) => setPreferences({
                  ...preferences,
                  numTerms: parseInt(e.target.value) || 15
                })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-purple-500`}
              />
            </div>
            <div>
              <label className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                Difficulty Level
              </label>
              <select
                value={preferences.difficultyLevel}
                onChange={(e) => setPreferences({
                  ...preferences,
                  difficultyLevel: e.target.value as StudySetPreferences['difficultyLevel']
                })}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-purple-500`}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-4">
            <label className={`block mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
              Additional Information
            </label>
            <textarea
              placeholder="Add any additional context, specific requirements, or learning goals..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${
                isDark 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-200'
              } border focus:ring-2 focus:ring-purple-500`}
              rows={4}
            />
          </div>
        </div>

        {/* Input Method Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          <TabButton
            active={activeTab === 'manual'}
            onClick={() => setActiveTab('manual')}
            icon={<FiPlus />}
            label="Manual Input"
            isDark={isDark}
          />
          <TabButton
            active={activeTab === 'pdf'}
            onClick={() => setActiveTab('pdf')}
            icon={<FiFile />}
            label="Upload PDF"
            isDark={isDark}
          />
          <TabButton
            active={activeTab === 'doc'}
            onClick={() => setActiveTab('doc')}
            icon={<FiUpload />}
            label="Upload Document"
            isDark={isDark}
          />
          <TabButton
            active={activeTab === 'youtube'}
            onClick={() => setActiveTab('youtube')}
            icon={<FiYoutube />}
            label="YouTube Video"
            isDark={isDark}
          />
          <TabButton
            active={activeTab === 'quizlet'}
            onClick={() => setActiveTab('quizlet')}
            icon={<FiLink />}
            label="Import from Quizlet"
            isDark={isDark}
          />
        </div>

        {/* Content Based on Active Tab */}
        <div className="mt-6">
          {activeTab === 'manual' && (
            <ManualTermInput 
              isDark={isDark} 
              title={title}
              description={description}
              initialTerms={terms}
              onTermsUpdate={setTerms}
              preferences={preferences}
              buttonText="Add to Context"
              className="bg-gradient-to-r from-purple-600 to-purple-700"
            />
          )}
          {activeTab === 'pdf' && (
            <>
              <PDFUploader 
                isDark={isDark}
                onProcessed={handlePDFProcessed} 
              />
              <FocusAreasInput
                isDark={isDark}
                onFocusAreaAdd={handleFocusAreaAdd}
                onStrugglingTopicAdd={handleStrugglingTopicAdd}
              />
            </>
          )}
          {activeTab === 'doc' && (
            <>
              <DocumentUploader 
                isDark={isDark}
                additionalInfo={additionalInfo}
                onTermsGenerated={handleTermsUpdate}
                preferences={preferences}
                buttonText="Add to Context"
                className="bg-gradient-to-r from-purple-600 to-purple-700"
              />
              <FocusAreasInput
                isDark={isDark}
                onFocusAreaAdd={handleFocusAreaAdd}
                onStrugglingTopicAdd={handleStrugglingTopicAdd}
              />
            </>
          )}
          {activeTab === 'youtube' && (
            <>
              <YoutubeProcessor 
                isDark={isDark}
                onProcess={handleTermsUpdate}
                preferences={preferences}
                buttonText="Add to Context"
                className="bg-gradient-to-r from-purple-600 to-purple-700"
                processButtonClass="bg-gradient-to-r from-purple-600 to-purple-700"
              />
              <FocusAreasInput
                isDark={isDark}
                onFocusAreaAdd={handleFocusAreaAdd}
                onStrugglingTopicAdd={handleStrugglingTopicAdd}
              />
            </>
          )}
          {activeTab === 'quizlet' && (
            <QuizletImporter 
              isDark={isDark}
              onImport={handleTermsUpdate}
              buttonText="Make Set"
              className="bg-gradient-to-r from-purple-600 to-purple-700"
              processButtonClass="bg-gradient-to-r from-purple-600 to-purple-700"
            />
          )}
        </div>

        {/* Preview Terms */}
        {terms.length > 0 && (
          <div className="mt-8">
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Generated Terms ({terms.length})
            </h2>
            <div className="space-y-4">
              {terms.map((term, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isDark 
                      ? 'bg-gray-800 border-purple-700 text-white' 
                      : 'bg-white border-purple-200 text-gray-900'
                  }`}
                >
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {term.term}
                  </h3>
                  <p className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {term.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

function TabButton({ active, onClick, icon, label, isDark }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
        active
          ? isDark
            ? 'bg-indigo-600 text-white'
            : 'bg-indigo-600 text-white'
          : isDark
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  )
}