'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  GraduationCap,
  Menu,
  X,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { logoutAction } from '@/app/(auth)/actions'

const navigation = [
  { label: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/staff/students', icon: Users },
  { label: 'Programmes', href: '/staff/programmes', icon: BookOpen },
  { label: 'Fees & Payments', href: '/staff/fees', icon: CreditCard },
  { label: 'Assessments', href: '/staff/assessments', icon: ClipboardList },
  { label: 'Submissions', href: '/staff/submissions', icon: FileText },
  { label: 'Results', href: '/staff/results', icon: BarChart3 },
]

interface StaffSidebarProps {
  user?: {
    email: string
    role: string
  }
}

export function StaffSidebar({ user }: StaffSidebarProps = {}) {
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

  const UserCard = ({ minimal = false }: { minimal?: boolean }) => {
    if (!user) return null
    const name = user.email.split('@')[0]
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
    
    return (
      <div className={cn(
        'flex flex-col gap-3 w-full',
        !minimal && isCollapsed && 'items-center'
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=e2e8f0`}
            alt={formattedName}
            className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white/80 shadow-[0_2px_8px_rgba(15,23,42,0.10)] flex-shrink-0 object-cover"
          />

          <div className={cn(
            'flex flex-col min-w-0 transition-opacity duration-200 delay-100',
            !minimal && isCollapsed && 'opacity-0 group-hover:opacity-100'
          )}>
            <span className="text-[13px] font-semibold text-slate-900 truncate" title={formattedName}>
              {formattedName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded-md border border-indigo-100/70 uppercase tracking-wider flex-shrink-0">
                {user.role}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 truncate mt-0.5" title={user.email}>
              {user.email}
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
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-[15px]">SMS Registry</span>
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
          'transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-50 overflow-hidden group',
          'hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]',
          isCollapsed ? 'w-[76px] hover:w-[260px]' : 'w-[260px]'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
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
                <span className="text-[12px] text-slate-700 font-medium leading-tight mt-0.5">Staff Portal</span>
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

          {/* Separator */}
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
                Registry
              </span>
            </div>

            {renderNavItems()}
          </nav>

          {/* Bottom Settings */}
          <div className="px-3 pb-4">
            <div className={cn(
              'h-px bg-slate-200/60 mx-1 mb-3 transition-opacity duration-200',
              isCollapsed && 'opacity-0 group-hover:opacity-100'
            )} />
            <Link
              href="/staff/settings"
              title={isCollapsed ? 'Settings' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[14px] font-medium transition-all duration-150 overflow-hidden',
                pathname === '/staff/settings'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white/55 hover:text-slate-900 hover:backdrop-blur-sm'
              )}
            >
              <Settings className={cn(
                'w-[18px] h-[18px] flex-shrink-0',
                pathname === '/staff/settings' ? 'text-white' : 'text-slate-600'
              )} />
              <span className={cn(
                'whitespace-nowrap transition-opacity duration-200',
                isCollapsed && 'opacity-0 group-hover:opacity-100'
              )}>
                Settings
              </span>
            </Link>
          </div>
          
          {/* User Profile Card */}
          {user && (
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <div className={[
            'relative flex flex-col w-[280px] h-full',
            'bg-white/90 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)]',
            'shadow-[4px_0_24px_rgba(15,23,42,0.06)]',
            'animate-in slide-in-from-left duration-200',
          ].join(' ')}>
            <div className="flex items-center justify-between h-[72px] px-5 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-900 rounded-[12px] flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[15px] font-semibold text-slate-900 leading-tight">SMS Registry</span>
                  <span className="text-[12px] text-slate-700 font-medium leading-tight mt-0.5">Staff Portal</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 -mr-1 text-slate-600 hover:text-slate-700 rounded-[8px] hover:bg-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
              <div className="px-3 mb-3 h-5 flex items-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.10em]">
                  Registry
                </span>
              </div>
              {renderNavItems(true)}
            </nav>

            <div className="px-3 pb-5">
              <div className="h-px bg-slate-200/60 mx-1 mb-3" />
              <Link
                href="/staff/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[14px] font-medium text-slate-600 hover:bg-white/55 hover:text-slate-900 transition-colors"
              >
                <Settings className="w-[18px] h-[18px] flex-shrink-0 text-slate-600" />
                <span>Settings</span>
              </Link>
            </div>
            
            {/* Mobile user card */}
            {user && (
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


