'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  User,
  CreditCard,
  ClipboardList,
  FileText,
  BarChart3,
  GraduationCap,
  Menu,
  X,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { logoutAction } from '@/app/(auth)/actions'

const navigation = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/student/profile', icon: User },
  { label: 'My Fees', href: '/student/fees', icon: CreditCard },
  { label: 'Assessments', href: '/student/assessments', icon: ClipboardList },
  { label: 'My Submissions', href: '/student/submissions', icon: FileText },
  { label: 'My Results', href: '/student/results', icon: BarChart3 },
]

interface StudentSidebarProps {
  student?: {
    fullName: string
    studentId: string
    email: string
    role: string
  }
}

export function StudentSidebar({ student }: StudentSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const renderNavItems = (isMobile = false) => {
    return navigation.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
      return (
        <Link
          key={item.href}
          href={item.href}
          title={!isMobile && isCollapsed ? item.label : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[14px] font-medium transition-all duration-150 relative overflow-hidden',
            isActive
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/55 hover:text-slate-900 hover:backdrop-blur-sm'
          )}
        >
          <item.icon
            className={cn(
              'w-[18px] h-[18px] flex-shrink-0 transition-colors',
              isActive ? 'text-white' : 'text-slate-600'
            )}
          />
          <span className={cn(
            'whitespace-nowrap transition-opacity duration-200',
            !isMobile && isCollapsed && 'opacity-0 group-hover:opacity-100'
          )}>
            {item.label}
          </span>
        </Link>
      )
    })
  }

  // User card component shared between desktop and mobile
  const UserCard = ({ minimal = false }: { minimal?: boolean }) => {
    if (!student) return null
    return (
      <div className={cn(
        'flex flex-col gap-3 w-full',
        !minimal && isCollapsed && 'items-center'
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(student.fullName)}&backgroundColor=e2e8f0`}
            alt={student.fullName}
            className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white/80 shadow-[0_2px_8px_rgba(15,23,42,0.10)] flex-shrink-0 object-cover"
          />

          <div className={cn(
            'flex flex-col min-w-0 transition-opacity duration-200 delay-100',
            !minimal && isCollapsed && 'opacity-0 group-hover:opacity-100'
          )}>
            <span className="text-[13px] font-semibold text-slate-900 truncate" title={student.fullName}>
              {student.fullName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded-md border border-emerald-100/70 uppercase tracking-wider flex-shrink-0">
                {student.role}
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-600 truncate" title={student.studentId}>
                {student.studentId}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 truncate mt-0.5" title={student.email}>
              {student.email}
            </span>
          </div>
        </div>

        <form action={logoutAction} className={cn(
          'transition-all duration-200 w-full',
          !minimal && isCollapsed && 'hidden group-hover:block'
        )}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[12px] border border-slate-200/60 bg-white/50 backdrop-blur-sm text-[12px] font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/60 hover:border-red-100 transition-all duration-150"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Trigger Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/72 backdrop-blur-[20px] border-b border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-[10px] flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 text-[15px]">SMS Registry</span>
            <span className="ml-2 text-[11px] font-semibold text-emerald-600">Student</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -mr-2 rounded-[8px] text-slate-700 hover:text-slate-800 hover:bg-white/60 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Floating Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed top-4 left-4 bottom-4 rounded-[24px]',
          // Glass surface
          'bg-white/78 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)]',
          'border border-white/70',
          'shadow-[0_4px_20px_rgba(15,23,42,0.04)]',
          'transition-[width] duration-300 [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] z-50 overflow-hidden group',
          'hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]',
          isCollapsed ? 'w-[76px] hover:w-[260px]' : 'w-[260px]'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-[80px] px-[18px] flex-shrink-0">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-slate-900 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className={cn(
                'ml-3.5 flex flex-col justify-center whitespace-nowrap overflow-hidden transition-opacity duration-200 delay-100',
                isCollapsed && 'opacity-0 group-hover:opacity-100'
              )}>
                <span className="text-[15px] font-semibold text-slate-900 leading-tight">SMS Registry</span>
                <span className="text-[12px] text-emerald-600 font-semibold leading-tight mt-0.5">Student Portal</span>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'p-1.5 rounded-[8px] hover:bg-white/60 text-slate-600 hover:text-slate-700 transition-all duration-200 hidden md:block',
                isCollapsed && 'rotate-180 opacity-0 group-hover:opacity-100'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className={cn(
            'mx-4 h-px bg-slate-200/60 transition-opacity duration-200',
            isCollapsed && 'opacity-0 group-hover:opacity-100'
          )} />

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden no-scrollbar">
            <div className={cn(
              'px-3 mb-3 transition-opacity duration-200 whitespace-nowrap h-5 flex items-center',
              isCollapsed && 'opacity-0 group-hover:opacity-100'
            )}>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.10em]">
                My Account
              </span>
            </div>
            {renderNavItems()}
          </nav>

          {/* Bottom Settings (Optional for student, but let's add it if needed? User didn't specify. Just keeping the spacing consistent) */}
          <div className="px-3 pb-4">
            <div className={cn(
              'h-px bg-slate-200/60 mx-1 mb-3 transition-opacity duration-200',
              isCollapsed && 'opacity-0 group-hover:opacity-100'
            )} />
          </div>

          {/* User Profile Card */}
          {student && (
            <div className={cn(
              'flex-shrink-0 mx-3 mb-3 transition-all duration-300 overflow-hidden',
              'p-3 rounded-[18px]',
              'bg-white/50 backdrop-blur-sm border border-white/70',
              'shadow-sm',
              isCollapsed && 'p-2 bg-transparent border-transparent shadow-none group-hover:p-3 group-hover:bg-white/50 group-hover:border-white/60 group-hover:shadow-sm'
            )}>
              <UserCard />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className={[
            'relative flex flex-col w-[280px] h-full',
            'bg-white/90 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)]',
            'shadow-[4px_0_24px_rgba(15,23,42,0.06)]',
            'animate-in slide-in-from-left duration-200',
          ].join(' ')}>
            {/* Mobile header */}
            <div className="flex items-center justify-between h-[72px] px-5 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-900 rounded-[12px] flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[15px] font-semibold text-slate-900 leading-tight">SMS Registry</span>
                  <span className="text-[12px] text-emerald-600 font-semibold leading-tight mt-0.5">Student Portal</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 -mr-1 text-slate-600 hover:text-slate-700 rounded-[8px] hover:bg-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
              <div className="px-3 mb-3 h-5 flex items-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.10em]">
                  My Account
                </span>
              </div>
              {renderNavItems(true)}
            </nav>

            {/* Mobile user card */}
            {student && (
              <div className="flex-shrink-0 mx-3 mb-4 p-3 rounded-[18px] bg-slate-50/80 border border-slate-200/60">
                <UserCard minimal />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}


