'use client'

import { logoutAction } from '@/app/(auth)/actions'
import { SessionUser } from '@/lib/session'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, ChevronDown } from 'lucide-react'

interface TopNavbarProps {
  session: SessionUser
}

export function TopNavbar({ session }: TopNavbarProps) {
  const displayName = session.fullName ?? session.email.split('@')[0]
  const isStaff = session.role === 'STAFF'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <header className={[
      'h-14 flex-shrink-0 sticky top-0 z-10',
      'bg-white/72 backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]',
      'border-b border-slate-200/60',
      'shadow-[0_1px_8px_rgba(15,23,42,0.04)]',
    ].join(' ')}>
      <div className="w-full max-w-[1440px] mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Left: Portal label */}
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] font-semibold text-slate-800 hidden sm:block tracking-tight">
            {isStaff ? 'Registry Administration' : 'Student Portal'}
          </span>
          {isStaff ? (
            <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100/80 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200/60">
              Staff
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50/80 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-200/60">
              Student
            </span>
          )}
        </div>

        {/* Right: user menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 h-9 px-2.5 rounded-[10px] hover:bg-white/70 data-[state=open]:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all duration-150"
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shadow-sm flex-shrink-0">
                  {initials}
                </div>
                <span className="text-[13px] font-medium text-slate-700 max-w-[120px] truncate hidden sm:block">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5 py-0.5">
                  <p className="text-[14px] font-semibold text-slate-900 truncate">{displayName}</p>
                  <p className="text-[12px] text-slate-700 font-normal truncate">{session.email}</p>
                  {session.studentId && (
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">{session.studentId}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={logoutAction} className="w-full">
                  <button type="submit" className="flex items-center gap-2.5 w-full text-[13px] font-medium text-slate-600">
                    <LogOut className="w-4 h-4 text-slate-600" />
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

