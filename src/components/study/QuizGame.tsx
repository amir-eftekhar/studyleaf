import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types/study';
import { Button } from '@/components/ui/button';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizGameProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ questions, onComplete }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
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

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);

    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setIsActive(false);
        onComplete(score);
      }
    }, 1500);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={`fixed inset-0 ${
      isDark ? 'bg-gray-900' : 'bg-gray-100'
    } z-50 overflow-hidden`}>
      {/* Header */}
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
                }`}>/ {questions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto pb-40">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`w-full max-w-3xl mx-auto p-8 rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}
            >
              <div className="flex flex-col">
                <h2 className={`text-2xl font-medium mb-8 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentQuestion.question}
                </h2>

                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showFeedback}
                      className={`w-full p-6 rounded-lg text-left transition-all duration-200 ${
                        showFeedback
                          ? option === currentQuestion.correctAnswer
                            ? 'bg-green-500 text-white'
                            : option === selectedAnswer
                              ? 'bg-red-500 text-white'
                              : isDark
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-700'
                          : isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuizGame; 