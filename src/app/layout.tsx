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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b', // Forzamos oscuro para evitar flash blanco
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className={clsx(inter.className, "h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white")}>
        
        {/* --- FONDO OPTIMIZADO (ESTÁTICO) --- */}
        {/* Eliminamos 'animate-pulse-slow' y usamos 'transform-gpu' para que la tarjeta gráfica lo pinte una sola vez */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transform-gpu translate-z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-screen" />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] mix-blend-screen" />
            <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundSize: '30px 30px' }}></div>
        </div>

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