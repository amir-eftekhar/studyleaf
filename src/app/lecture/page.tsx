'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, StopCircle, FileText, List, AlignLeft, Grid3X3 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function EnhancedLectureNotes() {
  const [isRecording, setIsRecording] = useState(false)
  const [lectureId, setLectureId] = useState('')
  const [transcription, setTranscription] = useState('')
  const [notes, setNotes] = useState({
    paragraph: '',
    bulletPoints: '',
    cornell: { notes: '', cues: '', summary: '' },
  })
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setLectureId(Date.now().toString())
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        setTranscription(prevTranscription => prevTranscription + finalTranscript)
      }
    } else {
      console.error('Speech recognition not supported')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleRecording = async () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTranscription('')
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      await generateNotes()
    }
  }

  const generateNotes = async () => {
    if (!transcription.trim()) {
      console.error('No transcription to generate notes from')
      return
    }

    try {
      const response = await fetch('/api/lecture_notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId,
          text: transcription,
          config: { style: 'all' }
        }),
      })
      const data = await response.json()
      if (data.notes) {
        setNotes({
          paragraph: data.notes.summary || '',
          bulletPoints: data.notes.bullet || '',
          cornell: {
            notes: data.notes.cornell?.notes || '',
            cues: data.notes.cornell?.cues || '',
            summary: data.notes.cornell?.summary || '',
          },
        })
      } else {
        console.error('Failed to generate notes:', data.error)
      }
    } catch (error) {
      console.error('Error generating notes:', error)
    }
  }

  const clearNotes = () => {
    setNotes({
      paragraph: '',
      bulletPoints: '',
      cornell: { notes: '', cues: '', summary: '' },
    })
    setTranscription('')
  }

  const copyNotes = () => {
    const notesText = JSON.stringify(notes, null, 2)
    navigator.clipboard.writeText(notesText)
      .then(() => alert('Notes copied to clipboard!'))
      .catch(err => console.error('Failed to copy notes:', err))
  }

  const saveNotes = async () => {
    // Implement save functionality here
    alert('Save functionality not implemented yet')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            AI-Powered Lecture Notes
          </h1>

          <div className="flex justify-center mb-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <StopCircle className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
            </motion.div>
          </div>
          <p className="text-center mb-8">
            {isRecording ? 'Recording in progress... Click to stop' : 'Click to start recording your lecture'}
          </p>

          <Tabs defaultValue="paragraph" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="paragraph" className="flex items-center"><AlignLeft className="mr-2 h-4 w-4" /> Paragraph</TabsTrigger>
              <TabsTrigger value="bulletPoints" className="flex items-center"><List className="mr-2 h-4 w-4" /> Bullet Points</TabsTrigger>
              <TabsTrigger value="cornell" className="flex items-center"><Grid3X3 className="mr-2 h-4 w-4" /> Cornell</TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center"><FileText className="mr-2 h-4 w-4" /> Raw</TabsTrigger>
            </TabsList>
            <TabsContent value="paragraph">
              <Textarea
                value={notes.paragraph}
                onChange={(e) => setNotes({ ...notes, paragraph: e.target.value })}
                placeholder="Paragraph form notes will appear here..."
                className="min-h-[300px]"
              />
            </TabsContent>
            <TabsContent value="bulletPoints">
              <Textarea
                value={notes.bulletPoints}
                onChange={(e) => setNotes({ ...notes, bulletPoints: e.target.value })}
                placeholder="Bullet point notes will appear here..."
                className="min-h-[300px]"
              />
            </TabsContent>
            <TabsContent value="cornell">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Textarea
                    value={notes.cornell.notes}
                    onChange={(e) => setNotes({ ...notes, cornell: { ...notes.cornell, notes: e.target.value } })}
                    placeholder="Main notes..."
                    className="min-h-[200px] mb-4"
                  />
                  <Textarea
                    value={notes.cornell.summary}
                    onChange={(e) => setNotes({ ...notes, cornell: { ...notes.cornell, summary: e.target.value } })}
                    placeholder="Summary..."
                    className="min-h-[100px]"
                  />
                </div>
                <Textarea
                  value={notes.cornell.cues}
                  onChange={(e) => setNotes({ ...notes, cornell: { ...notes.cornell, cues: e.target.value } })}
                  placeholder="Cues..."
                  className="min-h-[300px]"
                />
              </div>
            </TabsContent>
            <TabsContent value="raw">
              <Textarea
                value={JSON.stringify(notes, null, 2)}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={clearNotes}>
              Clear
            </Button>
            <Button variant="outline" onClick={copyNotes}>
              Copy
            </Button>
            <Button onClick={saveNotes}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
