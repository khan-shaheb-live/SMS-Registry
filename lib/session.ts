import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export type SessionUser = {
  id: string
  email: string
  role: 'STAFF' | 'STUDENT'
  studentId?: string
  studentDbId?: string
  fullName?: string
}

const SESSION_COOKIE = 'sms_session'

/**
 * Get the current session from cookie.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie?.value) return null

  try {
    const payload = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    )

    // Validate the user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
          },
        },
      },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.role as 'STAFF' | 'STUDENT',
      studentId: user.student?.id,
      studentDbId: user.student?.id,
      fullName: user.student?.fullName,
    }
  } catch {
    return null
  }
}

/**
 * Create a session cookie for a user.
 */
export function createSessionToken(userId: string, email: string): string {
  const payload = { id: userId, email }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * Require authentication — redirect to login if not authenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    const { redirect } = await import('next/navigation')
    redirect('/login')
    throw new Error('Redirecting to login')
  }
  return session
}

/**
 * Require staff role — throw if not staff.
 */
export async function requireStaffSession(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== 'STAFF') {
    const { redirect } = await import('next/navigation')
    redirect('/student/dashboard')
    throw new Error('Redirecting to student dashboard')
  }
  return session
}

/**
 * Require student role — throw if not student.
 */
export async function requireStudentSession(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== 'STUDENT') {
    const { redirect } = await import('next/navigation')
    redirect('/staff/dashboard')
  }
  return session
}
