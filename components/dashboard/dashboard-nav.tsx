"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "lib/utils"
import { Button } from "components/ui/button"
import { useAuth } from "context/auth-context"
import { Home, Utensils, Camera, Activity, User, Settings, Menu, LogOut } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "components/ui/sheet"

export function DashboardNav() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Meals",
      href: "/dashboard/meals",
      icon: Utensils,
    },
    {
      title: "Scan Food",
      href: "/dashboard/scan",
      icon: Camera,
    },
    {
      title: "Activity",
      href: "/dashboard/activity",
      icon: Activity,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  // Mobile navigation
  const MobileNav = () => (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="grid gap-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted",
                pathname === item.href ? "bg-muted" : "transparent",
              )}
              onClick={() => setOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted justify-start"
            onClick={() => {
              signOut()
              setOpen(false)
            }}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Desktop navigation
  const DesktopNav = () => (
    <nav className="hidden md:grid items-start px-2 py-4 md:px-4 lg:px-6 border-r">
      <div className="grid gap-1 pt-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted",
              pathname === item.href ? "bg-muted" : "transparent",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        ))}
        <Button
          variant="ghost"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted justify-start"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </nav>
  )

  // Mobile bottom navigation
  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-background border-t md:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-md p-2 text-xs",
              pathname === item.href ? "bg-muted" : "transparent",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <MobileNav />
      <DesktopNav />
      <MobileBottomNav />
    </>
  )
}
