'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Image as ImageIcon, MessageSquare, Upload, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

import axios from 'axios'

interface CreateSetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSetCreated?: () => void
}

interface Card {
  front: string
  back: string
}

export function CreateSetDialog({ open, onOpenChange, onSetCreated }: CreateSetDialogProps) {
  const { toast } = useToast()  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cards, setCards] = useState<Card[]>([{ front: '', back: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddCard = () => {
    setCards([...cards, { front: '', back: '' }])
  }

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index))
  }

  const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
    const newCards = [...cards]
    newCards[index][field] = value
    setCards(newCards)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your study set',
        variant: 'destructive',
      })
      return
    }

    if (cards.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one card to your study set',
        variant: 'destructive',
      })
      return
    }

    const validCards = cards.filter(card => card.front.trim() && card.back.trim())
    if (validCards.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in both sides of at least one card',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/study-sets', {
        title,
        description,
        cards: validCards,
      })

      toast({
        title: 'Success',
        description: 'Study set created successfully!',
      })

      onSetCreated?.()
      onOpenChange(false)
      setTitle('')
      setDescription('')
      setCards([{ front: '', back: '' }])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create study set. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Study Set</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter study set title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your study set"
              />
            </div>
          </div>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manual">
                <MessageSquare className="h-5 w-5 mr-2" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="pdf">
                <FileText className="h-5 w-5 mr-2" />
                From PDF
              </TabsTrigger>
              <TabsTrigger value="image">
                <ImageIcon className="h-5 w-5 mr-2" />
                From Image
              </TabsTrigger>
              <TabsTrigger value="import">
                <Upload className="h-5 w-5 mr-2" />
                Import
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              {cards.map((card, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Card {index + 1}</span>
                    {cards.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCard(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Front</Label>
                      <Textarea
                        placeholder="Enter term or question"
                        value={card.front}
                        onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Back</Label>
                      <Textarea
                        placeholder="Enter definition or answer"
                        value={card.back}
                        onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddCard}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </TabsContent>

            {/* Keep other TabsContent components */}
          </Tabs>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Set'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}