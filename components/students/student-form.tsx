'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStudentAction, updateStudentAction } from '@/app/staff/students/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Programme {
  id: string
  name: string
  code: string
  defaultFee: any
}

interface Student {
  id: string
  fullName: string
  email: string
  dateOfBirth: Date
  programmeId: string
  academicYear: string
  status: string
}

interface StudentFormProps {
  programmes: Programme[]
  student?: Student
}

const STATUSES = [
  { value: 'ENROLLED', label: 'Enrolled' },
  { value: 'DEFERRED', label: 'Deferred' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
  { value: 'COMPLETED', label: 'Completed' },
]

const ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2023-2024', '2022-2023']

export function StudentForm({ programmes, student }: StudentFormProps) {
  const isEditing = !!student
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [programmeId, setProgrammeId] = useState(student?.programmeId ?? '')
  const [status, setStatus] = useState(student?.status ?? 'ENROLLED')
  const [academicYear, setAcademicYear] = useState(student?.academicYear ?? '2024-2025')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    formData.set('programmeId', programmeId)
    formData.set('status', status)
    formData.set('academicYear', academicYear)

    const action = isEditing ? updateStudentAction : createStudentAction
    const result = await action(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    toast.success(isEditing ? 'Student updated successfully' : 'Student registered successfully')
    // Redirect handled by server action
  }

  const dob = student?.dateOfBirth
    ? new Date(student.dateOfBirth).toISOString().split('T')[0]
    : ''

  return (
    <Card className="border border-slate-200 shadow-none">
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-5">
          {isEditing && <input type="hidden" name="id" value={student.id} />}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={student?.fullName}
                placeholder="e.g. Alice Chen"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={student?.email}
                placeholder="student@university.ac.uk"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={dob}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="programmeId">
                Programme <span className="text-red-500">*</span>
              </Label>
              <Select value={programmeId} onValueChange={setProgrammeId} disabled={isLoading}>
                <SelectTrigger id="programmeId">
                  <SelectValue placeholder="Select programme..." />
                </SelectTrigger>
                <SelectContent>
                  {programmes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="academicYear">
                Academic Year <span className="text-red-500">*</span>
              </Label>
              <Select value={academicYear} onValueChange={setAcademicYear} disabled={isLoading}>
                <SelectTrigger id="academicYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">
                Enrolment Status <span className="text-red-500">*</span>
              </Label>
              <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isLoading || !programmeId} className="gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Register Student'}
            </Button>
            <Button type="button" variant="outline" onClick={() => history.back()} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
