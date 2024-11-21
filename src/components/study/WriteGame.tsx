import React, { useState, useEffect } from 'react';
import { WritingPrompt } from '@/types/study';
import { Button } from '@/components/ui/button';
import { FiArrowLeft, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface WriteGameProps {
  terms: { term: string; definition: string }[];
  onComplete: (score: number) => void;
}

const WriteGame: React.FC<WriteGameProps> = ({ terms, onComplete }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(seconds => seconds + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: terms[currentIndex].term,
          definition: terms[currentIndex].definition,
          userAnswer: userAnswer,
        }),
      });

      const data = await response.json();
      setFeedback(data.feedback);
      
      if (data.isCorrect) {
        setScore(prev => prev + 1);
      }

      setTimeout(() => {
        if (currentIndex < terms.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setUserAnswer('');
          setFeedback(null);
        } else {
          setIsActive(false);
          onComplete(score);
        }
      }, 3000);

    } catch (error) {
      console.error('Error checking answer:', error);
      setFeedback('Error checking answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 ${
      isDark ? 'bg-gray-900' : 'bg-gray-100'
    } z-50 overflow-hidden`}>
      <div className={`${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg p-4`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <button
              onClick={() => onComplete(score)}
              className={`flex items-center space-x-2 ${
                isDark ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              <FiArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FiClock className="text-indigo-500" />
                <span className={`text-lg font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>{formatTime(timer)}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-indigo-500">{score}</span>
                <span className={`ml-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>/ {terms.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-120px)] overflow-y-auto pb-40">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Term {currentIndex + 1} of {terms.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / terms.length) * 100}%` }}
              />
            </div>
          </div>

          <div className={`p-8 rounded-xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-lg mb-8`}>
            <h2 className={`text-2xl font-medium mb-8 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Define this term:
            </h2>
            <div className={`text-xl mb-8 p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {terms[currentIndex].term}
            </div>

            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isLoading || feedback !== null}
              placeholder="Type your answer here..."
              className={`w-full p-4 rounded-lg mb-4 min-h-[150px] ${
                isDark 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-indigo-500 outline-none`}
            />

            {feedback && (
              <div className={`p-4 rounded-lg mb-4 ${
                feedback.includes('Correct') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {feedback}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading || feedback !== null || !userAnswer.trim()}
              className={`w-full py-3 ${
                isDark 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white rounded-lg transition-colors duration-200`}
            >
              {isLoading ? 'Checking...' : 'Submit Answer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteGame; 