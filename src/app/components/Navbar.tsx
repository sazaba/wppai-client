'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
          WppAI
        </Link>

        {/* Navegación */}
        <nav className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
          <Link href="#features" className="hover:text-indigo-600 transition">Funcionalidades</Link>
          <Link href="#pricing" className="hover:text-indigo-600 transition">Precios</Link>
          <Link href="#blog" className="hover:text-indigo-600 transition">Blog</Link>
        </nav>

        {/* Botones */}
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" className="rounded-full px-6 text-sm">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-8 text-sm bg-indigo-700 hover:bg-indigo-800 text-white">
              <Sparkles className="mr-2 h-4 w-4" /> Probar gratis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
