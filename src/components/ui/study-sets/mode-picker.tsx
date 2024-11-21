'use client'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Brain, Layers, ListChecks, Shuffle } from 'lucide-react'

interface StudyModePickerProps {
  selectedMode: string | null
  onSelectMode: (mode: string) => void
}

const studyModes = [
  {
    id: 'flashcards',
    name: 'Flashcards',
    description: 'Classic flashcard study mode',
    icon: Layers,
  },
  {
    id: 'match',
    name: 'Match',
    description: 'Match terms with definitions',
    icon: Brain,
  },
  {
    id: 'test',
    name: 'Test',
    description: 'Test your knowledge',
    icon: ListChecks,
  },
  {
    id: 'shuffle',
    name: 'Shuffle',
    description: 'Random order practice',
    icon: Shuffle,
  },
]

export function StudyModePicker({ selectedMode, onSelectMode }: StudyModePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {studyModes.map((mode) => (
        <Card
          key={mode.id}
          className={cn(
            'relative p-4 cursor-pointer transition-all hover:border-primary/50',
            selectedMode === mode.id && 'border-primary ring-2 ring-primary/20'
          )}
          onClick={() => onSelectMode(mode.id)}
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <mode.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{mode.name}</h3>
              <p className="text-sm text-muted-foreground">{mode.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}