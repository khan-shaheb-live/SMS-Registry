'use client'

import { useTransition, useState } from 'react'
import { loginAction } from '../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, UserCog, GraduationCap, Lock, Mail } from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)

      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  function autofillAndLogin(userEmail: string) {
    setEmail(userEmail)
    setPassword('password123')
    setSelectedEmail(userEmail)
    setError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.set('email', userEmail)
      formData.set('password', 'password123')

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Main Login Form (5/12 width) */}
        <div className="lg:col-span-5">
          <Card className="border border-slate-200 shadow-md h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Secure Sign In
                </CardTitle>
                <CardDescription>Enter your registry credentials below</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@university.ac.uk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-10 rounded-[10px]"
                        required
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 h-10 rounded-[10px]"
                        required
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-10 rounded-[10px] mt-2" disabled={isPending}>
                    {isPending && !selectedEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Right: Demo Selector / Quick Access (7/12 width) */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-200 shadow-md h-full p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <Badge variant="outline" className="px-3 py-1 text-slate-700 font-semibold border-slate-200 mb-2">
                  Demo Portal Quick Access
                </Badge>
                <p className="text-xs text-slate-600">
                  Click any account card below to auto-fill the form and sign in instantly.
                </p>
              </div>

              <div className="space-y-4">
                {/* Staff Column */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">Staff Account</span>
                  {staffUsers.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">No staff accounts found.</p>
                  ) : (
                    staffUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => autofillAndLogin(user.email)}
                        disabled={isPending}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left disabled:opacity-50 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          AD
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">Registry Staff</p>
                          <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
                        </div>
                        {isPending && selectedEmail === user.email && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Students Column */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">Student Accounts</span>
                  {studentUsers.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">No student accounts found.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                            type="button"
                            onClick={() => autofillAndLogin(user.email)}
                            disabled={isPending}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left disabled:opacity-50 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-xs shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">{fullName}</p>
                              <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
                            </div>
                            {isPending && selectedEmail === user.email && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
