import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import clsx from 'clsx'

// Carga de fuente optimizada
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap', // Importante para First Contentful Paint (FCP)
})

// Metadatos optimizados (Reemplaza las etiquetas <head> manuales)
export const metadata: Metadata = {
  title: 'AI WhatsApp Manager',
  description: 'SaaS de automatización con IA para negocios que pautan en redes',
  metadataBase: new URL('https://www.wasaaa.com'),
  openGraph: {
    title: 'AI WhatsApp Manager',
    description: 'SaaS de automatización con IA para negocios que pautan en redes',
    url: 'https://www.wasaaa.com',
    siteName: 'Wasaaa',
    images: [
      {
        url: '/logo.webp', // Asegúrate de que la ruta sea correcta en public
        width: 800,
        height: 600,
      },
    ],
    type: 'website',
  },
  other: {
    'fb:app_id': '1491280195185816',
  },
}

// Configuración de Viewport para móvil
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' }, // zinc-50
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },  // zinc-950
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Nota: En layout server-side no podemos usar hooks como usePathname directamente 
  // para condicionales de renderizado si queremos mantenerlo como Server Component.
  // Para ocultar el navbar en dashboard, es mejor hacerlo via CSS o en un componente cliente interno.
  // Asumiremos que el Navbar maneja su propia visibilidad o que este layout es 'use client' si es estrictamente necesario.
  // Si este archivo DEBE ser 'use client' por el AuthProvider, mantenlo así.

  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className={clsx(inter.className, "h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white")}>
        
        {/* --- FONDO AMBIENTAL (Optimizado con pointer-events-none para no bloquear clicks) --- */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none translate-z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow will-change-transform" />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen will-change-transform" />
            <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen will-change-transform" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundSize: '30px 30px' }}></div>
        </div>

        <AuthProvider>
          {/* Navbar debe manejar internamente si se muestra o no según la ruta si es un Client Component */}
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