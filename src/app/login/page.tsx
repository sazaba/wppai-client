'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import Particles from 'react-tsparticles'
import { loadFireworksPreset } from 'tsparticles-preset-fireworks'

export default function LoginPage() {
  const { login, empresa } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Inicializar partículas fireworks
  const particlesInit = useCallback(async (engine: any) => {
    await loadFireworksPreset(engine)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const success = await login(email, password)

    if (success) {
      setShowWelcomeModal(true) // ✅ Mostrar modal primero

      // ⏳ Redirigir después de 2.5 segundos
      setTimeout(() => {
        setShowWelcomeModal(false)
        router.push('/dashboard')
      }, 2500)
    } else {
      setError('Credenciales incorrectas')
    }

    setLoading(false)
  }

  return (
    <>
      {/* Formulario */}
      {!showWelcomeModal && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center px-4">
          <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md transition-all duration-300">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Iniciar sesión
            </h1>

            {error && (
              <p className="text-sm text-red-600 text-center mb-4">{error}</p>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-md transition"
              >
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal premium con partículas fireworks */}
      <AnimatePresence>
        {showWelcomeModal && (
          <Dialog
            open={showWelcomeModal}
            onClose={() => {}}
            className="relative z-50"
          >
            {/* Fondo */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Contenedor modal con partículas */}
            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
              <Particles
                id="fireworks-particles"
                init={particlesInit}
                options={{ preset: 'fireworks' }}
                className="absolute inset-0 z-10"
              />

              {/* Contenido modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl max-w-md w-full text-center relative z-20"
              >
                <motion.h2 className="text-2xl font-bold mb-2">
                  ¡Bienvenido/a! ✨
                </motion.h2>
                <motion.p className="text-gray-600 dark:text-gray-300 mb-4">
                  {empresa?.nombre
                    ? `Nos alegra verte de nuevo, ${empresa.nombre}.`
                    : 'Has iniciado sesión con éxito en Wasaaa.'}
                </motion.p>
                <p className="text-sm text-gray-500">
                  Redirigiendo a tu dashboard...
                </p>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
