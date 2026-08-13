'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireStaffSession } from '@/lib/session'
import { classifyGrade } from '@/lib/business/grades'

export async function enterGradeAction(formData: FormData) {
  await requireStaffSession()

  const submissionId = formData.get('submissionId') as string
  const gradeValue = parseInt(formData.get('grade') as string, 10)
  const feedback = (formData.get('feedback') as string) || null
  const isPublished = formData.get('isPublished') === 'true'

  if (!submissionId || isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
    return { error: 'Grade must be between 0 and 100.' }
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { student: true, assessment: true },
  })

  if (!submission) {
    return { error: 'Submission not found.' }
  }

  const classification = classifyGrade(gradeValue)

  await prisma.grade.upsert({
    where: { submissionId },
    update: { grade: gradeValue, classification, feedback, isPublished },
    create: {
      submissionId,
      grade: gradeValue,
      classification,
      feedback,
      isPublished,
    },
  })

  revalidatePath('/staff/results')
  revalidatePath(`/staff/students/${submission.studentId}`)
  revalidatePath('/staff/dashboard')
  return { success: true }
}

export async function publishGradeAction(formData: FormData) {
  await requireStaffSession()

  const gradeId = formData.get('gradeId') as string
  const publish = formData.get('publish') === 'true'

  await prisma.grade.update({
    where: { id: gradeId },
    data: { isPublished: publish },
  })

  revalidatePath('/staff/results')
  revalidatePath('/staff/dashboard')
  return { success: true }
}

export async function bulkPublishGradesAction(formData: FormData) {
  await requireStaffSession()

  const assessmentId = formData.get('assessmentId') as string
  if (!assessmentId) return { error: 'Assessment ID required' }

  const submissions = await prisma.submission.findMany({
    where: { assessmentId },
    select: { id: true },
  })
  const submissionIds = submissions.map(s => s.id)

  await prisma.grade.updateMany({
    where: { 
      submissionId: { in: submissionIds }, 
      isPublished: false 
    },
    data: { isPublished: true },
  })

  revalidatePath('/staff/results')
  revalidatePath('/staff/dashboard')
  return { success: true }
}
