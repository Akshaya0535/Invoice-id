"use client"
import type { Metadata } from "next"
import type React from "react"

import "./globals.css"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
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

  return (
    <html lang="en">
      <body>
        {children}
        {session && pathname !== "/login" && (
          <div className="mt-auto p-4 border-t">
            <div className="text-sm text-gray-600 mb-2">
              Logged in as: {session.username} ({session.role})
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
              Logout
            </Button>
          </div>
        )}
      </body>
    </html>
  )
}
