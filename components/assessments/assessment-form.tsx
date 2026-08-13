'use client'

import { useState } from 'react'
import { createAssessmentAction, updateAssessmentAction } from '@/app/staff/assessments/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Programme { id: string; name: string }
interface Assessment {
  id: string
  title: string
  module: string
  programmeId: string | null
  academicYear: string
  description: string | null
  deadline: Date
}

interface AssessmentFormProps {
  programmes: Programme[]
  assessment?: Assessment
}

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2023-2024', '2022-2023']

export function AssessmentForm({ programmes, assessment }: AssessmentFormProps) {
  const isEditing = !!assessment
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [programmeId, setProgrammeId] = useState(assessment?.programmeId ?? '__ALL__')
  const [academicYear, setAcademicYear] = useState(assessment?.academicYear ?? '2024-2025')

  const deadlineStr = assessment?.deadline
    ? new Date(assessment.deadline).toISOString().slice(0, 16)
    : ''

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    formData.set('programmeId', programmeId === '__ALL__' ? '' : programmeId)
    formData.set('academicYear', academicYear)

    const action = isEditing ? updateAssessmentAction : createAssessmentAction
    const result = await action(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    toast.success(isEditing ? 'Assessment updated' : 'Assessment created')
  }

  return (
    <Card className="border border-slate-200 shadow-none">
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-5">
          {isEditing && <input type="hidden" name="id" value={assessment.id} />}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input id="title" name="title" defaultValue={assessment?.title} placeholder="e.g. Algorithm Design & Analysis" required disabled={isLoading} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="module">Module <span className="text-red-500">*</span></Label>
              <Input id="module" name="module" defaultValue={assessment?.module} placeholder="e.g. CS301 — Algorithms" required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="programmeId">Programme</Label>
              <Select value={programmeId} onValueChange={setProgrammeId} disabled={isLoading}>
                <SelectTrigger id="programmeId"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ALL__">All Programmes</SelectItem>
                  {programmes.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="academicYear">Academic Year <span className="text-red-500">*</span></Label>
              <Select value={academicYear} onValueChange={setAcademicYear} disabled={isLoading}>
                <SelectTrigger id="academicYear"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Submission Deadline <span className="text-red-500">*</span></Label>
              <Input id="deadline" name="deadline" type="datetime-local" defaultValue={deadlineStr} required disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={assessment?.description ?? ''} placeholder="Assessment brief, requirements, marking criteria..." rows={4} disabled={isLoading} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Assessment'}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()} disabled={isLoading}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
