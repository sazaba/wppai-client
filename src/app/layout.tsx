'use client'

import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { usePathname } from "next/navigation"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hideNavbar = pathname.startsWith('/dashboard')

  return (
    <html lang="es">
      <head>
        <meta property="fb:app_id" content="1491280195185816" />
        <meta property="og:title" content="AI WhatsApp Manager" />
        <meta property="og:description" content="SaaS de automatización con IA para negocios que pautan en redes" />
        <meta property="og:image" content="https://www.wasaaa.com/logo.webp" />
        <meta property="og:url" content="https://www.wasaaa.com" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/logo.webp" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <AuthProvider>
          {!hideNavbar && <Navbar />}
          <main>{children}</main>
          {!hideNavbar && <Footer />}
        </AuthProvider>
      </body>
    </html>
  )
}
