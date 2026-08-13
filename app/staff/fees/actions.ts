'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireStaffSession } from '@/lib/session'
import { assignFeeSchema, recordPaymentSchema } from '@/lib/validations/payment'
import { calculateOutstandingBalance } from '@/lib/business/fees'

export async function assignFeeAction(formData: FormData) {
  await requireStaffSession()

  const raw = {
    studentId: formData.get('studentId') as string,
    amount: parseFloat(formData.get('amount') as string),
    dueDate: formData.get('dueDate') as string,
  }

  const parsed = assignFeeSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  await prisma.fee.upsert({
    where: { studentId: parsed.data.studentId },
    update: {
      amount: parsed.data.amount,
      dueDate: new Date(parsed.data.dueDate),
    },
    create: {
      studentId: parsed.data.studentId,
      amount: parsed.data.amount,
      dueDate: new Date(parsed.data.dueDate),
    },
  })

  revalidatePath(`/staff/students/${parsed.data.studentId}`)
  revalidatePath('/staff/fees')
  revalidatePath('/staff/dashboard')
  return { success: true }
}

export async function recordPaymentAction(formData: FormData) {
  await requireStaffSession()

  const raw = {
    studentId: formData.get('studentId') as string,
    amount: parseFloat(formData.get('amount') as string),
    paymentDate: formData.get('paymentDate') as string,
    referenceNumber: (formData.get('referenceNumber') as string)?.toUpperCase(),
    notes: formData.get('notes') as string,
  }

  const parsed = recordPaymentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Check for duplicate reference number
  const existing = await prisma.payment.findUnique({
    where: { referenceNumber: parsed.data.referenceNumber },
  })
  if (existing) {
    return { error: `Payment reference "${parsed.data.referenceNumber}" already exists. Please use a unique reference number.` }
  }

  // Validate payment doesn't wildly exceed balance (allow slight overpayment for rounding)
  const fee = await prisma.fee.findUnique({ where: { studentId: parsed.data.studentId } })
  if (fee) {
    const payments = await prisma.payment.findMany({
      where: { studentId: parsed.data.studentId },
      select: { amount: true },
    })
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
    const outstanding = calculateOutstandingBalance(fee.amount, totalPaid)
    if (parsed.data.amount > outstanding + 0.01) {
      return {
        error: `Payment amount (£${parsed.data.amount.toFixed(2)}) exceeds the outstanding balance (£${outstanding.toFixed(2)}).`,
      }
    }
  }

  try {
    await prisma.payment.create({
      data: {
        studentId: parsed.data.studentId,
        amount: parsed.data.amount,
        paymentDate: new Date(parsed.data.paymentDate),
        referenceNumber: parsed.data.referenceNumber,
        notes: parsed.data.notes || null,
      },
    })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { error: 'This reference number already exists.' }
    }
    throw error
  }

  revalidatePath(`/staff/students/${parsed.data.studentId}`)
  revalidatePath('/staff/fees')
  revalidatePath('/staff/dashboard')
  return { success: true }
}
