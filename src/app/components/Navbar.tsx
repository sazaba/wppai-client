'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import logo from '../images/Logo-Wasaaa.webp'
import Image from 'next/image'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)

  const { empresa } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href')
    if (href?.startsWith('#')) {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setOpenSheet(false)
  }

  return (
    <header
      className={clsx(
        'w-full top-0 z-100 sticky transition-all duration-300',
        isScrolled ? 'shadow-md bg-white dark:bg-gray-900 border-b' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="inline-block">
  <Image
    src={logo}  
    alt="logo"
    width={60}
    height={60}
    className="h-auto w-auto"
  />
</Link>


        {/* Navegación - Escritorio */}
        <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
          <a href="#features" onClick={handleNavClick} className="hover:text-indigo-600 transition">Funcionalidades</a>
          <a href="#how" onClick={handleNavClick} className="hover:text-indigo-600 transition">Cómo funciona</a>
          <a href="#pricing" onClick={handleNavClick} className="hover:text-indigo-600 transition">Precios</a>
          <a href="#faqs" onClick={handleNavClick} className="hover:text-indigo-600 transition">FAQs</a>
          <a href="#contact" onClick={handleNavClick} className="hover:text-indigo-600 transition">Contacto</a>
          <a href="/politica" className="hover:text-indigo-600 transition">Privacidad</a>
          <a href="/terminos" className="hover:text-indigo-600 transition">Términos</a>

        </nav>

        {/* Botones - Escritorio */}
        <div className="hidden md:flex items-center gap-3">
          {empresa ? (
            <>
              <span className="text-sm text-muted-foreground">Bienvenid@ <strong>{empresa.nombre}</strong></span>
              <Link href="/dashboard">
                <Button className="rounded-full px-6 text-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                  Ir al dashboard
                </Button>
              </Link>
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

        {/* Hamburguesa - Móvil */}
<div className="md:hidden">
  <Sheet open={openSheet} onOpenChange={setOpenSheet}>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
      </Button>
    </SheetTrigger>

    <SheetContent side="left" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="flex flex-col h-full justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6 text-indigo-600">WppAI</h2>
          {empresa && (
            <p className="text-sm mb-4 text-muted-foreground">Bienvenid@ <strong>{empresa.nombre}</strong></p>
          )}
          <nav className="flex flex-col gap-5 text-base font-medium">
            <a href="#features" onClick={handleNavClick} className="hover:text-indigo-600 transition-all">Funcionalidades</a>
            <a href="#how" onClick={handleNavClick} className="hover:text-indigo-600 transition-all">Cómo funciona</a>
            <a href="#pricing" onClick={handleNavClick} className="hover:text-indigo-600 transition-all">Precios</a>
            <a href="#faqs" onClick={handleNavClick} className="hover:text-indigo-600 transition-all">FAQs</a>
            <a href="#contact" onClick={handleNavClick} className="hover:text-indigo-600 transition-all">Contacto</a>
            <a href="/politica" onClick={() => setOpenSheet(false)} className="hover:text-indigo-600 transition-all">Privacidad</a>
            <a href="/terminos" className="hover:text-indigo-600 transition">Términos</a>

            {empresa && (
              <Link href="/dashboard" onClick={() => setOpenSheet(false)}>
                <Button className="mt-6 w-full text-sm rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Ir al dashboard
                </Button>
              </Link>
            )}
          </nav>
        </div>

        {!empresa && (
          <div className="flex flex-col gap-4 mt-10 border-t pt-6 border-gray-200 dark:border-gray-700">
            <Link href="/login" onClick={() => setOpenSheet(false)}>
              <Button variant="outline" className="w-full text-sm rounded-full border-gray-300 dark:border-gray-600">
                Iniciar sesión
              </Button>
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
  )
}
