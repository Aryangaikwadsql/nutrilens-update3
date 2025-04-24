import type React from "react"
import { ThemeProvider } from "components/theme-provider"
import { Toaster } from "sonner"
import { AuthProvider } from "context/auth-context"
import { ProfileProvider } from "context/profile-context"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Footer } from "components/footer"

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Nutrilens - AI-Powered Nutrition Tracker",
  description: "Track your nutrition, steps, and health with AI-powered insights",
  manifest: "/manifest.json",
  generator: 'v0.dev'
}
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export const themeColor = [
  { media: "(prefers-color-scheme: light)", color: "white" },
  { media: "(prefers-color-scheme: dark)", color: "#09090b" }
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProfileProvider>
              <div className="flex items-center gap-2 p-4">
                <img
                  src="/nutrilens-logo.png"
                  alt="Nutrilens Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nutrilens</span>
              </div>
              {children}
              <div className="mt-12">
                <Footer />
              </div>
              <Toaster />
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
