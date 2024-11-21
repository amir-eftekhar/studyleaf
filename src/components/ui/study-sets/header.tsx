'use client'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StudySetHeaderProps {
  onCreateNew: () => void
}

export function StudySetHeader({ onCreateNew }: StudySetHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Study Sets</h1>
            <p className="text-muted-foreground mt-1">
              Create and study flashcards for better learning
            </p>
          </div>
          
          <Button onClick={onCreateNew} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create New Set
          </Button>
        </div>

        <div className="mt-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your study sets..."
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}