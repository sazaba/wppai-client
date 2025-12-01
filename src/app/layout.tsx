'use client'

import './globals.css'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { usePathname } from 'next/navigation'
import { Inter } from 'next/font/google' // Importamos una fuente premium
import clsx from 'clsx'

// Usamos Inter o Plus Jakarta Sans para un look SaaS moderno
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNavbar = pathname.startsWith('/dashboard')

  return (
    <html lang="es" className="h-full scroll-smooth">
      <head>
        <meta property="fb:app_id" content="1491280195185816" />
        <meta property="og:title" content="AI WhatsApp Manager" />
        <meta property="og:description" content="SaaS de automatización con IA para negocios que pautan en redes" />
        <meta property="og:image" content="https://www.wasaaa.com/logo.webp" />
        <meta property="og:url" content="https://www.wasaaa.com" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/logo.webp" />
      </head>
      
      {/* CAMBIOS CLAVE:
        1. bg-zinc-50 dark:bg-zinc-950: Color base más rico que el blanco/negro puro.
        2. text-zinc-900 dark:text-zinc-100: Texto con alto contraste pero suave.
      */}
      <body className={clsx(inter.className, "h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white")}>
        
        {/* --- FONDO AMBIENTAL PREMIUM --- */}
        {/* Esto crea las luces moradas/azules detrás de todo el sitio */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Luz superior izquierda */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
            {/* Luz superior derecha */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
            {/* Luz inferior central */}
            <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
            
            {/* Patrón de Grid sutil para textura técnica */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundSize: '30px 30px' }}></div>
        </div>

        <AuthProvider>
          {!hideNavbar && <Navbar />}
          
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
          
          {!hideNavbar && <Footer />}
        </AuthProvider>
      </body>
    </html>
  )
}