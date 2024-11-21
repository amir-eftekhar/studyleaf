'use client'
import React, { useState, useEffect } from 'react';
import { FiBook, FiFileText, FiMic, FiBookmark, FiSettings, FiUser, FiDownload, FiEdit2, FiLayers, FiBookOpen } from 'react-icons/fi';
import axios from 'axios';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { EmptyState } from '@/components/EmptyState';
import MainLayout from '@/components/layout/MainLayout';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';
import { PDFCard } from '@/components/profile/PDFCard';
import { LectureCard } from '@/components/profile/LectureCard';
import { NoteCard } from '@/components/profile/NoteCard';
import type { UserProfile, StudySet } from '@/types/user';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('sets');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user/profile');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (imageUrl: string) => {
    try {
      const response = await axios.post('/api/user/profile/update', {
        profileImage: imageUrl.startsWith('http') ? imageUrl : undefined,
        profileIcon: imageUrl.startsWith('http') ? undefined : imageUrl,
      });

      if (response.data.success) {
        setUserData(prev => ({
          ...prev!,
          profileImage: imageUrl.startsWith('http') ? imageUrl : undefined,
          profileIcon: imageUrl.startsWith('http') ? undefined : imageUrl,
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAreaChange = (area: string, index: number) => {
    if (!userData) return;
    
    const newPreferences = {
      ...userData.studyPreferences,
      focusAreas: userData.studyPreferences.focusAreas.map((a, i) => 
        i === index ? area : a
      )
    };
    
    // Update preferences logic here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'sets', label: 'Study Sets', icon: <FiBook /> },
    { id: 'pdfs', label: 'PDFs', icon: <FiDownload /> },
    { id: 'lectures', label: 'Lectures', icon: <FiMic /> },
    { id: 'notes', label: 'Notes', icon: <FiFileText /> },
    { id: 'saved', label: 'Saved Sets', icon: <FiBookmark /> },
    { id: 'preferences', label: 'Preferences', icon: <FiSettings /> },
  ];

  const studyMethods = [
    { id: 'flashcards', label: 'Flashcards', icon: <FiLayers />, href: '/study/flashcards' },
    { id: 'learn', label: 'Learn', icon: <FiBookOpen />, href: '/study/learn' },
    { id: 'quiz', label: 'Quiz Mode', icon: <FiFileText />, href: '/study/quiz' },
    { id: 'pdf', label: 'PDF Study', icon: <FiBook />, href: '/study/pdf' },
  ];

  return (
    <MainLayout>
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Profile Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} border-b border-gray-700 py-12`}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <ProfileImageUpload
                currentImage={userData?.profileImage}
                currentIcon={userData?.profileIcon}
                isDark={isDark}
                onUpdate={handleProfileUpdate}
              />
              <div className="mt-6">
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userData?.name}
                </h1>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userData?.institution} - {userData?.major}
                </p>
              </div>
            </div>

            {/* Scrollable Tabs */}
            <div className="mt-8 overflow-x-auto pb-2 -mb-2">
              <div className="flex space-x-1 min-w-max px-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap
                      ${activeTab === tab.id
                        ? `${isDark ? 'bg-gray-700 text-white' : 'bg-indigo-50 text-indigo-600'}`
                        : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-indigo-600'}`
                      }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Study Sets */}
          {activeTab === 'sets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData?.studySets && userData.studySets.length > 0 ? (
                userData.studySets.map((set) => (
                  <StudySetCard key={set._id} set={set} isDark={isDark} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState 
                    type="sets" 
                    isDark={isDark} 
                    userName={userData?.name || 'Student'} 
                  />
                </div>
              )}
            </div>
          )}

          {/* PDFs */}
          {activeTab === 'pdfs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData?.pdfs && userData.pdfs.length > 0 ? (
                userData.pdfs.map((pdf) => (
                  <PDFCard key={pdf._id} pdf={pdf} isDark={isDark} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState 
                    type="pdfs" 
                    isDark={isDark} 
                    userName={userData?.name || 'Student'} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Lectures */}
          {activeTab === 'lectures' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData?.lectures && userData.lectures.length > 0 ? (
                userData.lectures.map((lecture) => (
                  <LectureCard key={lecture._id} lecture={lecture} isDark={isDark} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState 
                    type="lectures" 
                    isDark={isDark} 
                    userName={userData?.name || 'Student'} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData?.notes && userData.notes.length > 0 ? (
                userData.notes.map((note) => (
                  <NoteCard key={note._id} note={note} isDark={isDark} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState 
                    type="notes" 
                    isDark={isDark} 
                    userName={userData?.name || 'Student'} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Saved Sets */}
          {activeTab === 'saved' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData?.savedSets && userData.savedSets.length > 0 ? (
                userData.savedSets.map((set) => (
                  <StudySetCard key={set._id} set={set} isDark={isDark} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState 
                    type="saved" 
                    isDark={isDark} 
                    userName={userData?.name || 'Student'} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <PreferencesSection isDark={isDark} userData={userData} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Add card components for each type
function StudySetCard({ set, isDark }: { set: StudySet; isDark: boolean }) {
  return (
    <Link href={`/sets/${set._id}`}>
      <div className={`${
        isDark ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {set.title}
        </h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {set.terms.length} terms
        </p>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            Created {new Date(set.createdAt).toLocaleDateString()}
          </span>
          <button className={`${
            isDark ? 'text-indigo-400' : 'text-indigo-600'
          } hover:underline`}>
            Study
          </button>
        </div>
      </div>
    </Link>
  );
}

function PreferencesSection({ isDark, userData }: { isDark: boolean; userData: UserProfile | null }) {
  return (
    <div className={`${
      isDark ? 'bg-gray-800' : 'bg-white'
    } rounded-lg p-6 shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Study Preferences
      </h2>
      
      <div className="space-y-6">
        {/* Academic Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Academic Level
              </label>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userData?.academicLevel}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Institution
              </label>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userData?.institution}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Major
              </label>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userData?.major}
              </p>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Learning Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Preferred Learning Style
              </label>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userData?.studyPreferences?.preferredLearningStyle}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Daily Study Time
              </label>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userData?.studyPreferences?.dailyStudyTime} minutes
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Difficulty Level
              </label>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userData?.studyPreferences?.difficultyLevel}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Reminder Frequency
              </label>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {userData?.studyPreferences?.reminderFrequency}
              </p>
            </div>
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData?.studyPreferences?.focusAreas.map((area, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 