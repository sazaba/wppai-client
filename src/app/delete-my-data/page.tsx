'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function DeleteMyData() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto text-center"
      >
        <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">
          Solicitud de Eliminación de Datos
        </h1>

        <p className="text-lg leading-relaxed mb-6">
          Si eres usuario de <strong>Wasaaa</strong> y deseas eliminar tu información personal
          asociada a la plataforma, escríbenos a:
        </p>

        <p className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-4">
          contacto@wasaaa.com
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Por favor incluye el nombre de tu empresa y el número de WhatsApp asociado.
          Procesaremos tu solicitud en un máximo de <strong>5 días hábiles</strong>.
        </p>

        <Link
          href="/"
          className="mt-10 inline-block text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          ← Volver al inicio
        </Link>
      </motion.div>
    </main>
  )
}
