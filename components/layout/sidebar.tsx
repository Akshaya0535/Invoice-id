"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, Users, Home, Settings, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const [session, setSession] = useState<{ username: string; role: string } | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        const data = await response.json()
        setSession(data.user)
      } catch (error) {
        console.error("Session check failed:", error)
      }
    }

    checkSession()
  }, [])

  const baseNavItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "Invoices",
      href: "/invoices",
      icon: FileText,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  // Add admin-only navigation items
  const navItems =
    session?.role === "admin"
      ? [
          ...baseNavItems,
          {
            name: "User Management",
            href: "/users",
            icon: UserPlus,
          },
        ]
      : baseNavItems

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">Invoice System</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive ? "bg-secondary" : "")}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
