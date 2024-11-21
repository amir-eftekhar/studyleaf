import React, { useState, useEffect } from 'react';
import { FlashCard } from '@/types/study';
import { Button } from '@/components/ui/button';
import { FiArrowLeft, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface TimedGameProps {
  terms: { term: string; definition: string }[];
  onComplete: (score: number) => void;
}

const TimedGame: React.FC<TimedGameProps> = ({ terms, onComplete }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Initialize game with shuffled questions that can repeat
  const [questions] = useState(() => 
    terms.map(term => ({
      question: term.term,
      correctAnswer: term.definition,
      options: [
        term.definition,
        ...terms
          .filter(t => t.term !== term.term)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(t => t.definition)
      ].sort(() => Math.random() - 0.5)
    }))
  );

  const getNextQuestion = () => {
    // Instead of moving to next index, get a random question
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(randomIndex);
    
    // Regenerate options for variety
    const currentTerm = terms[randomIndex];
    const newOptions = [
      currentTerm.definition,
      ...terms
        .filter(t => t.term !== currentTerm.term)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(t => t.definition)
    ].sort(() => Math.random() - 0.5);
    
    questions[randomIndex].options = newOptions;
  };

  // Timer effect
  useEffect(() => {
    if (!isActive || !timeLimit) return;

    const interval = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          clearInterval(interval);
          setIsActive(false);
          setTimeout(() => onComplete(score), 2000);
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLimit, score, onComplete]);

  const startGame = (minutes: number) => {
    setTimeLimit(minutes * 60);
    setTimeLeft(minutes * 60);
    setShowSetup(false);
    setIsActive(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback || !isActive) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);

    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      getNextQuestion();
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showSetup) {
    return (
      <div className={`fixed inset-0 ${
        isDark ? 'bg-gray-900' : 'bg-gray-100'
      } z-50 flex items-center justify-center`}>
        <div className={`max-w-md w-full mx-4 p-8 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-xl`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Time Limit
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 5].map((minutes) => (
              <Button
                key={minutes}
                onClick={() => startGame(minutes)}
                className={`p-6 text-lg ${
                  isDark 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-indigo-500 hover:bg-indigo-600'
                } text-white rounded-lg transition-colors duration-200`}
              >
                {minutes} {minutes === 1 ? 'minute' : 'minutes'}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              <div className={`flex items-center space-x-2 ${
                timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''
              }`}>
                <FiClock size={20} />
                <span className="text-lg font-semibold">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-indigo-500">{score}</span>
                <span className={`ml-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-120px)] overflow-y-auto pb-40">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-8 rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}
            >
              <h2 className={`text-2xl font-medium mb-8 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                    className={`w-full p-6 rounded-lg text-left transition-all duration-200 ${
                      showFeedback
                        ? option === questions[currentQuestion].correctAnswer
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TimedGame; 