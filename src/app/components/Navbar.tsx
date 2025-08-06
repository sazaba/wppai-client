'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Sparkles, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import logo from '../images/Logo-Wasaaa.webp'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
// @ts-ignore
import confetti from 'canvas-confetti'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { empresa, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 🎉 Confeti y cierre automático
  useEffect(() => {
    if (showLogoutModal) {
      const duration = 2 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } })
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } })
        confetti({ particleCount: 4, spread: 360, origin: { x: 0.5, y: 0 } })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()

      // Auto cerrar y redirigir después de 2,5s
      const timeout = setTimeout(() => {
        logout()
        router.push('/')
        setShowLogoutModal(false)
      }, 2500)

      return () => clearTimeout(timeout)
    }
  }, [showLogoutModal, logout, router])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href')
    if (href?.startsWith('#')) {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    }
    setOpenSheet(false)
  }

  return (
    <>
      <header
        className={clsx(
          'w-full top-0 z-50 sticky transition-all duration-300',
          isScrolled ? 'shadow-md bg-white dark:bg-gray-900 border-b' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-0 md:py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <Image
              src={logo}
              alt="logo"
              width={48}
              height={48}
              className="h-16 w-16 md:h-[60px] md:w-[60px]"
            />
          </Link>

          {/* Navegación - Escritorio */}
          <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <a href="#features" onClick={handleNavClick}>Funcionalidades</a>
            <a href="#how" onClick={handleNavClick}>Cómo funciona</a>
            <a href="#pricing" onClick={handleNavClick}>Precios</a>
            <a href="#faqs" onClick={handleNavClick}>FAQs</a>
            <a href="#contact" onClick={handleNavClick}>Contacto</a>
            <a href="/politica">Privacidad</a>
            <a href="/terminos">Términos</a>
          </nav>

          {/* Botones - Escritorio */}
          {!loading && (
            <div className="hidden md:flex items-center gap-3">
              {empresa ? (
                <>
                  <span className="text-sm text-muted-foreground">Bienvenid@ <strong>{empresa.nombre}</strong></span>
                  <Link href="/dashboard">
                    <Button className="rounded-full px-6 text-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                      Ir al dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setShowLogoutModal(true)}
                    className="rounded-full px-6 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:from-red-600 hover:to-pink-600 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="rounded-full px-6 text-sm">Iniciar sesión</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-full px-8 text-sm bg-indigo-700 hover:bg-indigo-800 text-white">
                      <Sparkles className="mr-2 h-4 w-4" /> Probar gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Hamburguesa - Móvil */}
          <div className="md:hidden">
            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <Image src={logo} alt="logo" width={48} height={48} className="h-16 w-16" />
                    {!loading && empresa && (
                      <p className="text-sm mb-4 text-muted-foreground">Bienvenid@ <strong>{empresa.nombre}</strong></p>
                    )}
                    <nav className="flex flex-col gap-5 text-base font-medium">
                      <a href="#features" onClick={handleNavClick}>Funcionalidades</a>
                      <a href="#how" onClick={handleNavClick}>Cómo funciona</a>
                      <a href="#pricing" onClick={handleNavClick}>Precios</a>
                      <a href="#faqs" onClick={handleNavClick}>FAQs</a>
                      <a href="#contact" onClick={handleNavClick}>Contacto</a>
                      <a href="/politica">Privacidad</a>
                      <a href="/terminos">Términos</a>
                      {!loading && empresa && (
                        <>
                          <Link href="/dashboard" onClick={() => setOpenSheet(false)}>
                            <Button className="mt-6 w-full text-sm rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                              Ir al dashboard
                            </Button>
                          </Link>
                          <Button
                            onClick={() => {
                              setOpenSheet(false)
                              setShowLogoutModal(true)
                            }}
                            className="mt-3 w-full text-sm rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                          >
                            <LogOut className="h-4 w-4 mr-1" /> Cerrar sesión
                          </Button>
                        </>
                      )}
                    </nav>
                  </div>
                  {!loading && !empresa && (
                    <div className="flex flex-col gap-4 mt-10 border-t pt-6">
                      <Link href="/login" onClick={() => setOpenSheet(false)}>
                        <Button variant="outline" className="w-full text-sm rounded-full">Iniciar sesión</Button>
                      </Link>
                      <Link href="/register" onClick={() => setOpenSheet(false)}>
                        <Button className="w-full text-sm rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow">
                          <Sparkles className="mr-2 h-4 w-4" /> Probar gratis
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Modal premium de logout */}
      <AnimatePresence>
        {showLogoutModal && (
          <Dialog open={showLogoutModal} onClose={() => setShowLogoutModal(false)} className="relative z-50">
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl max-w-md w-full text-center"
              >
                <motion.h2 className="text-2xl font-bold mb-2">¡Hasta pronto! 👋</motion.h2>
                <motion.p className="text-gray-600 dark:text-gray-300 mb-4">
                  Tu sesión se ha cerrado correctamente.<br />  
                  Te esperamos pronto en Wasaaa 🚀
                </motion.p>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
