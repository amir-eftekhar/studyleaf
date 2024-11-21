'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FiMessageSquare, FiBook, FiHelpCircle, FiPaperclip, FiSend, FiEdit2, FiSave, FiRefreshCw, FiImage, FiZoomIn, FiZoomOut, FiMaximize, FiMinimize, FiRotateCw, FiDownload, FiShare2, FiMoreVertical, FiX, FiChevronLeft, FiChevronRight, FiLoader } from 'react-icons/fi';
import axios from 'axios'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { debounce } from 'lodash'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MarkdownRenderer: React.FC<{ children: string }> = ({ children }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2" {...props} />,
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          return !className ? (
            <code className="bg-gray-100 rounded px-1" {...props}>
              {children}
            </code>
          ) : (
            <pre className="bg-gray-100 rounded p-2 mb-2">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          )
        },
        table: ({ node, ...props }) => <table className="border-collapse border border-gray-300 mb-2" {...props} />,
        th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />,
        td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

interface QuizQuestion {
  type: 'multiple_choice' | 'free_response' | 'true_false';
  question: string;
  choices?: { text: string; correct: boolean }[];
  answer?: string;
  subject: string;
  reference: string;
  userAnswer?: string;
}

interface QuizResult {
  subject: string;
  correct: number;
  total: number;
  feedback: string;
}

interface QuizConfig {
  numQuestions: {
    multiple_choice: number;
    free_response: number;
    true_false: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  focus: string;
  pageRange: [number, number];
}

interface DetailedQuizFeedback {
  question: string;
  type: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  writtenResponseFeedback?: string;
  writtenResponseScore?: number;
}

interface SearchResult {
  content: string;
  page: number;
}

interface PDFAIPanelProps {
  pdfUrl: string | null;
  pdfContent: string;
  currentPage: number;
  totalPages: number;
  theme?: string;
  onClose: () => void;
  onFileUpload: (path: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const GeneratingAnimation = () => (
  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm">
    <div className="flex space-x-2">
      <motion.div
        className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      />
      <motion.div
        className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4
        }}
      />
    </div>
    <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
      AI is thinking...
    </span>
  </div>
);

const PDFAIPanel: React.FC<PDFAIPanelProps> = ({ 
  pdfUrl, 
  pdfContent, 
  currentPage, 
  totalPages,
  theme = 'light',
  onClose,
  onFileUpload
}) => {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    numQuestions: {
      multiple_choice: 3,
      free_response: 2,
      true_false: 2,
    },
    difficulty: 'medium',
    focus: '',
    pageRange: [1, totalPages],
  })
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizFeedback, setQuizFeedback] = useState<string>('')
  const [detailedQuizFeedback, setDetailedQuizFeedback] = useState<DetailedQuizFeedback[]>([])
  const [notesFocus, setNotesFocus] = useState('')
  const [quizPageRange, setQuizPageRange] = useState<[number, number]>([1, totalPages])
  const [notesPageRange, setNotesPageRange] = useState<[number, number]>([currentPage, currentPage])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isEmbedding, setIsEmbedding] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isVectorized, setIsVectorized] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [notesDescription, setNotesDescription] = useState('');
  const [summaryDescription, setSummaryDescription] = useState('');
  const [summaryPageRange, setSummaryPageRange] = useState<[number, number]>([currentPage, currentPage]);
  const [summaryFocus, setSummaryFocus] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleRagChat = useCallback(async () => {
    if (!pdfUrl || !pdfContent) {
      console.log('Missing required data:', { pdfUrl, hasPdfContent: !!pdfContent });
      toast({
        title: "Error",
        description: "No document selected or content available",
        variant: "destructive",
      });
      return;
    }

    if (!inputMessage.trim()) {
      console.log('No message entered');
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);

    try {
      // Extract just the filename part after /uploads/
      const match = pdfUrl.match(/\/uploads\/(.+)$/);
      const documentId = match ? match[1] : pdfUrl;
      
      console.log('Starting chat process:', { 
        documentId, 
        messageLength: inputMessage.length,
        currentMessages: messages.length 
      });

      // First, check if document is processed
      const statusResponse = await fetch(`/api/processing-status?documentId=${encodeURIComponent(documentId)}`);
      const statusData = await statusResponse.json();
      console.log('Document status:', statusData);

      // If not processed, process it first
      if (!statusData || statusData.status !== 'completed') {
        console.log('Processing document first...');
        const processResponse = await fetch('/api/rag_chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            content: pdfContent
          }),
        });

        if (!processResponse.ok) {
          throw new Error('Failed to process document');
        }

        const processResult = await processResponse.json();
        console.log('Processing result:', processResult);
      }

      // Now send the chat message
      console.log('Sending chat message...');
      const chatResponse = await fetch('/api/rag_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          message: inputMessage
        }),
      });

      if (!chatResponse.ok) {
        const errorData = await chatResponse.json();
        console.error('Chat error response:', errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await chatResponse.json();
      console.log('Chat response received:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }]);
        setInputMessage('');
      }

    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pdfUrl, inputMessage, messages, toast, pdfContent]);

  const checkAndProcessDocument = async () => {
    if (!pdfUrl) return;

    try {
      // Extract just the filename part after /uploads/
      const match = pdfUrl.match(/\/uploads\/(.+)$/);
      const documentId = match ? match[1] : pdfUrl;
      
      const response = await fetch(`/api/processing-status?documentId=${encodeURIComponent(pdfUrl)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Processing status:', data);

      if (data.status === 'completed') {
        setIsProcessing(false);
        setIsVectorized(true);
        setProcessingStatus('completed');
        return;
      }

      // If not completed, start processing
      console.log('Document needs processing first');
      
      const processResponse = await fetch('/api/rag_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          content: pdfContent // Make sure to include the content for processing
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Failed to process document');
      }

      setIsProcessing(true);
      setProcessingStatus('processing');

    } catch (error) {
      console.error('Error checking/processing document:', error);
      setError(error instanceof Error ? error.message : 'Failed to process document');
      setIsProcessing(false);
      setProcessingStatus('error');
    }
  };

  // Check status only once when component mounts or pdfUrl changes
  useEffect(() => {
    if (pdfUrl) {
      checkAndProcessDocument();
    }
  }, [pdfUrl]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() === '') {
        setSearchResults([])
        return
      }
      const searchPdf = async () => {
        try {
          const response = await axios.post('/api/search', { query, pdfUrl })
          setSearchResults(response.data.results)
        } catch (error) {
          console.error('Error searching:', error)
        }
      }
      searchPdf()
    }, 300),
    [pdfUrl]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchQuery, debouncedSearch])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages, streamingContent])

  const handleGenerateNotes = async () => {
    if (!pdfUrl) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/gen_notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: pdfUrl,
          pageRange: notesPageRange,
          focus: notesFocus,
          description: notesDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate notes');
      }
      
      const data = await response.json();
      setNotes(data.notes);
    } catch (error) {
      console.error('Error generating notes:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/gen_quiz', {
        documentId: pdfUrl,
        quizConfig,
      });
      setQuizQuestions(response.data.quiz);
      setCurrentQuestionIndex(0);
      setQuizResults([]);
      setShowResults(false);
      setQuizAnswers({});
    } catch (error) {
      console.error('Error generating quiz:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server response:', error.response.data);
      }
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [pdfUrl, quizConfig]);

  const handleAnswerSelect = useCallback((answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  }, [currentQuestionIndex]);

  const handleQuizSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const answeredQuestions = quizQuestions.map((q, index) => ({
        ...q,
        userAnswer: quizAnswers[index] || ''
      }));

      const response = await axios.post('/api/grade_quiz', {
        questions: answeredQuestions
      });

      setQuizResults(response.data.results);
      setQuizFeedback(response.data.feedback);
      setDetailedQuizFeedback(response.data.detailedFeedback);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [quizQuestions, quizAnswers]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, submit for grading
      handleQuizSubmit();
    }
  }, [currentQuestionIndex, quizQuestions.length, handleQuizSubmit]);

  const handleNewQuiz = useCallback(() => {
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setQuizResults([]);
    setShowResults(false);
    setQuizAnswers({});
    setQuizConfig({
      numQuestions: {
        multiple_choice: 3,
        free_response: 2,
        true_false: 2,
      },
      difficulty: 'medium',
      focus: '',
      pageRange: [1, totalPages],
    });
  }, [totalPages]);

  const PageRangeInputs = ({ value, onChange, min, max }: { 
    value: [number, number], 
    onChange: (value: [number, number]) => void, 
    min: number, 
    max: number 
  }) => {
    const handleStartPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStart = Math.min(Math.max(parseInt(e.target.value) || min, min), max);
      onChange([newStart, Math.max(newStart, value[1])]);
    };

    const handleEndPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEnd = Math.min(Math.max(parseInt(e.target.value) || min, min), max);
      onChange([Math.min(value[0], newEnd), newEnd]);
    };

    return (
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={value[0]}
          onChange={handleStartPageChange}
          min={min}
          max={max}
          className="w-24 bg-gray-800 text-white border-gray-700 focus:ring-purple-500"
        />
        <span className="text-white">to</span>
        <Input
          type="number"
          value={value[1]}
          onChange={handleEndPageChange}
          min={min}
          max={max}
          className="w-24 bg-gray-800 text-white border-gray-700 focus:ring-purple-500"
        />
      </div>
    );
  };

  const renderQuizConfig = () => (
    <div className={`space-y-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <div>
        <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Number of Questions</Label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Multiple Choice</Label>
            <Input
              type="number"
              value={quizConfig.numQuestions.multiple_choice}
              onChange={(e) => setQuizConfig(prev => ({
                ...prev,
                numQuestions: { ...prev.numQuestions, multiple_choice: parseInt(e.target.value) || 0 }
              }))}
              min={0}
              className={`mt-1 ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-200'
              }`}
            />
          </div>
          <div>
            <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Free Response</Label>
            <Input
              type="number"
              value={quizConfig.numQuestions.free_response}
              onChange={(e) => setQuizConfig(prev => ({
                ...prev,
                numQuestions: { ...prev.numQuestions, free_response: parseInt(e.target.value) }
              }))}
              min={0}
              className={`mt-1 ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-200'
              }`}
            />
          </div>
          <div>
            <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>True/False</Label>
            <Input
              type="number"
              value={quizConfig.numQuestions.true_false}
              onChange={(e) => setQuizConfig(prev => ({
                ...prev,
                numQuestions: { ...prev.numQuestions, true_false: parseInt(e.target.value) }
              }))}
              min={0}
              className={`mt-1 ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-200'
              }`}
            />
          </div>
        </div>
      </div>
      <div>
        <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Difficulty</Label>
        <RadioGroup
          value={quizConfig.difficulty}
          onValueChange={(value) => setQuizConfig(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' }))}
          className="flex space-x-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="easy" id="easy" />
            <Label htmlFor="easy">Easy</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hard" id="hard" />
            <Label htmlFor="hard">Hard</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Focus (Optional)</Label>
        <Input
          value={quizConfig.focus}
          onChange={(e) => setQuizConfig(prev => ({ ...prev, focus: e.target.value }))}
          placeholder="Enter a specific topic or keyword"
          className="mt-1"
        />
      </div>
      <div>
        <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Page Range</Label>
        <PageRangeInputs
          value={quizConfig.pageRange}
          onChange={(value) => setQuizConfig(prev => ({ ...prev, pageRange: value }))}
          min={1}
          max={totalPages}
        />
      </div>
      <Button onClick={handleStartQuiz} disabled={isLoading} className="w-full">
        {isLoading ? <FiRefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
        Start Quiz
      </Button>
    </div>
  );

  const renderQuizQuestion = useCallback(() => {
    if (currentQuestionIndex >= quizQuestions.length) return null;
    const question = quizQuestions[currentQuestionIndex];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold">{question.question}</h3>
        {question.type === 'multiple_choice' && (
          <div className="space-y-2">
            {question.choices?.map((choice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleAnswerSelect(choice.text)}
                  className={`w-full text-left justify-start py-4 px-6 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    quizAnswers[currentQuestionIndex] === choice.text ? 'bg-purple-100' : ''
                  }`}
                >
                  {choice.text}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
        {question.type === 'free_response' && (
          <div>
            <Textarea
              value={quizAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32"
            />
          </div>
        )}
        {question.type === 'true_false' && (
          <div className="flex space-x-4">
            <Button 
              onClick={() => handleAnswerSelect('true')}
              className={quizAnswers[currentQuestionIndex] === 'true' ? 'bg-purple-100' : ''}
            >
              True
            </Button>
            <Button 
              onClick={() => handleAnswerSelect('false')}
              className={quizAnswers[currentQuestionIndex] === 'false' ? 'bg-purple-100' : ''}
            >
              False
            </Button>
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </div>
          <Button onClick={handleNextQuestion} disabled={!quizAnswers[currentQuestionIndex]}>
            {currentQuestionIndex < quizQuestions.length - 1 ? 'Next' : 'Submit Quiz'}
          </Button>
        </div>
      </motion.div>
    );
  }, [quizQuestions, currentQuestionIndex, quizAnswers, handleAnswerSelect, handleNextQuestion]);

  const renderQuizResults = useCallback(() => {
    const data = {
      labels: quizResults.map(r => r.subject),
      datasets: [
        {
          label: 'Correct Answers',
          data: quizResults.map(r => (r.correct / r.total) * 100),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Quiz Results by Subject',
        },
      },
    };

    return (
      <div className="space-y-6">
        <Bar data={data} options={options} />
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Quiz Feedback</h3>
          <p className="text-gray-700">{quizFeedback}</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Detailed Question Feedback</h3>
          {detailedQuizFeedback.map((feedback, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold">{feedback.question}</h4>
              <p className="text-sm text-gray-600">Type: {feedback.type}</p>
              <p className="mt-2">Your answer: {feedback.userAnswer}</p>
              <p className={`mt-1 ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                Correct answer: {feedback.correctAnswer}
              </p>
              <p className="mt-2 text-sm">{feedback.explanation}</p>
              {feedback.type === 'free_response' && (
                <div className="mt-2">
                  <p className="text-sm">Written response feedback: {feedback.writtenResponseFeedback}</p>
                  <p className="text-sm">Score: {feedback.writtenResponseScore}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Subjects to Review:</h3>
          <ul className="list-disc list-inside space-y-2">
            {quizResults.filter(r => (r.correct / r.total) < 0.7).map(r => (
              <li key={r.subject} className="text-gray-700">
                {r.subject} - {((r.correct / r.total) * 100).toFixed(2)}% correct
              </li>
            ))}
          </ul>
        </div>
        <Button onClick={handleNewQuiz} className="w-full">
          Start New Quiz
        </Button>
      </div>
    );
  }, [quizResults, quizFeedback, detailedQuizFeedback, handleNewQuiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    console.log('Form submitted, triggering chat...');
    await handleRagChat();
  };

  const embedDocument = useCallback(async (file: File) => {
    if (!file) return;

    setIsEmbedding(true);
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // First upload the file
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      console.log('File uploaded:', uploadData);

      // Immediately start processing
      const processResponse = await fetch('/api/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: uploadData.path,
          startProcessing: true
        }),
      });

      if (!processResponse.ok) {
        throw new Error('Failed to start document processing');
      }

      // Update status and notify user
      setIsProcessing(true);
      onFileUpload?.(uploadData.path);

      toast({
        title: "Processing Started",
        description: "Your document is being processed. You'll be notified when it's ready.",
        duration: 5000,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload and process file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEmbedding(false);
    }
  }, [onFileUpload, toast]);

  // Add this effect to handle document processing status
  useEffect(() => {
    if (pdfUrl && !isVectorized) {
      checkAndProcessDocument();
    }
  }, [pdfUrl, isVectorized]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('File uploaded:', file)
      embedDocument(file)
    }
  }, [embedDocument])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('Image uploaded:', file)
      embedDocument(file)
    }
  }, [embedDocument])

  const askQuestion = async (question: string) => {
    if (!pdfUrl) return;
    
    setIsLoading(true);
    try {
      console.log('Sending question to RAG endpoint:', question);
      console.log('Document URL:', pdfUrl);
      
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: pdfUrl,
          question
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: 'Failed to parse error response',
          details: `Server returned ${response.status}`
        }));
        console.error('Error response:', errorData);
        throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.answer;
    } catch (error: any) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from AI",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const vectorizeDocument = async () => {
    if (!pdfContent || isVectorized) return;
    
    setIsProcessing(true);
    setError(null);
    setProcessingStatus('processing');
    setProcessingProgress(0);
    setIsPollingStatus(true);
    
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentContent: pdfContent,
          documentId: pdfUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document');
      console.error('Error vectorizing document:', err);
      setIsPollingStatus(false);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (pdfUrl && !isVectorized) {
      vectorizeDocument();
    }
  }, [pdfUrl]);

  const StreamingText = ({ text }: { text: string }) => {
    const [displayText, setDisplayText] = useState('');
    const streamRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      let index = 0;
      const stream = setInterval(() => {
        if (index < text.length) {
          setDisplayText(prev => prev + text[index]);
          index++;
          
          const container = chatContainerRef.current;
          const isScrolledToBottom = container && 
            (container.scrollHeight - container.scrollTop <= container.clientHeight + 100);
          
          if (isScrolledToBottom) {
            streamRef.current?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'end'
            });
          }
        } else {
          clearInterval(stream);
        }
      }, 2); // Super fast streaming (2ms)

      return () => clearInterval(stream);
    }, [text]);

    return (
      <div ref={streamRef}>
        <Markdown 
          className="prose dark:prose-invert max-w-none"
          components={{
            strong: ({ children }) => (
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {children}
              </span>
            ),
            li: ({ children }) => (
              <li className="ml-4 list-disc marker:text-purple-500">
                {children}
              </li>
            ),
            p: ({ children }) => (
              <p className="mb-2 leading-relaxed">
                {children}
              </p>
            ),
          }}
        >
          {displayText}
        </Markdown>
      </div>
    );
  };

  const LoadingDots: React.FC = () => (
    <div className="flex items-center space-x-1.5">
      <motion.div
        className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );

  const handleGenerateSummary = async () => {
    if (!pdfUrl) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/gen_notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: pdfUrl,
          pageRange: summaryPageRange,
          focus: summaryFocus,
          description: summaryDescription,
          type: 'summary'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }
      
      const data = await response.json();
      setNotes(data.notes);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  // Add this effect to check if the document is vectorized
  useEffect(() => {
    const checkVectorization = async () => {
      if (!pdfUrl) return;
      
      try {
        const response = await fetch(`/api/processing-status?documentId=${encodeURIComponent(pdfUrl)}`);
        if (!response.ok) throw new Error('Failed to check status');
        
        const data = await response.json();
        console.log('Processing status:', data);
        setIsVectorized(data.status === 'completed');
      } catch (error) {
        console.error('Error checking vectorization:', error);
      }
    };

    checkVectorization();
  }, [pdfUrl]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Floating AI Button */}
      {!isPanelVisible && (
        <button
          onClick={() => setIsPanelVisible(true)}
          className={`fixed right-6 bottom-24 p-4 rounded-full shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 text-purple-400 hover:text-purple-300' 
              : 'bg-white text-purple-600 hover:text-purple-500'
          } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          hover:scale-110 transition-all duration-200 z-50`}
        >
          <FiMessageSquare size={24} />
        </button>
      )}

      {/* AI Panel */}
      {isPanelVisible && (
        <div className={`fixed transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'inset-4' 
            : 'inset-y-4 right-4 w-[480px]'
        } ${theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'} 
          backdrop-blur-md flex flex-col shadow-2xl border rounded-2xl z-50
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {activePanel && (
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
                >
                  <FiChevronLeft size={20} />
                </button>
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                {activePanel ? activePanel.charAt(0).toUpperCase() + activePanel.slice(1) : 'AI Assistant'}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
              >
                {isExpanded ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
              </button>
              <button
                onClick={() => {
                  setActivePanel(null);
                  setIsPanelVisible(false);
                }}
                className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {!activePanel ? (
              // Main Menu
              <div className="grid grid-cols-2 gap-4 p-6">
                {[
                  { icon: <FiMessageSquare />, label: 'Chat', id: 'chat' },
                  { icon: <FiBook />, label: 'Summary', id: 'summarize' },
                  { icon: <FiEdit2 />, label: 'Notes', id: 'notes' },
                  { icon: <FiRefreshCw />, label: 'Quiz', id: 'quiz' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id)}
                    className="flex flex-col items-center justify-center p-6 rounded-xl transition-all
                      bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 
                      border border-gray-700 text-white shadow-lg hover:shadow-xl
                      transform hover:scale-105 duration-200"
                  >
                    <div className="p-4 rounded-full mb-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                      {React.cloneElement(item.icon, { size: 24 })}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              // Feature-specific content
              <div className="h-full overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activePanel === 'chat' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col h-full"
                    >
                      <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
                        {/* Chat Messages */}
                        <div 
                          ref={chatContainerRef}
                          id="chat-container"
                          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
                        >
                          {messages.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}
                            >
                              <div 
                                className={`${
                                  message.role === 'assistant' 
                                    ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 text-gray-800 dark:text-gray-200 shadow-purple-500/10' 
                                    : 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-200 shadow-amber-500/10'
                                } rounded-2xl px-5 py-3.5 max-w-[85%] shadow-lg backdrop-blur-sm border border-white/10`}
                              >
                                {message.role === 'assistant' && index === messages.length - 1 && isLoading ? (
                                  <StreamingText text={message.content} />
                                ) : (
                                  <div className="prose dark:prose-invert max-w-none">
                                    <Markdown
                                      components={{
                                        strong: ({ children }) => (
                                          <span className="font-bold text-purple-600 dark:text-purple-400">
                                            {children}
                                          </span>
                                        ),
                                        li: ({ children }) => (
                                          <li className="ml-4 list-disc marker:text-purple-500">
                                            {children}
                                          </li>
                                        ),
                                        p: ({ children }) => (
                                          <p className="mb-2 leading-relaxed">
                                            {children}
                                          </p>
                                        ),
                                      }}
                                    >
                                      {message.content}
                                    </Markdown>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          {isLoading && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex justify-start mb-4"
                            >
                              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm">
                                <div className="flex space-x-2">
                                  {[0, 1, 2].map((i) => (
                                    <motion.div
                                      key={i}
                                      className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [1, 0.7, 1]
                                      }}
                                      transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.2
                                      }}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                  Generating response...
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Input Form */}
                        <div className="p-4 border-t dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                          <form onSubmit={handleSubmit} className="flex gap-3">
                            <Input
                              value={inputMessage}
                              onChange={handleInputChange}
                              placeholder="Ask a question about the document..."
                              className="flex-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              disabled={isLoading}
                            />
                            <Button 
                              type="submit" 
                              disabled={isLoading || !inputMessage.trim()}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 
                                hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg
                                shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 
                                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                disabled:hover:shadow-purple-500/25"
                            >
                              {isLoading ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <FiLoader className="w-5 h-5" />
                                </motion.div>
                              ) : (
                                <FiSend className="w-5 h-5" />
                              )}
                            </Button>
                          </form>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePanel === 'quiz' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6"
                    >
                      <div className="text-gray-900">
                        {!quizQuestions.length ? renderQuizConfig() : 
                         showResults ? renderQuizResults() : 
                         renderQuizQuestion()}
                      </div>
                    </motion.div>
                  )}

                  {activePanel === 'notes' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Page Range</Label>
                          <PageRangeInputs
                            value={notesPageRange}
                            onChange={setNotesPageRange}
                            min={1}
                            max={totalPages}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Focus (Optional)</Label>
                          <Input
                            value={notesFocus}
                            onChange={(e) => setNotesFocus(e.target.value)}
                            placeholder="Enter topic focus"
                            className={`${
                              theme === 'dark' 
                                ? 'bg-gray-800 text-white border-gray-700' 
                                : 'bg-white text-gray-900 border-gray-200'
                            } focus:ring-purple-500`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Description (Optional)</Label>
                        <Textarea
                          value={notesDescription}
                          onChange={(e) => setNotesDescription(e.target.value)}
                          placeholder="Add any specific requirements or details for the notes..."
                          className={`${
                            theme === 'dark' 
                              ? 'bg-gray-800 text-white border-gray-700' 
                              : 'bg-white text-gray-900 border-gray-200'
                          } focus:ring-purple-500 min-h-[100px]`}
                        />
                      </div>

                      <Button 
                        onClick={handleGenerateNotes}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 
                          text-white hover:from-purple-600 hover:to-indigo-700 
                          transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Loader2 className="w-5 h-5" />
                          </motion.div>
                        ) : null}
                        Generate Notes
                      </Button>

                      <div className="rounded-lg p-6 bg-gray-800 border border-gray-700 shadow-xl">
                        {isEditingNotes ? (
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-[400px] bg-gray-900 text-white border-gray-700 
                              focus:ring-purple-500 resize-none"
                          />
                        ) : (
                          <div className="prose prose-invert max-w-none text-white">
                            <MarkdownRenderer>{notes}</MarkdownRenderer>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button
                            onClick={() => setIsEditingNotes(!isEditingNotes)}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white
                              hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
                          >
                            {isEditingNotes ? (
                              <>
                                <FiSave className="mr-2" />
                                Save
                              </>
                            ) : (
                              <>
                                <FiEdit2 className="mr-2" />
                                Edit
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePanel === 'summarize' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Page Range</Label>
                          <PageRangeInputs
                            value={summaryPageRange}
                            onChange={setSummaryPageRange}
                            min={1}
                            max={totalPages}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Focus (Optional)</Label>
                          <Input
                            value={summaryFocus}
                            onChange={(e) => setSummaryFocus(e.target.value)}
                            placeholder="Enter topic focus"
                            className={`${
                              theme === 'dark' 
                                ? 'bg-gray-800 text-white border-gray-700' 
                                : 'bg-white text-gray-900 border-gray-200'
                            } focus:ring-purple-500`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Description (Optional)</Label>
                        <Textarea
                          value={summaryDescription}
                          onChange={(e) => setSummaryDescription(e.target.value)}
                          placeholder="Add any specific requirements or details for the summary..."
                          className={`${
                            theme === 'dark' 
                              ? 'bg-gray-800 text-white border-gray-700' 
                              : 'bg-white text-gray-900 border-gray-200'
                          } focus:ring-purple-500 min-h-[100px]`}
                        />
                      </div>

                      <div className="rounded-lg p-6 bg-gray-800 border border-gray-700 shadow-xl">
                        <div className="prose prose-invert max-w-none text-white">
                          <MarkdownRenderer>{notes}</MarkdownRenderer>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PDFAIPanel;
