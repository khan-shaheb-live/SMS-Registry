'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireStudentSession } from '@/lib/session'
import { saveFile } from '@/lib/storage'
import { isSubmissionLate } from '@/lib/business/submissions'

export async function submitAssessmentAction(formData: FormData) {
  const session = await requireStudentSession()
  if (!session.studentId) return { error: 'Not authorized' }

  const assessmentId = formData.get('assessmentId') as string
  const file = formData.get('file') as File | null
  const textContent = formData.get('textContent') as string | null

  const hasFile = file && file.size > 0
  const hasText = textContent && textContent.trim().length > 0

  if (!assessmentId) {
    return { error: 'Assessment ID is required.' }
  }

  if (!hasFile && !hasText) {
    return { error: 'You must provide either text content or a file attachment.' }
  }

  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } })
  if (!assessment) return { error: 'Assessment not found.' }

  // Check if already submitted
  const existing = await prisma.submission.findUnique({
    where: {
      studentId_assessmentId: {
        studentId: session.studentId,
        assessmentId: assessmentId,
      },
    },
  })

  if (existing) {
    return { error: 'You have already submitted this assessment.' }
  }

  let fileName = null
  let filePath = null
  let fileSize = null
  let mimeType = null

  if (hasFile) {
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return { error: 'File size must be less than 10MB.' }
    }

    const uploadResult = await saveFile(file, 'submissions')
    if (!uploadResult.success) {
      return { error: uploadResult.error || 'Failed to save file.' }
    }
    
    fileName = uploadResult.file.fileName
    filePath = uploadResult.file.filePath
    fileSize = uploadResult.file.fileSize
    mimeType = uploadResult.file.mimeType
  }

  const submittedAt = new Date()
  const isLate = isSubmissionLate(submittedAt, assessment.deadline)

  await prisma.submission.create({
    data: {
      studentId: session.studentId,
      assessmentId,
      textContent: hasText ? textContent : null,
      fileName,
      filePath,
      fileSize,
      mimeType,
      submittedAt,
      isLate,
    },
  })

  revalidatePath('/student/assessments')
  revalidatePath('/student/submissions')
  revalidatePath('/student/dashboard')
  redirect('/student/submissions')
}
