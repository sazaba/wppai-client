'use client'

import './globals.css'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { usePathname } from 'next/navigation'
import { Inter } from 'next/font/google'
import clsx from 'clsx'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // 1. DETECTAR RUTA DE LA LANDING
  const isOptimizedLanding = pathname === '/propuesta-dental'

  // 2. LÓGICA PARA OCULTAR NAVBAR Y FOOTER
  // Ocultamos si estamos en el dashboard O SI estamos en la propuesta dental
  const hideLayoutElements = pathname.startsWith('/dashboard') || isOptimizedLanding

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
      
      <body className={clsx(inter.className, "h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white")}>
        
        {/* --- FONDO GLOBAL (CONDICIONAL) --- */}
        {/* Se apaga en la landing para que Safari vuele, se mantiene en el resto para que se vea premium */}
        {!isOptimizedLanding && (
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundSize: '30px 30px' }}></div>
            </div>
        )}

        <AuthProvider>
          {/* Solo mostramos Navbar si NO estamos en dashboard NI en landing */}
          {!hideLayoutElements && <Navbar />}
          
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
          
          {/* Solo mostramos Footer si NO estamos en dashboard NI en landing */}
          {!hideLayoutElements && <Footer />}
        </AuthProvider>
      </body>
    </html>
  )
}