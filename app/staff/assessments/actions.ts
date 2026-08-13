'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { requireStaffSession } from '@/lib/session'
import { createAssessmentSchema, updateAssessmentSchema } from '@/lib/validations/assessment'

export async function createAssessmentAction(formData: FormData) {
  await requireStaffSession()

  const raw = {
    title: formData.get('title') as string,
    module: formData.get('module') as string,
    programmeId: formData.get('programmeId') as string || null,
    academicYear: formData.get('academicYear') as string,
    description: formData.get('description') as string || undefined,
    deadline: formData.get('deadline') as string,
  }

  const parsed = createAssessmentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const assessment = await prisma.assessment.create({
    data: {
      title: parsed.data.title,
      module: parsed.data.module,
      programmeId: parsed.data.programmeId ?? null,
      academicYear: parsed.data.academicYear,
      description: parsed.data.description ?? null,
      deadline: new Date(parsed.data.deadline),
    },
  })

  revalidatePath('/staff/assessments')
  revalidatePath('/staff/dashboard')
  redirect(`/staff/assessments/${assessment.id}`)
}

export async function updateAssessmentAction(formData: FormData) {
  await requireStaffSession()

  const raw = {
    id: formData.get('id') as string,
    title: formData.get('title') as string,
    module: formData.get('module') as string,
    programmeId: formData.get('programmeId') as string || null,
    academicYear: formData.get('academicYear') as string,
    description: formData.get('description') as string || undefined,
    deadline: formData.get('deadline') as string,
  }

  const parsed = updateAssessmentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  await prisma.assessment.update({
    where: { id: parsed.data.id },
    data: {
      title: parsed.data.title!,
      module: parsed.data.module!,
      programmeId: parsed.data.programmeId ?? null,
      academicYear: parsed.data.academicYear!,
      description: parsed.data.description ?? null,
      deadline: new Date(parsed.data.deadline!),
    },
  })

  revalidatePath('/staff/assessments')
  revalidatePath(`/staff/assessments/${parsed.data.id}`)
  redirect(`/staff/assessments/${parsed.data.id}`)
}
