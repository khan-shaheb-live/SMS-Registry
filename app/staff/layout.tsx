import { requireStaffSession } from '@/lib/session'
import { StaffSidebar } from '@/components/layout/staff-sidebar'
import { TopNavbar } from '@/components/layout/top-navbar'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireStaffSession()

  return (
    <div className="flex min-h-screen">
      <StaffSidebar user={{ email: session.email, role: session.role }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:pl-[292px]">
        <TopNavbar session={session} />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-24 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
