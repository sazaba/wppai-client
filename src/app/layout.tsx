import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

export const metadata: Metadata = {
  title: "AI WhatsApp Manager",
  description: "SaaS de automatización con IA para negocios que pautan en redes",
  openGraph: {
    title: "AI WhatsApp Manager",
    description: "SaaS de automatización con IA para negocios que pautan en redes",
    url: "https://www.wasaaa.com",
    siteName: "Wasaaa",
    images: [
      {
        url: "https://www.wasaaa.com/logo.webp", 
        width: 1200,
        height: 630,
        alt: "Logo de Wasaaa",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  metadataBase: new URL("https://www.wasaaa.com"),
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
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
