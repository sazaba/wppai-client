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
            <SheetContent side="left" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
  <div className="flex flex-col h-full justify-between">
    <div>
      <h2 className="text-xl font-bold mb-6 text-indigo-600">WppAI</h2>

      <nav className="flex flex-col gap-5 text-base font-medium">
        <Link href="#features" className="hover:text-indigo-600 transition-all">
          Funcionalidades
        </Link>
        <Link href="#pricing" className="hover:text-indigo-600 transition-all">
          Precios
        </Link>
        <Link href="#blog" className="hover:text-indigo-600 transition-all">
          Blog
        </Link>
      </nav>
    </div>

    <div className="flex flex-col gap-4 mt-10 border-t pt-6 border-gray-200 dark:border-gray-700">
      <Link href="/login">
        <Button
          variant="outline"
          className="w-full text-sm rounded-full border-gray-300 dark:border-gray-600"
        >
          Iniciar sesión
        </Button>
      </Link>
      <Link href="/register">
        <Button className="w-full text-sm rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow">
          <Sparkles className="mr-2 h-4 w-4" /> Probar gratis
        </Button>
      </Link>
    </div>
  </div>
</SheetContent>

          </Sheet>
        </div>
      </div>
    </header>
  )
}
