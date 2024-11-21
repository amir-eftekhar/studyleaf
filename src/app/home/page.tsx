'use client'
import React, { useState, useEffect } from 'react';
import { FiPlus, FiBook, FiFileText, FiMic, FiLayers, FiRepeat } from 'react-icons/fi';
import Link from 'next/link';
import CreateStudySetModal from '@/components/study-sets/create-modal';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import MainLayout from '@/components/layout/MainLayout';

interface StudySet {
  _id: string;
  title: string;
  description: string;
  terms: { term: string; definition: string; mastered?: boolean }[];
  createdAt: string;
  lastStudied: string | null;
}

interface StudyMethodCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  isDark: boolean;
  onClick?: () => void;
  href?: string;
}

interface RecommendationItemProps {
  title: string;
  description: string;
  isDark: boolean;
}

export default function HomePage() {
  const { isDark } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [studySets, setStudySets] = useState<StudySet[]>([]);

  useEffect(() => {
    fetchStudySets();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user/profile')
        setUserData(response.data)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    fetchUserData()
  }, [])

  const fetchStudySets = async () => {
    try {
      const response = await axios.get('/api/study-sets');
      setStudySets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching study sets:', error);
      setLoading(false);
    }
  };

  const handleCreateSet = () => {
    router.push('/create');
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${
            isDark 
              ? 'from-indigo-400 via-purple-400 to-pink-400' 
              : 'from-indigo-600 via-purple-600 to-pink-600'
          } bg-clip-text text-transparent`}>
            Welcome back, {userData?.name || 'there'}! 👋
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Ready to continue your learning journey?
          </p>
        </div>

        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Study Methods
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StudyMethodCard
              icon={<FiLayers />}
              title="Create Set"
              description="Create a new study set"
              isDark={isDark}
              onClick={handleCreateSet}
            />
            <Link href="/swipe-learn">
              <StudyMethodCard
                icon={<FiRepeat />}
                title="Swipe to Learn"
                description="Learn through interactive flashcards"
                isDark={isDark}
              />
            </Link>
            <StudyMethodCard
              icon={<FiFileText />}
              title="Quiz Mode"
              description="Test your knowledge"
              isDark={isDark}
              href="/study/quiz"
            />
            <StudyMethodCard
              icon={<FiBook />}
              title="PDF Study"
              description="Generate study materials"
              isDark={isDark}
              href="/study/pdf"
            />
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Study Sets
            </h2>
            <button
              onClick={handleCreateSet}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <FiPlus className="h-5 w-5" />
              <span>Create Set</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : studySets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {studySets.map((set) => (
                <StudySetCard
                  key={set._id}
                  set={set}
                  isDark={isDark}
                />
              ))}
            </div>
          ) : (
            <EmptyState isDark={isDark} onCreateSet={handleCreateSet} />
          )}
        </section>

        <section>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Recommended for You
          </h2>
          <div className={`${
            isDark 
              ? 'bg-gray-800' 
              : 'bg-white border border-purple-100'
          } rounded-xl p-6 shadow-lg`}>
            <div className="space-y-4">
              <RecommendationItem
                title="Complete your daily review"
                description="Maintain your study streak by reviewing your recent sets"
                isDark={isDark}
              />
              <RecommendationItem
                title="Try a new study method"
                description="Experiment with different learning techniques for better retention"
                isDark={isDark}
              />
              <RecommendationItem
                title="Set study goals"
                description="Track your progress and stay motivated"
                isDark={isDark}
              />
            </div>
          </div>
        </section>
      </div>

      <CreateStudySetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDark={isDark}
      />
    </MainLayout>
  );
}

function StudyMethodCard({ icon, title, description, isDark, onClick, href }: StudyMethodCardProps) {
  const content = (
    <div className={`${
      isDark 
        ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
        : 'bg-white hover:bg-gray-50 border-gray-200'
    } rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 border`}>
      <div className="flex items-center mb-4">
        {React.cloneElement(icon, { 
          size: 24,
          className: isDark ? 'text-indigo-400' : 'text-indigo-600'
        })}
        <h3 className={`text-lg font-semibold ml-3 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
      </div>
      <p className={`text-sm ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {description}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}

function StudySetCard({ set, isDark }: { set: StudySet; isDark: boolean }) {
  return (
    <Link href={`/sets/${set._id}`}>
      <div className={`${
        isDark 
          ? 'bg-gray-800/80 hover:bg-gray-700/90 border-gray-700' 
          : 'bg-white hover:bg-gray-50 border-gray-200'
      } rounded-xl shadow-sm p-5 cursor-pointer transition-all duration-200 transform hover:scale-102 border max-w-sm mx-auto h-[180px] flex flex-col`}>
        <h3 className={`text-lg font-semibold mb-2 text-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {set.title}
        </h3>
        <div className="flex-grow">
          <p className={`text-sm mb-3 text-center ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {set.terms.length} terms
          </p>
          <div className={`h-1 w-full rounded-full mb-3 ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div 
              className="h-full bg-indigo-500 rounded-full" 
              style={{ width: `${(set.terms.filter(t => t.mastered).length / set.terms.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className={`${
            isDark ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {set.lastStudied 
              ? `Last studied ${new Date(set.lastStudied).toLocaleDateString()}`
              : 'Not studied yet'}
          </span>
          <span className={`${
            isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
          }`}>
            Study →
          </span>
        </div>
      </div>
    </Link>
  );
}

function RecommendationItem({ title, description, isDark }: RecommendationItemProps) {
  return (
    <div className={`p-4 rounded-lg ${
      isDark 
        ? 'bg-gray-700/50' 
        : 'bg-purple-50'
    }`}>
      <h3 className={`text-lg font-medium mb-1 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <p className={`text-sm ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {description}
      </p>
    </div>
  );
}

function EmptyState({ isDark, onCreateSet }: { isDark: boolean; onCreateSet: () => void }) {
  return (
    <div className={`text-center py-16 px-4 rounded-2xl ${
      isDark 
        ? 'bg-gray-800/50' 
        : 'bg-white/70 border border-purple-100'
    } backdrop-blur-sm`}>
      <FiBook className="mx-auto h-16 w-16 text-indigo-400 mb-6" />
      <h3 className={`text-2xl font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        No study sets yet
      </h3>
      <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Start your learning journey by creating your first study set!
      </p>
      <button
        onClick={onCreateSet}
        className="inline-flex items-center px-6 py-3 rounded-xl text-white font-medium
        bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700
        transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-purple-500 shadow-lg"
      >
        <FiPlus className="mr-2 h-5 w-5" />
        Create Your First Set
      </button>
    </div>
  );
}