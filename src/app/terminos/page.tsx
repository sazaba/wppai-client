'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, ScaleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function Terminos() {
  return (
    // CAMBIO: pt-28 md:pt-32 para evitar colisión con Navbar
    <main className="min-h-screen bg-zinc-950 relative overflow-hidden pt-28 md:pt-32 pb-12 px-4 sm:px-6">
      
      {/* --- Luces de Fondo Ambientales --- */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-zinc-400">
          <Link 
            href="/" 
            className="flex items-center gap-1 hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Inicio
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 font-medium">Términos y condiciones</span>
        </nav>

        {/* Tarjeta Glassmorphism */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            
            {/* Encabezado */}
            <div className="text-center mb-12 border-b border-white/5 pb-8">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 shadow-lg shadow-indigo-500/10">
                    <DocumentTextIcon className="w-10 h-10 text-indigo-400" />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                    Términos y Condiciones
                </h1>
                <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                    Por favor, lee atentamente antes de utilizar nuestros servicios.
                </p>
            </div>

            {/* Contenido Legal */}
            <div className="space-y-10 text-zinc-300 leading-relaxed text-base md:text-lg">

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700 font-mono text-indigo-400">1</span>
                        Aceptación
                    </h2>
                    <p>
                        Al registrarte y utilizar <strong className="text-white">Wasaaa</strong>, aceptas los presentes términos y condiciones de uso. 
                        Si no estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700 font-mono text-indigo-400">2</span>
                        Uso adecuado
                    </h2>
                    <p>
                        Te comprometes a usar la plataforma de forma legal y respetuosa. Queda estrictamente prohibido usar Wasaaa para el envío de SPAM, 
                        contenido ofensivo, o infringir derechos de terceros.
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700 font-mono text-indigo-400">3</span>
                        Servicios ofrecidos
                    </h2>
                    <p>
                        Wasaaa permite gestionar mensajes de WhatsApp automatizados con inteligencia artificial. 
                        Nos reservamos el derecho de retirar o modificar el servicio sin previo aviso, aunque haremos lo posible por notificarte.
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700 font-mono text-indigo-400">4</span>
                        Propiedad intelectual
                    </h2>
                    <p>
                        El servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de Wasaaa y sus licenciantes.
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700 font-mono text-indigo-400">5</span>
                        Responsabilidad
                    </h2>
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-200/80 text-base">
                        No nos responsabilizamos por daños indirectos, incidentales, especiales, consecuentes o punitivos, 
                        incluyendo sin limitación, pérdida de beneficios, datos, uso, buena voluntad, u otras pérdidas intangibles.
                    </div>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700 font-mono text-indigo-400">6</span>
                        Integración con terceros
                    </h2>
                    <p>
                        Wasaaa utiliza la API oficial de WhatsApp Cloud (Meta Platforms, Inc.). 
                        El uso del servicio implica aceptar también las políticas de privacidad y términos de uso de Meta.
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700 font-mono text-indigo-400">7</span>
                        Jurisdicción
                    </h2>
                    <p className="flex items-start gap-2">
                        <ScaleIcon className="w-5 h-5 text-zinc-500 mt-1 flex-shrink-0" />
                        <span>
                            Estos términos se regirán e interpretarán de acuerdo con las leyes de <strong>Colombia</strong>. 
                            Cualquier disputa derivada de estos términos será sometida a la jurisdicción exclusiva de los tribunales de Medellín.
                        </span>
                    </p>
                </section>

            </div>

            {/* Footer de Navegación */}
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-sm text-zinc-500">
                    ¿Tienes dudas? Escríbenos a <span className="text-indigo-400">contacto@wasaaa.com</span>
                </p>
                <Link href="/politica">
                    <button className="text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl transition-colors border border-zinc-700">
                        Ver Política de Privacidad
                    </button>
                </Link>
            </div>

        </div>
      </motion.div>
    </main>
  )
}