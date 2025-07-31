// components/Footer.tsx
'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-zinc-700 py-6 px-4 text-sm text-center text-gray-600 dark:text-gray-400">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Wasaaa · Todos los derechos reservados</p>
        <div className="flex flex-wrap gap-4 justify-center md:justify-end">
          <Link href="/terminos" className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
            Términos de uso
          </Link>
          <Link href="/politica" className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
            Política de privacidad
          </Link>
          <Link href="/delete-my-data" className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
            Eliminar mis datos
          </Link>
        </div>
      </div>
    </footer>
  )
}
