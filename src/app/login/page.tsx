'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { LockClosedIcon, EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import type { IOptions, RecursivePartial } from 'tsparticles-engine'
import Link from 'next/link'
import Image from 'next/image'
import logo from '../images/Logo-Wasaaa.webp'

export default function LoginPage() {
  const { login, empresa } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine)
  }, [])

  // 🎨 Partículas Premium: Ajustadas para ser sutiles y mágicas
  // Ahora detecta retina para mayor nitidez en móviles modernos
  const particlesOptions: RecursivePartial<IOptions> = {
    background: { color: { value: 'transparent' } },
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      number: { 
        value: 40, // Reducido ligeramente para mejor rendimiento móvil
        density: { enable: true, area: 800 } 
      },
      color: { value: ['#818cf8', '#c084fc', '#2dd4bf'] }, // Indigo, Purple, Teal
      opacity: {
        value: 0.5,
        random: true,
        animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
      },
      size: {
        value: 3,
        random: { enable: true, minimumValue: 1 },
      },
      move: {
        enable: true,
        speed: 0.8, // Velocidad un poco más lenta para elegancia
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' },
      },
      links: {
        enable: true,
        distance: 150,
        color: '#ffffff',
        opacity: 0.08, // Aún más sutil
        width: 1,
      },
    },
    detectRetina: true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const success = await login(email, password)

    if (success) {
      setShowWelcomeModal(true)
      // Redirigir un poco más rápido para no aburrir
      setTimeout(() => {
        setShowWelcomeModal(false)
        router.push('/dashboard')
      }, 2000)
    } else {
      setError('Credenciales incorrectas. Inténtalo de nuevo.')
    }

    setLoading(false)
  }

  return (
    <>
      {/* Contenedor Principal con Fondo Ambiental */}
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Luces de Fondo (Ambient Glows) */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-indigo-500/20 blur-[80px] md:blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-purple-500/20 blur-[80px] md:blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" />

        {/* Tarjeta de Login Glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          // CAMBIO: Padding responsivo (p-6 en móvil, p-10 en desktop)
          className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-10 w-full max-w-md relative z-10"
        >
          {/* Header de la tarjeta */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
                <Image src={logo} alt="Wasaaa Logo" width={60} height={60} className="w-14 h-14 md:w-16 md:h-16 mx-auto drop-shadow-lg" />
            </Link>
            {/* CAMBIO: Texto responsivo */}
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Bienvenido de nuevo
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg p-3 mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input Correo */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 ml-1 uppercase tracking-wider">Correo electrónico</label>
              <div className="relative group">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm md:text-base"
                  placeholder="ejemplo@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1 flex-wrap gap-1">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Contraseña</label>
                <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
                    ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm md:text-base"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Botón CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              <div className="relative rounded-xl bg-zinc-900/20 group-hover:bg-transparent transition-colors h-full w-full py-3">
                 <span className="relative flex items-center justify-center text-white font-semibold text-sm tracking-wide">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Ingresando...
                        </span>
                    ) : 'Iniciar Sesión'}
                 </span>
              </div>
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-zinc-400 text-sm">
              ¿Aún no tienes cuenta?{' '}
              <Link href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Regístrate gratis
              </Link>
            </p>
            <div className="mt-6">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm group">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio
                </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de bienvenida Ultra Premium */}
      <AnimatePresence>
        {showWelcomeModal && (
          <Dialog
            open={showWelcomeModal}
            onClose={() => {}}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Fondo oscuro con mucho blur */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />

            {/* Contenedor del Modal */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
                
                {/* Partículas detrás del contenido */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="w-full h-full" />
                </div>

                {/* CORRECCIÓN DE ERROR DE TIPADO: Usamos Dialog.Panel como contenedor y motion.div dentro */}
                <Dialog.Panel className="w-full max-w-sm mx-auto bg-transparent shadow-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        // CAMBIO: Padding responsivo en modal
                        className="relative z-10 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] shadow-2xl w-full text-center overflow-hidden"
                    >
                        {/* Brillo superior */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 mb-6"
                        >
                            <span className="text-3xl md:text-4xl">👋</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl md:text-3xl font-bold text-white mb-2"
                        >
                            ¡Hola de nuevo!
                        </motion.h2>
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-zinc-400 mb-8 text-sm md:text-base"
                        >
                            {empresa?.nombre ? (
                                <>Accediendo al entorno de <strong className="text-indigo-400">{empresa.nombre}</strong></>
                            ) : (
                                'Preparando tu dashboard...'
                            )}
                        </motion.p>

                        {/* Barra de progreso animada */}
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-indigo-500"
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ duration: 1.8, ease: "easeInOut" }}
                            />
                        </div>
                    </motion.div>
                </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}