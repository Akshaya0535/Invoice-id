"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")
      const data = await response.json()
      setSession(data.user)
    } catch (error) {
      console.error("Session check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setSession(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // If we're on the login page or loading, just show the children
  if (pathname === "/login" || isLoading) {
    return <>{children}</>
  }

  // For authenticated pages, show the full layout with sidebar
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Invoice System</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm">
              {session ? (
                <div className="flex items-center gap-2">
                  <span>
                    {session.username} ({session.role})
                  </span>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
