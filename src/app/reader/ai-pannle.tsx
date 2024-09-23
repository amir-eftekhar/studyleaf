'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, BookOpen, HelpCircle, Paperclip, Send, Edit2, Save, RefreshCw } from 'lucide-react'

export default function PDFAIPanel() {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<{ question: string; options?: string[]; answer?: string }[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: inputMessage }])
      // Simulating AI response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'This is a simulated AI response.' }])
      }, 1000)
      setInputMessage('')
    }
  }

  const handleGenerateNotes = () => {
    // Simulating AI-generated notes
    setNotes('These are AI-generated notes based on the PDF content. You can edit these notes as needed.')
    setIsEditingNotes(true)
  }

  const handleStartQuiz = () => {
    // Simulating quiz generation
    setQuizQuestions([
      { question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], answer: 'Paris' },
      { question: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 'William Shakespeare' },
      { question: 'What is the largest planet in our solar system?', options: ['Mars', 'Jupiter', 'Saturn', 'Earth'], answer: 'Jupiter' },
    ])
    setCurrentQuestionIndex(0)
    setSelectedAnswer('')
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer('')
    }
  }

  return (
    <div className="fixed right-4 top-150 flex flex-col-reverse items-end space-y-7 space-y-reverse z-10">
    <AnimatePresence>
      {activePanel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div className="w-[70vw] h-[70vh] bg-gradient-to-br from-purple-50 to-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">
                    {activePanel === 'chat' && 'Chat with PDF'}
                    {activePanel === 'notes' && 'AI Notes'}
                    {activePanel === 'quiz' && 'Quiz Me'}
                  </h2>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-purple-400"
                    onClick={() => setActivePanel(null)}
                  >
                    &times;
                  </Button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                  {activePanel === 'chat' && (
                    <div className="h-full flex flex-col">
                      <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 space-y-4">
                        {chatMessages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-100' : 'bg-white border border-purple-200'}`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" className="shrink-0">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-grow"
                        />
                        <Button onClick={handleSendMessage} className="shrink-0">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {activePanel === 'notes' && (
                    <div className="h-full flex flex-col">
                      <div className="mb-4 flex justify-between items-center">
                        <Select>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Note style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cornell">Cornell</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                            <SelectItem value="mindmap">Mind Map</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleGenerateNotes}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Generate Notes
                        </Button>
                      </div>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Your notes will appear here..."
                        className="flex-grow mb-4"
                        disabled={!isEditingNotes}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditingNotes(!isEditingNotes)}>
                          {isEditingNotes ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                          {isEditingNotes ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                  )}
                  {activePanel === 'quiz' && (
                    <div className="h-full flex flex-col">
                      {quizQuestions.length === 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Input type="number" placeholder="Start Page" />
                            <Input type="number" placeholder="End Page" />
                          </div>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Question Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                              <SelectItem value="short-answer">Short Answer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={handleStartQuiz} className="w-full">Start Quiz</Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1} of {quizQuestions.length}</h3>
                          <p>{quizQuestions[currentQuestionIndex].question}</p>
                          <div className="space-y-2">
                            {quizQuestions[currentQuestionIndex].options?.map((option, index) => (
                              <Button
                                key={index}
                                variant={selectedAnswer === option ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => setSelectedAnswer(option)}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                          <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setQuizQuestions([])}>End Quiz</Button>
                            <Button onClick={handleNextQuestion} disabled={currentQuestionIndex === quizQuestions.length - 1}>
                              Next Question
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              </div>
        </motion.div>
      )}
    </AnimatePresence>
    
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
        onClick={() => setActivePanel(activePanel === 'quiz' ? null : 'quiz')}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </motion.div>

    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
        onClick={() => setActivePanel(activePanel === 'notes' ? null : 'notes')}
      >
        <BookOpen className="h-6 w-6" />
      </Button>
    </motion.div>

    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
        onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </motion.div>
  </div>
)
}