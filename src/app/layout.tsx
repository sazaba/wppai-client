import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./context/AuthContext"

export const metadata: Metadata = {
  title: "AI WhatsApp Manager",
  description: "SaaS de automatización con IA para negocios que pautan en redes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
      <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
