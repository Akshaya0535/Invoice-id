import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"
import { ThemeProvider } from "@/components/theme-provider"

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
  return (
    <html lang="en">
      <body>
      {/* <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
       </ThemeProvider> */}
          
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
