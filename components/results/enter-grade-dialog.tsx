'use client'

import { useState } from 'react'
import { enterGradeAction } from '@/app/staff/results/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { classifyGrade } from '@/lib/business/grades'
import { GradeBadge } from '@/components/common/status-badges'

interface EnterGradeDialogProps {
  submissionId: string
  studentName: string
  assessmentTitle: string
  currentGrade?: number | null
  currentFeedback?: string | null
  isPublished?: boolean
}

export function EnterGradeDialog({
  submissionId,
  studentName,
  assessmentTitle,
  currentGrade,
  currentFeedback,
  isPublished = false,
}: EnterGradeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // For live preview of classification
  const [previewGrade, setPreviewGrade] = useState<string>(currentGrade?.toString() ?? '')
  const parsedGrade = parseInt(previewGrade, 10)
  const classification = !isNaN(parsedGrade) ? classifyGrade(parsedGrade) : null

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    formData.set('submissionId', submissionId)

    const result = await enterGradeAction(formData)
    setIsLoading(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    toast.success('Grade saved successfully')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={currentGrade != null ? "outline" : "default"} size="sm" className="gap-2 h-8">
          <GraduationCap className="w-4 h-4" />
          {currentGrade != null ? 'Edit Grade' : 'Enter Grade'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Grade</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium text-slate-900">{studentName}</p>
            <p className="text-xs text-slate-700">{assessmentTitle}</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="grade">Grade (0-100) <span className="text-red-500">*</span></Label>
              <Input
                id="grade"
                name="grade"
                type="number"
                min="0"
                max="100"
                value={previewGrade}
                onChange={(e) => setPreviewGrade(e.target.value)}
                placeholder="e.g. 85"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label>Classification</Label>
              <div className="h-9 flex items-center">
                {classification ? (
                  <GradeBadge classification={classification} />
                ) : (
                  <span className="text-sm text-slate-600">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="feedback">Feedback (optional)</Label>
            <Textarea
              id="feedback"
              name="feedback"
              defaultValue={currentFeedback ?? ''}
              placeholder="Constructive feedback for the student..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
            <div className="space-y-0.5">
              <Label htmlFor="isPublished" className="text-sm">Publish Result</Label>
              <p className="text-xs text-slate-700">
                Make this grade visible to the student immediately
              </p>
            </div>
            <Switch
              id="isPublished"
              name="isPublished"
              value="true"
              defaultChecked={isPublished}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading || !previewGrade} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Result
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

