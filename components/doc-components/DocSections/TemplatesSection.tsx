
'use client'

import { useState } from 'react'
import { FileText, ScrollText, BookOpen, Rocket, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { X, CheckCircle } from "lucide-react";


const TEMPLATES = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Structured template for meeting notes with agenda, discussion points, and action items.',
    emoji: '📝',
    imageUrl: "/assets/meeting-notes.png",
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'wiki',
    title: 'Wiki',
    description: 'Documentation template with overview, details, and related links sections.',
    emoji: '📚',
    imageUrl: "/assets/wikipedia.png", 
    color: 'bg-green-50 text-green-600',
  },
  {
    id: 'project-overview',
    title: 'Project Overview',
    description: 'Project planning template with goals, team members, milestones, and resources.',
    emoji: '🚀',
    imageUrl: "/assets/project-overview.png",
    color: 'bg-purple-50 text-purple-600',
  },
]

export default function TemplatesSection() {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState<string | null>(null)
  const router = useRouter()
  const { push } = useRouter()
  const { workspaceId } = router.query

  const createFromTemplate = async (templateId: string) => {
    if (!workspaceId) {
      toast.error('No workspace selected')
      return
    }

    setCreating(templateId)
    try {
      const response = await fetch('/api/pages/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          workspaceId,
        }),
      })

      if (response.ok) {
        const page = await response.json()
        toast.success('Page created from template!')
        setOpen(false)
        push(`/workspace/${workspaceId}/page/${page.id}`)
      } else {
        throw new Error('Failed to create page')
      }
    } catch (error) {
      toast.error('Failed to create page from template')
    } finally {
      setCreating(null)
    }
  }

  return (
    <>
     <div className="dark:bg-[#131313] bg-[#FCFCFC] shadow-sm rounded-xl border dark:border-[#2A2A2A] p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-medium text-sm">Start with a template</h3>
        <div className="flex items-center gap-3">
          
           <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
       <button type="button"  className="text-muted-foreground hover:text-foreground text-xs">
            Browse Templates
          </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template to save time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 mt-4">
          {TEMPLATES.map((template) => (
            <button type="button" 
              key={template.id}
              onClick={() => createFromTemplate(template.id)}
              disabled={creating === template.id}
              className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary hover:bg-secondary transition-all text-left"
            >
              <div className={`size-12 rounded-lg flex items-center justify-center flex-shrink-0 ${template.color}`}>
              </div> 
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{template.emoji}</span>
                  <h3 className="font-semibold text-foreground">
                    {template.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>
              {creating === template.id && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map((template) => (
          <button type="button" 
             key={template.id}
              onClick={() => createFromTemplate(template.id)}
              disabled={creating === template.id}
            className="flex items-center shadow-sm gap-2 p-3 dark:bg-[#111111] bg-[#fff] rounded-xl border dark:border-[#272727] hover:bg-secondary transition-colors text-left"
          >
            <img className={`size-10 rounded-full bg-contain flex items-center justify-center text-lg`}
             src={template.imageUrl}
              alt={template.title}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground font-medium text-sm truncate">
                  {template.title}
                </span>
                {creating === template.id && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              )}
              </div>
              <p className="text-muted-foreground text-xs truncate">
                {template.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div></>
  )
}
