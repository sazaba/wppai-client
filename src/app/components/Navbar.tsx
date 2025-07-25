'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Sparkles } from 'lucide-react'
import clsx from 'clsx'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  // Scroll effect
  if (typeof window !== 'undefined') {
    window.onscroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
  }

  return (
    <header
      className={clsx(
        'w-full top-0 z-50 sticky transition-all duration-300',
        isScrolled ? 'shadow-md bg-white dark:bg-gray-900 border-b' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
          WppAI
        </Link>

        {/* Navegación - Escritorio */}
        <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
          <Link href="#features" className="hover:text-indigo-600 transition">Funcionalidades</Link>
          <Link href="#pricing" className="hover:text-indigo-600 transition">Precios</Link>
          <Link href="#blog" className="hover:text-indigo-600 transition">Blog</Link>
        </nav>

        {/* Botones - Escritorio */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" className="rounded-full px-6 text-sm">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-8 text-sm bg-indigo-700 hover:bg-indigo-800 text-white">
              <Sparkles className="mr-2 h-4 w-4" /> Probar gratis
            </Button>
          </Link>
        </div>

        {/* Hamburguesa - Móvil */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <nav className="flex flex-col gap-4 mt-8 text-base">
                <Link href="#features">Funcionalidades</Link>
                <Link href="#pricing">Precios</Link>
                <Link href="#blog">Blog</Link>
                <hr className="my-4 border-gray-300 dark:border-gray-700" />
                <Link href="/login" className="text-indigo-600 font-medium">Iniciar sesión</Link>
                <Link href="/register" className="bg-indigo-600 text-white py-2 px-4 rounded-full text-center">Probar gratis</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
