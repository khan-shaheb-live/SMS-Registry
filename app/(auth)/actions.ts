'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createSessionToken } from '@/lib/session'
import { verifyPassword } from '@/lib/auth/password'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email) {
    return { error: 'Please enter an email' }
  }

  if (!password) {
    return { error: 'Please enter a password' }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: {
        select: { id: true, studentId: true, fullName: true },
      },
    },
  })

  if (!user) {
    return { error: 'Invalid email or password' }
  }

  const isPasswordValid = verifyPassword(password, user.password)
  if (!isPasswordValid) {
    return { error: 'Invalid email or password' }
  }

  const token = createSessionToken(user.id, user.email)
  
  const cookieStore = cookies()
  cookieStore.set('sms_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  if (user.role === 'STAFF') {
    redirect('/staff/dashboard')
  } else {
    redirect('/student/dashboard')
  }
}

export async function logoutAction() {
  const cookieStore = cookies()
  cookieStore.delete('sms_session')
  redirect('/login')
}
