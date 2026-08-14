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
  const [mode, setMode] = useState<'minimal' | 'glass' | 'dark'>('glass')

  const applyTheme = (themeMode: 'minimal' | 'glass' | 'dark') => {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    root.classList.remove('theme-minimal', 'theme-glass', 'theme-dark', 'dark')
    root.classList.add(`theme-${themeMode}`)
    if (themeMode === 'dark') {
      root.classList.add('dark')
    }
  }

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-mode') as 'minimal' | 'glass' | 'dark'
    const activeMode = saved && ['minimal', 'glass', 'dark'].includes(saved) ? saved : 'glass'
    setMode(activeMode)
    applyTheme(activeMode)
  }, [])

  const handleModeChange = (newMode: 'minimal' | 'glass' | 'dark') => {
    setMode(newMode)
    localStorage.setItem('sidebar-mode', newMode)
    applyTheme(newMode)
  }

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
              ? (mode === 'dark' ? 'sidebar-active-link bg-white text-slate-950 shadow-[0_2px_8px_rgba(255,255,255,0.12)]' : 'bg-slate-900 text-white shadow-sm')
              : (mode === 'dark' ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-white/55 hover:text-slate-900 hover:backdrop-blur-sm')
          )}
        >
          <item.icon
            className={cn(
              'w-[18px] h-[18px] flex-shrink-0 transition-colors',
              isActive
                ? (mode === 'dark' ? 'text-slate-950' : 'text-white')
                : (mode === 'dark' ? 'text-slate-400' : 'text-slate-600')
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
            <span className={cn(
              "text-[13px] font-semibold truncate",
              mode === 'dark' ? "text-white" : "text-slate-900"
            )} title={student.fullName}>
              {student.fullName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider flex-shrink-0",
                mode === 'dark'
                  ? "text-emerald-300 bg-emerald-950/50 border-emerald-900/50"
                  : "text-emerald-700 bg-emerald-50/80 border-emerald-100/70"
              )}>
                {student.role}
              </span>
              <span className={cn(
                "text-[11px] font-mono font-medium truncate",
                mode === 'dark' ? "text-slate-400" : "text-slate-600"
              )} title={student.studentId}>
                {student.studentId}
              </span>
            </div>
            <span className={cn(
              "text-[11px] truncate mt-0.5",
              mode === 'dark' ? "text-slate-400" : "text-slate-600"
            )} title={student.email}>
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
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[12px] text-[12px] font-medium transition-all duration-150",
              mode === 'dark'
                ? "border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-red-400 hover:bg-red-950/40 hover:border-red-900/50"
                : "border border-slate-200/60 bg-white/50 backdrop-blur-sm text-slate-600 hover:text-red-600 hover:bg-red-50/60 hover:border-red-100"
            )}
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
      {/* Desktop Floating Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed top-4 left-4 bottom-4 rounded-[24px] z-50 overflow-hidden group transition-[width,background-color,border-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]',
          isCollapsed ? 'w-[76px] hover:w-[260px]' : 'w-[260px]',
          mode === 'minimal' && 'bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
          mode === 'glass' && 'bg-white/78 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)] border border-white/70 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]',
          mode === 'dark' && 'bg-slate-950/80 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)] border border-slate-900/85 shadow-[0_4px_24px_rgba(0,0,0,0.40)]'
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
                <span className={cn(
                  "text-[15px] font-semibold leading-tight",
                  mode === 'dark' ? "text-white" : "text-slate-900"
                )}>SMS Registry</span>
                <span className={cn(
                  "text-[12px] font-semibold leading-tight mt-0.5",
                  mode === 'dark' ? "text-emerald-400" : "text-emerald-600"
                )}>Student Portal</span>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'p-1.5 rounded-[8px] transition-all duration-200 hidden md:block',
                mode === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-white/60 text-slate-600 hover:text-slate-700',
                isCollapsed && 'rotate-180 opacity-0 group-hover:opacity-100'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className={cn(
            'mx-4 h-px transition-opacity duration-200',
            mode === 'dark' ? 'bg-slate-800/60' : 'bg-slate-200/60',
            isCollapsed && 'opacity-0 group-hover:opacity-100'
          )} />

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden no-scrollbar">
            <div className={cn(
              'px-3 mb-3 transition-opacity duration-200 whitespace-nowrap h-5 flex items-center',
              isCollapsed && 'opacity-0 group-hover:opacity-100'
            )}>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-[0.10em]",
                mode === 'dark' ? "text-slate-400" : "text-slate-600"
              )}>
                My Account
              </span>
            </div>
            {renderNavItems()}
          </nav>

          {/* Spacer / Divider */}
          <div className="px-3 pb-4">
            <div className={cn(
              'h-px mx-1 mb-3 transition-opacity duration-200',
              mode === 'dark' ? 'bg-slate-800/60' : 'bg-slate-200/60',
              isCollapsed && 'opacity-0 group-hover:opacity-100'
            )} />
          </div>

          {/* Theme Switcher */}
          <div className={cn(
            'px-4 mb-3 transition-opacity duration-200 flex flex-col gap-1.5',
            isCollapsed && 'opacity-0 group-hover:opacity-100'
          )}>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-[0.10em] px-1",
              mode === 'dark' ? "text-slate-400" : "text-slate-500"
            )}>
              Sidebar Mode
            </span>
            <div className={cn(
              "grid grid-cols-3 gap-1 p-1 rounded-xl",
              mode === 'dark' ? "bg-slate-900/60 border border-slate-800/40" : "bg-slate-100/80 border border-slate-200/50"
            )}>
              <button
                type="button"
                onClick={() => handleModeChange('minimal')}
                className={cn(
                  "text-[11px] font-medium py-1 px-1 rounded-lg transition-all text-center",
                  mode === 'minimal'
                    ? "bg-white text-slate-900 shadow-sm"
                    : (mode === 'dark' ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900")
                )}
              >
                Min
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('glass')}
                className={cn(
                  "text-[11px] font-medium py-1 px-1 rounded-lg transition-all text-center",
                  mode === 'glass'
                    ? "bg-white text-slate-900 shadow-sm"
                    : (mode === 'dark' ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900")
                )}
              >
                Glass
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('dark')}
                className={cn(
                  "text-[11px] font-medium py-1 px-1 rounded-lg transition-all text-center",
                  mode === 'dark'
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Dark
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          {student && (
            <div className={cn(
              'flex-shrink-0 mx-3 mb-3 transition-all duration-300 overflow-hidden',
              'p-3 rounded-[18px]',
              mode === 'dark'
                ? 'bg-slate-900/50 border border-slate-800/60 shadow-none'
                : 'bg-white/50 backdrop-blur-sm border border-white/70 shadow-sm',
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
          <div className={cn(
            'relative flex flex-col w-[280px] h-full shadow-[4px_0_24px_rgba(15,23,42,0.06)] animate-in slide-in-from-left duration-200',
            mode === 'minimal' && 'bg-white',
            mode === 'glass' && 'bg-white/90 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)]',
            mode === 'dark' && 'bg-slate-950/90 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)] text-white'
          )}>
            {/* Mobile header */}
            <div className={cn(
              "flex items-center justify-between h-[72px] px-5 border-b",
              mode === 'dark' ? "border-slate-800/60" : "border-slate-200/60"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-900 rounded-[12px] flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className={cn("text-[15px] font-semibold leading-tight", mode === 'dark' ? "text-white" : "text-slate-900")}>SMS Registry</span>
                  <span className={cn("text-[12px] font-semibold leading-tight mt-0.5", mode === 'dark' ? "text-emerald-400" : "text-emerald-600")}>Student Portal</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "p-2 -mr-1 rounded-[8px] transition-colors",
                  mode === 'dark' ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-700 hover:bg-white/60"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
              <div className="px-3 mb-3 h-5 flex items-center">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.10em]",
                  mode === 'dark' ? "text-slate-400" : "text-slate-600"
                )}>
                  My Account
                </span>
              </div>
              {renderNavItems(true)}
            </nav>

            {/* Mobile user card */}
            {student && (
              <div className={cn(
                "flex-shrink-0 mx-3 mb-4 p-3 rounded-[18px]",
                mode === 'dark' ? "bg-slate-900/50 border border-slate-800/60" : "bg-slate-50/80 border border-slate-200/60"
              )}>
                <UserCard minimal />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Mobile Bottom Navigation Bar with Glassmorphism */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none">
        <div className="mx-auto max-w-md w-full bg-white/75 backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border border-white/60 rounded-[20px] shadow-[0_8px_32px_rgba(15,23,42,0.08)] flex justify-around items-center p-2 pointer-events-auto">
          {/* Dashboard */}
          <Link
            href="/student/dashboard"
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-[12px] transition-all",
              pathname === "/student/dashboard" ? "text-emerald-600 bg-emerald-50/50" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Dashboard</span>
          </Link>
          
          {/* Profile */}
          <Link
            href="/student/profile"
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-[12px] transition-all",
              pathname.startsWith("/student/profile") ? "text-emerald-600 bg-emerald-50/50" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Profile</span>
          </Link>

          {/* Fees */}
          <Link
            href="/student/fees"
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-[12px] transition-all",
              pathname.startsWith("/student/fees") ? "text-emerald-600 bg-emerald-50/50" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Fees</span>
          </Link>

          {/* Results */}
          <Link
            href="/student/results"
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-[12px] transition-all",
              pathname.startsWith("/student/results") ? "text-emerald-600 bg-emerald-50/50" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Results</span>
          </Link>

          {/* Menu / More */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-[12px] transition-all text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">More</span>
          </button>
        </div>
      </div>
    </>
  )
}


