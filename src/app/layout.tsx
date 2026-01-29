import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import clsx from 'clsx'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap', 
})

export const metadata: Metadata = {
  title: 'AI WhatsApp Manager',
  description: 'SaaS de automatización con IA para negocios que pautan en redes',
  metadataBase: new URL('https://www.wasaaa.com'),
  openGraph: {
    title: 'AI WhatsApp Manager',
    description: 'SaaS de automatización con IA para negocios que pautan en redes',
    url: 'https://www.wasaaa.com',
    siteName: 'Wasaaa',
    images: [{ url: '/logo.webp', width: 800, height: 600 }],
    type: 'website',
  },
  other: { 'fb:app_id': '1491280195185816' },
}

// CORRECCIÓN 1: Viewport amigable para accesibilidad (Google penaliza si bloqueas el zoom)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Permitir zoom mejora puntaje de accesibilidad
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className={clsx(inter.className, "h-full bg-[#050505] text-slate-200 antialiased selection:bg-indigo-500 selection:text-white")}>
        
        {/* CORRECCIÓN 2: Fondo CSS Puro (Sin divs múltiples ni blur pesado para Safari) */}
        <div 
          className="fixed inset-0 z-[-1] pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 0% 0%, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
              #050505
            `
          }}
        />
        {/* Textura sutil superpuesta */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] bg-[url('/grid-pattern.svg')] pointer-events-none" style={{ backgroundSize: '30px 30px' }} />

        <AuthProvider>
          <Navbar /> 
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}