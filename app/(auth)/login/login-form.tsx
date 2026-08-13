'use client'

import { useTransition, useState } from 'react'
import { loginAction } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserCog, GraduationCap } from 'lucide-react'

type User = {
  id: string
  email: string
  role: string
  student: { studentId: string; fullName: string } | null
}

interface LoginFormProps {
  staffUsers: User[]
  studentUsers: User[]
}

export function LoginForm({ staffUsers, studentUsers }: LoginFormProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleLogin(email: string) {
    setSelectedEmail(email)
    setError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.set('email', email)

      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
        setSelectedEmail(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Staff / Registry Administrator (1/3 width) */}
        <div className="md:col-span-1">
          <Card className="border border-slate-200 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-blue-600" />
                Staff / Registry Administrator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col justify-start">
              {staffUsers.length === 0 ? (
                <p className="text-sm text-slate-600 italic">No staff accounts found. Run the seed script.</p>
              ) : (
                staffUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleLogin(user.email)}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      AD
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">Registry Administrator</p>
                      <p className="text-xs text-slate-700 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px]">Staff</Badge>
                      {isPending && selectedEmail === user.email && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Students Grid (2/3 width) */}
        <div className="md:col-span-2">
          <Card className="border border-slate-200 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              {studentUsers.length === 0 ? (
                <p className="text-sm text-slate-600 italic">No student accounts found. Run the seed script.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studentUsers.map((user) => {
                    const fullName = user.student?.fullName ?? user.email
                    const initials = fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()

                    return (
                      <button
                        key={user.id}
                        onClick={() => handleLogin(user.email)}
                        disabled={isPending}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
                          <p className="text-xs text-slate-700 truncate">{user.student?.studentId ?? 'No ID'}</p>
                          <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px]">Student</Badge>
                          {isPending && selectedEmail === user.email && (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


