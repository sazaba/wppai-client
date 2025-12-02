'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function DeleteMyData() {
  return (
    // CAMBIO: pt-28 md:pt-32 para evitar colisión con Navbar
    <main className="min-h-screen bg-zinc-950 relative overflow-hidden pt-28 md:pt-32 pb-12 px-4 sm:px-6">
      
      {/* --- Luces de Fondo Ambientales --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto relative z-10"
      >
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-zinc-400 justify-center md:justify-start">
          <Link 
            href="/" 
            className="flex items-center gap-1 hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Inicio
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 font-medium">Eliminar Datos</span>
        </nav>

        {/* Tarjeta Glassmorphism Centralizada */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center">
            
            {/* Icono Principal */}
            <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-3xl mb-8 shadow-lg shadow-red-500/10 ring-1 ring-red-500/20">
                <TrashIcon className="w-12 h-12 text-red-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
                Solicitud de Eliminación de Datos
            </h1>

            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
                Lamentamos que quieras irte. Si eres usuario de <strong className="text-white">Wasaaa</strong> y deseas eliminar tu información personal y los datos de tu empresa asociados a la plataforma, puedes solicitarlo directamente a nuestro equipo.
            </p>

            {/* Caja de Instrucciones */}
            <div className="bg-zinc-800/50 border border-white/5 rounded-2xl p-6 mb-8 text-left">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-xs font-bold">1</span>
                    Envíanos un correo
                </h3>
                <div className="bg-black/30 rounded-xl p-4 flex items-center justify-between border border-white/5 mb-4 group cursor-pointer hover:border-indigo-500/30 transition-colors">
                    <code className="text-indigo-300 font-mono text-lg">contacto@wasaaa.com</code>
                    <a href="mailto:contacto@wasaaa.com" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors">
                        Enviar
                    </a>
                </div>

                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-xs font-bold">2</span>
                    ¿Qué debes incluir?
                </h3>
                <ul className="text-zinc-400 text-sm list-disc list-inside space-y-1 ml-1">
                    <li>Nombre de tu empresa registrada.</li>
                    <li>Número de WhatsApp conectado (Business API).</li>
                    <li>Correo electrónico de administrador.</li>
                </ul>
            </div>

            {/* Nota de Tiempo */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-left mb-10">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200/80">
                    Procesaremos tu solicitud y eliminaremos todos tus datos de nuestros servidores en un plazo máximo de <strong>5 días hábiles</strong>. Recibirás una confirmación por correo una vez completado.
                </p>
            </div>

            {/* Footer / Volver */}
            <Link href="/">
                <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 mx-auto group">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Cancelar y volver al inicio
                </button>
            </Link>

        </div>
      </motion.div>
    </main>
  )
}