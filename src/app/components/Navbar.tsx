'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu, Sparkles, LogOut, ChevronRight, User } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import logo from '../images/Logo-Wasaaa.webp'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
// @ts-ignore
import confetti from 'canvas-confetti'

const navLinks = [
  { name: 'Funcionalidades', href: '/#features' },
  { name: 'Cómo funciona', href: '/#how' },
  { name: 'Precios', href: '/#pricing' },
  { name: 'FAQs', href: '/#faqs' },
  { name: 'Contacto', href: '/#contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { empresa, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isDarkPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/delete-my-data'

  useEffect(() => {
    // THROTTLE: Evita que el evento se dispare cientos de veces por segundo en móvil
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20)
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true }) // passive true mejora rendimiento
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (showLogoutModal) {
      const duration = 2.5 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#ec4899'] })
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#ec4899'] })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()

      const timeout = setTimeout(() => {
        logout()
        router.push('/')
        setShowLogoutModal(false)
      }, 2500)
      return () => clearTimeout(timeout)
    }
  }, [showLogoutModal, logout, router])

  const textColorClass = isScrolled 
    ? "text-gray-600 dark:text-gray-300" 
    : isDarkPage 
      ? "text-white/90 hover:text-white" 
      : "text-gray-600 dark:text-gray-300"

  const logoTextClass = isScrolled
    ? "text-gray-900 dark:text-white"
    : isDarkPage
      ? "text-white"
      : "text-gray-900 dark:text-white"

  return (
    <>
      <header
        className={clsx(
          'fixed w-full top-0 z-50 transition-colors duration-300 ease-in-out border-b',
          // OPTIMIZACIÓN: Usar bg-opacity sólido en móvil, blur solo en desktop
          isScrolled
            ? 'bg-white/95 dark:bg-black/95 md:bg-white/70 md:dark:bg-black/70 md:backdrop-blur-xl border-gray-200/50 dark:border-white/10 shadow-sm'
            : 'bg-transparent border-transparent py-2'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="relative group z-50 flex items-center gap-3">
            <div className="relative">
                {/* OPTIMIZACIÓN: Ocultar blur decorativo en móvil */}
                <div className="hidden md:block absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image
                src={logo}
                alt="Wasaaa Logo"
                width={80} 
                height={80}
                className="relative h-14 w-14 md:h-16 md:w-16 object-contain transition-transform duration-300 group-hover:scale-105"
                priority // Cargar logo rápido
                />
            </div>
            <span className={clsx("font-bold text-2xl tracking-tight block transition-colors", logoTextClass)}>
                Wasaaa
            </span>
          </Link>

          {/* Navegación Desktop */}
          <nav className={clsx(
              "hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full border transition-all",
              isScrolled ? "bg-white/5 dark:bg-white/5 border-transparent" : "border-transparent"
          )}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => {
                    if (pathname === '/' && link.href.startsWith('/#')) {
                        e.preventDefault()
                        const id = link.href.replace('/#', '')
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                    }
                }}
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
            {!loading && (
              <>
                {empresa ? (
                  <div className="flex items-center gap-3 animate-in fade-in duration-500">
                    <span className={clsx("text-sm font-medium hidden lg:block", textColorClass)}>
                      Hola, {empresa.nombre.split(' ')[0]}
                    </span>
                    <Link href="/dashboard">
                      <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowLogoutModal(true)}
                      className={clsx(
                          "rounded-full transition-colors",
                          isDarkPage && !isScrolled ? "text-white/70 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      )}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login">
                      <Button 
                        variant="ghost" 
                        className={clsx(
                            "rounded-full hover:bg-white/10",
                            isDarkPage && !isScrolled ? "text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                        )}
                      >
                        Ingresar
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="rounded-full px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 border border-white/10">
                        <Sparkles className="mr-2 h-4 w-4" /> Empezar Gratis
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Menú Móvil */}
          <div className="md:hidden">
            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={clsx(
                    "rounded-full w-10 h-10 shrink-0 hover:bg-white/10",
                    isDarkPage && !isScrolled ? "text-white" : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white"
                )}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              {/* SheetContent optimizado: sin blur pesado en fondo */}
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-white/10 p-0 shadow-2xl">
                <SheetHeader className="p-6 border-b border-gray-100 dark:border-white/5">
                    <SheetTitle className="flex items-center gap-3">
                        <Image src={logo} alt="logo" width={48} height={48} className="w-12 h-12 object-contain" />
                        <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">Wasaaa</span>
                    </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col h-[calc(100vh-80px)] justify-between p-6 overflow-y-auto">
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link, i) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={(e) => {
                             if (pathname === '/' && link.href.startsWith('/#')) {
                                e.preventDefault()
                                const id = link.href.replace('/#', '')
                                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                            }
                            setOpenSheet(false)
                        }}
                        className="flex items-center justify-between p-3 rounded-xl text-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                      >
                        {link.name}
                        <ChevronRight className="h-4 w-4 opacity-30" />
                      </Link>
                    ))}
                    <div className="my-4">
                        <div className="h-px bg-gray-100 dark:bg-white/5 mb-4" />
                        <Link href="/politica" onClick={() => setOpenSheet(false)} className="block text-sm text-muted-foreground px-3 mb-2">Privacidad</Link>
                        <Link href="/terminos" onClick={() => setOpenSheet(false)} className="block text-sm text-muted-foreground px-3">Términos</Link>
                    </div>
                  </nav>

                  <div className="flex flex-col gap-3 mt-4">
                    {!loading && empresa ? (
                        <>
                            <div className="flex items-center gap-3 px-3 mb-2">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{empresa.nombre}</span>
                                    <span className="text-xs text-muted-foreground">Plan Activo</span>
                                </div>
                            </div>
                            <Link href="/dashboard" onClick={() => setOpenSheet(false)}>
                                <Button className="w-full rounded-xl h-12 bg-indigo-600 text-white font-medium">Ir al Dashboard</Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                onClick={() => { setOpenSheet(false); setShowLogoutModal(true); }}
                                className="w-full rounded-xl h-12 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                Cerrar Sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setOpenSheet(false)}>
                                <Button variant="outline" className="w-full rounded-xl h-12 border-gray-200 dark:border-white/10">Iniciar sesión</Button>
                            </Link>
                            <Link href="/register" onClick={() => setOpenSheet(false)}>
                                <Button className="w-full rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 text-white">Probar gratis</Button>
                            </Link>
                        </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Modal Logout (Sin backdrop-blur pesado en móvil) */}
      <AnimatePresence>
        {showLogoutModal && (
          <Dialog open={showLogoutModal} onClose={() => {}} className="relative z-[100]">
            <motion.div
              className="fixed inset-0 bg-black/80 md:bg-black/60 md:backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel as={motion.div}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl border border-gray-100 dark:border-white/10 text-center overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="h-16 w-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ¡Hasta pronto!
                    </Dialog.Title>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    Tu sesión ha finalizado correctamente.<br/>
                    Gracias por usar <span className="font-semibold text-indigo-500">Wasaaa</span>.
                    </p>
                    <div className="h-1 w-16 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-indigo-500"
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