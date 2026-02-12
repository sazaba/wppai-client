'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu, Sparkles, LogOut, ChevronRight, User, LayoutDashboard, X } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import logo from '../images/Logo-Wasaaa.webp'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'

// NOTA: Eliminamos el import estático de 'canvas-confetti' para que no bloquee la carga inicial.

const navLinks = [
  { name: 'Funcionalidades', href: '/#features' },
  { name: 'Cómo funciona', href: '/#how' },
  { name: 'Precios', href: '/#pricing' },
  { name: 'FAQs', href: '/#faqs' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  const [openSheet, setOpenSheet] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { empresa, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Lista de rutas donde el navbar debe comportarse como "página oscura" (texto blanco inicial)
  const darkRoutes = ['/', '/login', '/register', '/forgot-password', '/delete-my-data', '/propuesta-dental'];
  const isDarkPage = darkRoutes.includes(pathname || ''); 

  // --- 1. Optimización de Scroll (Performance en Móviles) ---
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(currentScrollY > 20);
          
          // Lógica de esconder navbar al bajar (si scrolleamos > 100px)
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // --- 2. Manejo de Logout con Lazy Load (Ahorro de JS inicial) ---
  const handleLogoutFlow = useCallback(async () => {
    // A. Mostrar modal inmediatamente para feedback visual rápido
    setShowLogoutModal(true)

    // B. Importar la librería pesada SOLO cuando se necesita
    const confetti = (await import('canvas-confetti')).default;

    // C. Ejecutar animación
    const duration = 2.5 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#06b6d4', '#3b82f6'] }) // Cyan/Blue colors
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#06b6d4', '#3b82f6'] })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    // D. Logout real y redirección
    const timeout = setTimeout(() => {
      logout()
      router.push('/')
      setShowLogoutModal(false)
    }, 2500)
    
    return () => clearTimeout(timeout)
  }, [logout, router]);

  // --- 3. Lógica de Colores Dinámicos (MODO DARK PREMIUM) ---
  // Siempre tendemos a blanco/gris claro para asegurar legibilidad en fondos oscuros
  const textColorClass = isScrolled 
    ? "text-slate-300 hover:text-cyan-400" 
    : "text-slate-200 hover:text-white"

  return (
    <>
      <header
        className={clsx(
          'fixed w-full top-0 z-50 transition-all duration-300 ease-in-out border-b',
          isScrolled
            ? 'bg-[#050505]/80 backdrop-blur-xl border-white/10 shadow-lg shadow-black/20'
            : 'bg-transparent border-transparent py-4',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="relative group z-50 flex items-center gap-3">
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image
                  src={logo}
                  alt="Wasaaa Logo"
                  width={80} 
                  height={80}
                  priority // Importante para LCP
                  className="relative h-10 w-10 md:h-12 md:w-12 object-contain transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <span className="font-bold text-xl md:text-2xl tracking-tight block text-white transition-colors">
                Wasaaa
            </span>
          </Link>

          {/* Navegación Desktop */}
          <nav className={clsx(
              "hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full border transition-all",
              isScrolled ? "bg-white/5 border-white/5" : "border-transparent"
          )}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                    "px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/10",
                    textColorClass
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Acciones Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {/* SKELETON LOADING */}
            {loading ? (
               <div className="w-24 h-10 bg-white/5 rounded-full animate-pulse" />
            ) : (
              <>
                {empresa ? (
                  <div className="flex items-center gap-3 animate-in fade-in duration-500">
                    <span className="text-sm font-medium text-slate-300 hidden lg:block">
                      Hola, {empresa.nombre?.split(' ')[0]}
                    </span>
                    <Link href="/dashboard">
                      <Button className="rounded-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 border border-white/10">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogoutFlow}
                      aria-label="Cerrar sesión"
                      className="rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login">
                      <Button 
                        variant="ghost" 
                        className="rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                      >
                        Ingresar
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="rounded-full px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 border border-white/10 font-bold">
                        <Sparkles className="mr-2 h-4 w-4" /> Probar Gratis
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Menú Móvil (Premium Dark Mode) */}
          <div className="md:hidden">
            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Abrir menú"
                  className="rounded-full w-10 h-10 shrink-0 text-slate-200 hover:bg-white/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 p-0 text-slate-200">
                
                {/* Fondo decorativo interno */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />

                <SheetHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between relative z-10">
                    <SheetTitle className="flex items-center gap-3">
                        <Image src={logo} alt="logo" width={40} height={40} className="w-10 h-10 object-contain" />
                        <span className="font-bold text-xl tracking-tight text-white">Wasaaa</span>
                    </SheetTitle>
                    {/* El botón de cerrar lo maneja el componente Sheet por defecto, pero podemos personalizarlo si quisieras */}
                </SheetHeader>
                
                <div className="flex flex-col h-[calc(100vh-80px)] justify-between p-6 overflow-y-auto relative z-10">
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link, i) => (
                      <motion.a
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (i * 0.05), duration: 0.3 }}
                        href={link.href}
                        onClick={() => setOpenSheet(false)}
                        className="group flex items-center justify-between p-4 rounded-2xl text-lg font-medium text-slate-300 hover:bg-white/5 hover:text-cyan-400 transition-all border border-transparent hover:border-white/5"
                      >
                        {link.name}
                        <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-100 group-hover:text-cyan-400 transition-all" />
                      </motion.a>
                    ))}
                  </nav>

                  <div className="flex flex-col gap-4 mt-6">
                    {loading ? (
                        <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse" />
                    ) : empresa ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">{empresa.nombre}</span>
                                    <span className="text-xs text-slate-500">Plan Pro</span>
                                </div>
                            </div>
                            <Link href="/dashboard" onClick={() => setOpenSheet(false)}>
                                <Button className="w-full rounded-xl h-12 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg shadow-cyan-900/20 border border-white/10">
                                    <LayoutDashboard className="mr-2 h-4 w-4" /> Ir al Dashboard
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                onClick={() => { setOpenSheet(false); handleLogoutFlow(); }}
                                className="w-full rounded-xl h-12 border-red-900/30 bg-red-950/10 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-900/50"
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/login" onClick={() => setOpenSheet(false)}>
                                <Button variant="outline" className="w-full rounded-xl h-12 border-white/10 bg-white/5 text-white hover:bg-white/10">
                                    Iniciar sesión
                                </Button>
                            </Link>
                            <Link href="/register" onClick={() => setOpenSheet(false)}>
                                <Button className="w-full rounded-xl h-12 bg-white text-black font-bold hover:bg-slate-200">
                                    Probar gratis
                                </Button>
                            </Link>
                        </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Modal Logout (Diseño Glass Dark) */}
      <AnimatePresence>
        {showLogoutModal && (
          <Dialog open={showLogoutModal} onClose={() => {}} className="relative z-[100]">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel as={motion.div}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-sm rounded-[2rem] bg-[#111] p-8 shadow-2xl border border-white/10 text-center overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="h-16 w-16 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <Dialog.Title className="text-2xl font-bold text-white mb-2">
                    ¡Hasta pronto!
                    </Dialog.Title>
                    <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                    Tu sesión ha finalizado correctamente.<br/>
                    Gracias por usar <span className="font-bold text-cyan-400">Wasaaa</span>.
                    </p>
                    <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden mx-auto">
                        <motion.div 
                            className="h-full bg-cyan-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "linear" }}
                        />
                    </div>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}