import React, { useState, useEffect } from 'react';
import { FlashCard } from '@/types/study';
import { Button } from '@/components/ui/button';
import { FiRefreshCw, FiClock, FiArrowLeft } from 'react-icons/fi';
import { useTheme } from 'next-themes';

interface MatchGameProps {
  cards: FlashCard[];
  onComplete: (score: number) => void;
}

const MatchGame: React.FC<MatchGameProps> = ({ cards, onComplete }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [shuffledCards, setShuffledCards] = useState<FlashCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<FlashCard | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [tappedCard, setTappedCard] = useState<FlashCard | null>(null);

  useEffect(() => {
    const terms = cards.map(card => ({
      ...card,
      type: 'term',
      isFlipped: false
    }));
    const definitions = cards.map(card => ({
      ...card,
      type: 'definition',
      isFlipped: false
    }));
    const allCards = [...terms, ...definitions];
    setShuffledCards(shuffleArray(allCards));
    setTimer(0);
    setIsActive(true);
  }, [cards]);

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

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleCardClick = (card: FlashCard) => {
    if (matchedPairs.includes(card.id)) {
      return;
    }

    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    const element = document.getElementById(`card-${card.id}-${card.type}`);
    if (element) {
      element.style.transform = 'scale(0.95)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 100);
    }

    setTappedCard(card);

    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      setAttempts(prev => prev + 1);
      if (selectedCard.id === card.id && selectedCard !== card) {
        setMatchedPairs(prev => [...prev, card.id]);
        setMatches(prev => prev + 1);
      } else {
        setTimeout(() => setTappedCard(null), 1000);
      }
      setTimeout(() => setSelectedCard(null), 1000);
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
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => onComplete(matches)}
              className={`flex items-center space-x-2 ${
                isDark ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              <FiArrowLeft size={20} />
              <span>Back</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiClock className="text-indigo-500" />
                <span className={`text-lg font-semibold ${
                  isDark ? 'text-gray-200' : 'text-gray-900'
                }`}>{formatTime(timer)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="flex items-center">
                  <span className="font-bold text-indigo-500">{matches}/{cards.length}</span>
                  <span className={`ml-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>matches</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-indigo-500">{attempts}</span>
                  <span className={`ml-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>attempts</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setShuffledCards(shuffleArray(shuffledCards));
                setSelectedCard(null);
                setMatchedPairs([]);
                setMatches(0);
                setAttempts(0);
                setTimer(0);
                setIsActive(true);
              }}
              className={`${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <FiRefreshCw className="mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-120px)] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {shuffledCards.map((card) => (
              <div
                key={`${card.id}-${card.type}`}
                onClick={() => handleCardClick(card)}
                className={`
                  aspect-square w-full max-w-[140px] sm:max-w-[130px] md:max-w-[150px] lg:max-w-[180px] mx-auto
                  cursor-pointer transition-all duration-200
                  ${matchedPairs.includes(card.id) ? 'scale-95' : ''}
                  hover:scale-105
                `}
              >
                <div
                  className={`
                    relative w-full h-full transition-transform duration-300
                    transform-style-3d
                    ${(selectedCard === card || matchedPairs.includes(card.id) || tappedCard === card) ? 'rotate-y-180' : ''}
                  `}
                >
                  <div className={`absolute w-full h-full backface-hidden rounded-lg shadow-md flex items-center justify-center text-center 
                    ${isDark
                      ? matchedPairs.includes(card.id)
                        ? 'bg-green-900'
                        : tappedCard === card
                          ? 'bg-indigo-700' 
                          : 'bg-indigo-900'
                      : matchedPairs.includes(card.id)
                        ? 'bg-green-100'
                        : tappedCard === card
                          ? 'bg-indigo-200' 
                          : 'bg-indigo-100'
                    }
                  `}>
                    <span className={`text-sm sm:text-base font-medium ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {card.type === 'term' ? 'Term' : 'Definition'}
                    </span>
                  </div>

                  <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-lg shadow-md flex items-center justify-center text-center overflow-hidden
                    ${isDark
                      ? matchedPairs.includes(card.id)
                        ? 'bg-green-900'
                        : 'bg-indigo-800'
                      : matchedPairs.includes(card.id)
                        ? 'bg-green-100'
                        : 'bg-indigo-100'
                    }
                  `}>
                    <div className="w-full h-full p-2 sm:p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                      <span className={`text-sm sm:text-base font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-900'
                      } break-words`}>
                        {card.type === 'term' ? card.term : card.definition}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchGame; 