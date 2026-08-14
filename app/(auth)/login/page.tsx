import { prisma } from '@/lib/db'
import { LoginForm } from './login-form'
import { GraduationCap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sign In — SMS Registry',
}

export default async function LoginPage() {
  // Fetch all users to populate demo selector
  const users = await prisma.user.findMany({
    include: {
      student: {
        select: { studentId: true, fullName: true },
      },
    },
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
  })

  const staffUsers = users.filter((u) => u.role === 'STAFF')
  const studentUsers = users.filter((u) => u.role === 'STUDENT')

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4 shadow-md">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SMS Registry</h1>
          <p className="text-slate-700 text-sm mt-1">University of Greenfield</p>
        </div>

        <LoginForm staffUsers={staffUsers} studentUsers={studentUsers} />

        <p className="text-center text-xs text-slate-600 mt-8">
          Student Management System · Registry Module · v1.0
        </p>
      </div>
    </div>
  )
}


