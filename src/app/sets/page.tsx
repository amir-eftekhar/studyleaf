'use client'
import { useState } from 'react'
import { StudySetHeader } from '@/components/ui/study-sets/header'
import { CreateSetDialog } from '@/components/ui/study-sets/create-dialog'
import { StudySetGrid } from '@/components/ui/study-sets/grid'
import { StudyModePicker } from '@/components/ui/study-sets/mode-picker'

export default function StudySetsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <StudySetHeader onCreateNew={() => setIsCreateDialogOpen(true)} />
      
      <main className="container mx-auto px-4 py-8">
        <StudyModePicker
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
        />
        
        <StudySetGrid />
      </main>

      <CreateSetDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}