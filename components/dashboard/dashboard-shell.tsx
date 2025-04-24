import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}
      {/* Add padding at the bottom for mobile navigation */}
      <div className="pb-16 md:pb-0"></div>
    </div>
  )
}

