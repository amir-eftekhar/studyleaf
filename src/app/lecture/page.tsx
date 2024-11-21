'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, FileAudio, FileText, Brain, Download, Mic, StopCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

type NoteType = 'summary' | 'detailed' | 'outline' | 'cornell';

export default function LecturePage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [notes, setNotes] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [noteType, setNoteType] = useState<NoteType>('detailed');
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType>('detailed');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setFile(new File([audioBlob], 'recorded-lecture.wav', { type: 'audio/wav' }));
        setActiveTab('process');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setActiveTab('process');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Create form data with the audio file
      const formData = new FormData();
      formData.append('file', audioBlob);

      // Get transcription
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeRes.ok) {
        const error = await transcribeRes.json();
        throw new Error(error.error || 'Failed to transcribe audio');
      }

      const { transcript } = await transcribeRes.json();

      // Generate notes from transcription
      const notesRes = await fetch('/api/lecture_notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          noteType: selectedNoteType,
        }),
      });

      if (!notesRes.ok) {
        const error = await notesRes.json();
        throw new Error(error.error || 'Failed to generate notes');
      }

      const { notes } = await notesRes.json();

      // Save the notes
      const saveRes = await fetch('/api/save-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Lecture Notes - ${new Date().toLocaleDateString()}`,
          content: notes,
          noteType: selectedNoteType,
          transcript,
        }),
      });

      if (!saveRes.ok) {
        console.error('Failed to save notes:', await saveRes.json());
        toast({
          title: "Warning",
          description: "Notes generated but failed to save. You can still download them.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Your notes have been generated and saved.",
          variant: "default",
        });
      }

      setGeneratedNotes(notes);
      setActiveTab('results');
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process audio');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to process audio',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedNotes], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `lecture-notes-${selectedNoteType}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Lecture Notes Generator</h1>
          <p className="text-muted-foreground mt-2">
            Record or upload your lecture and get AI-generated notes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" disabled={isLoading}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="process" disabled={!file || isLoading}>
              <Brain className="w-4 h-4 mr-2" />
              Process
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!generatedNotes}>
              <FileText className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Record Lecture</CardTitle>
                  <CardDescription>
                    Record your lecture directly using your microphone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 space-y-4">
                    {isRecording ? (
                      <StopCircle className="w-12 h-12 text-red-500 animate-pulse" />
                    ) : (
                      <Mic className="w-12 h-12 text-muted-foreground" />
                    )}
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "ghost" : "solid"}
                      className="w-full max-w-xs"
                    >
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Recording</CardTitle>
                  <CardDescription>
                    Select an audio or video file of your lecture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 space-y-4">
                    <FileAudio className="w-12 h-12 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your file here, or click to browse
                      </p>
                      <Input
                        type="file"
                        accept="audio/*,video/*"
                        onChange={handleFileChange}
                        className="max-w-xs"
                      />
                    </div>
                  </div>
                  {file && (
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileAudio className="w-6 h-6" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Ready to Process</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>Process Recording</CardTitle>
                <CardDescription>
                  Choose note type and generate transcript and notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Note Type</label>
                    <Select value={selectedNoteType} onValueChange={(value: NoteType) => setSelectedNoteType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select note type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary Notes</SelectItem>
                        <SelectItem value="detailed">Detailed Notes</SelectItem>
                        <SelectItem value="outline">Outline Format</SelectItem>
                        <SelectItem value="cornell">Cornell Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => processAudio(file as Blob)}
                    disabled={!file || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Start Processing
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle>Transcript</CardTitle>
                  <CardDescription>
                    Raw transcript from your lecture recording
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[450px] w-full rounded-md border p-4">
                    <div className="whitespace-pre-wrap">
                      {transcript || 'No transcript available'}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="h-[600px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Generated Notes</CardTitle>
                    <CardDescription>
                      AI-generated {selectedNoteType} notes from your lecture
                    </CardDescription>
                  </div>
                  {generatedNotes && (
                    <Button variant="ghost" className="w-8 h-8 p-0" onClick={downloadNotes}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[450px] w-full rounded-md border p-4">
                    <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                      {generatedNotes || 'No notes available'}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
