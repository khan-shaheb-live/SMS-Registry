'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { generateStudentId } from '@/lib/business/students'
import { createStudentSchema, updateStudentSchema } from '@/lib/validations/student'
import { requireStaffSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth/password'

export async function createStudentAction(formData: FormData) {
  await requireStaffSession()

  const raw = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    dateOfBirth: formData.get('dateOfBirth') as string,
    programmeId: formData.get('programmeId') as string,
    academicYear: formData.get('academicYear') as string,
    status: formData.get('status') as string,
  }

  const parsed = createStudentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Check for duplicate email
  const existingEmail = await prisma.student.findUnique({
    where: { email: parsed.data.email },
  })
  if (existingEmail) {
    return { error: 'A student with this email address already exists.' }
  }

  // Generate unique student ID
  const studentId = await generateStudentId()

  try {
    const student = await prisma.student.create({
      data: {
        studentId,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        dateOfBirth: new Date(parsed.data.dateOfBirth),
        programmeId: parsed.data.programmeId,
        academicYear: parsed.data.academicYear,
        status: parsed.data.status,
      },
    })

    // Also create a user account for the student
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        role: 'STUDENT',
        studentId: student.id,
        password: hashPassword('password123'),
      },
    })

    revalidatePath('/staff/students')
    revalidatePath('/staff/dashboard')
    redirect(`/staff/students/${student.id}`)
  } catch (error: any) {
    if (error?.code === 'P2002') {
      if (error?.meta?.target?.includes('email')) {
        return { error: 'A student with this email address already exists.' }
      }
      if (error?.meta?.target?.includes('studentId')) {
        return { error: 'Student ID generation conflict. Please try again.' }
      }
    }
    throw error
  }
}

export async function updateStudentAction(formData: FormData) {
  await requireStaffSession()

  const raw = {
    id: formData.get('id') as string,
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    dateOfBirth: formData.get('dateOfBirth') as string,
    programmeId: formData.get('programmeId') as string,
    academicYear: formData.get('academicYear') as string,
    status: formData.get('status') as string,
  }

  const parsed = updateStudentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Check for duplicate email (excluding this student)
  const existingEmail = await prisma.student.findFirst({
    where: { email: parsed.data.email, NOT: { id: parsed.data.id } },
  })
  if (existingEmail) {
    return { error: 'A student with this email address already exists.' }
  }

  try {
    await prisma.student.update({
      where: { id: parsed.data.id },
      data: {
        fullName: parsed.data.fullName!,
        email: parsed.data.email!,
        dateOfBirth: new Date(parsed.data.dateOfBirth!),
        programmeId: parsed.data.programmeId!,
        academicYear: parsed.data.academicYear!,
        status: parsed.data.status!,
      },
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { error: 'A student with this email already exists.' }
    }
    throw error
  }

  revalidatePath('/staff/students')
  revalidatePath(`/staff/students/${parsed.data.id}`)
  revalidatePath('/staff/dashboard')
  redirect(`/staff/students/${parsed.data.id}`)
}
