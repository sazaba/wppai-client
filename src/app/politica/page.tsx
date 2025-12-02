'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import logo from '../images/Logo-Wasaaa.webp'
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function Politica() {
  return (
    // CAMBIO: pt-28 md:pt-32 asegura que el contenido baje lo suficiente para no ser tapado por el Navbar
    <main className="min-h-screen bg-zinc-950 relative overflow-hidden pt-28 md:pt-32 pb-12 px-4 sm:px-6">
      
      {/* --- Luces de Fondo Ambientales (Coherencia con Login/Home) --- */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Navegación Breadcrumb Estilizada */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-zinc-400">
          <Link 
            href="/" 
            className="flex items-center gap-1 hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Inicio
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 font-medium">Política de privacidad</span>
        </nav>

        {/* Tarjeta de Contenido Glassmorphism */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            
            {/* Encabezado */}
            <div className="text-center mb-12 border-b border-white/5 pb-8">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 shadow-lg shadow-indigo-500/10">
                    <Image
                        src={logo}
                        alt="Logo de Wasaaa"
                        width={64}
                        height={64}
                        className="w-12 h-12 object-contain"
                    />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                    Política de Privacidad
                </h1>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                    Última actualización: {new Date().getFullYear()}
                </p>
            </div>

            {/* Contenido del Documento */}
            <div className="space-y-10 text-zinc-300 leading-relaxed text-base md:text-lg">
                
                <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-zinc-400 font-light border-l-4 border-indigo-500 pl-4">
                        Esta política de privacidad aplica exclusivamente para los servicios ofrecidos por <strong className="text-white">Wasaaa</strong>,
                        una plataforma SaaS de automatización de mensajes de WhatsApp con inteligencia artificial.
                    </p>
                </div>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700">1</span>
                        Información que recopilamos
                    </h2>
                    <ul className="list-disc list-inside space-y-3 ml-2 marker:text-indigo-500">
                        <li>Nombre y correo electrónico al registrarte en nuestra plataforma.</li>
                        <li>Mensajes recibidos por WhatsApp a través de tu cuenta conectada (procesados temporalmente para generar respuestas).</li>
                        <li>Información técnica del número de WhatsApp conectado.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700">2</span>
                        Uso de la información
                    </h2>
                    <p>
                        Utilizamos tu información exclusivamente para ofrecer el servicio de atención automatizada.
                        <span className="block mt-2 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-indigo-200 text-sm">
                            <ShieldCheckIcon className="w-5 h-5 inline mr-2 mb-0.5" />
                            No vendemos ni compartimos tu información con terceros para fines publicitarios.
                        </span>
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700">3</span>
                        Seguridad
                    </h2>
                    <p>
                        Implementamos medidas de encriptación y seguridad de nivel industrial. 
                        El acceso a las cuentas de WhatsApp se realiza estrictamente a través de la API oficial de Meta (Cloud API), garantizando el cumplimiento de sus normas.
                    </p>
                </section>

                <section>
                    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-white mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm border border-zinc-700">4</span>
                        Contacto
                    </h2>
                    <p>
                        Si tienes dudas sobre el tratamiento de tus datos, nuestro oficial de privacidad está disponible en: {' '}
                        <a href="mailto:contacto@wasaaa.com" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
                            contacto@wasaaa.com
                        </a>
                    </p>
                </section>

            </div>

            {/* Footer del Documento */}
            <div className="mt-16 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-zinc-500">
                    Wasaaa es una aplicación independiente y no tiene afiliación directa con Meta Platforms, Inc.
                </p>
            </div>

        </div>
      </motion.div>
    </main>
  )
}