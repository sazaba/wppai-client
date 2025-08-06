'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAuth } from '@/app/context/AuthContext' // ⬅️ Importa el contexto
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const { setToken, setUsuario, setEmpresa } = useAuth() as any // ⬅️ para poder usar setters

  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // 🎉 Dispara confeti
  useEffect(() => {
    if (showModal) {
      const duration = 2 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#4F46E5', '#22D3EE', '#F59E0B', '#EF4444'] })
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#4F46E5', '#22D3EE', '#F59E0B', '#10B981'] })
        confetti({ particleCount: 4, spread: 360, origin: { x: 0.5, y: 0 }, colors: ['#6366F1', '#F472B6', '#FB923C', '#84CC16'] })

        if (Date.now() < end) requestAnimationFrame(frame)
      }

      frame()
    }
  }, [showModal])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreEmpresa, email, password }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error || 'Error al registrar')
        setLoading(false)
        return
      }

      const { token, empresaId } = await res.json()

      // Guardar token y usuario en contexto y localStorage
      localStorage.setItem('token', token)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const usuario = {
        id: payload.id,
        email: payload.email,
        rol: payload.rol,
        empresaId: payload.empresaId
      }
      localStorage.setItem('usuario', JSON.stringify(usuario))

      setToken(token)
      setUsuario(usuario)

      // Cargar empresa recién creada
      const empresaRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/empresa`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmpresa(empresaRes.data)

      // Mostrar modal de bienvenida
      setShowModal(true)

    } catch (err) {
      setError('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleGoDashboard = () => {
    setShowModal(false)
    router.push('/dashboard')
  }
  return (
    <>
      {/* Formulario de registro */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">Registro de Empresa</h1>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la empresa</label>
            <input type="text" value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-sm" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-sm" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-sm" required />
          </div>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-md">
            {loading ? 'Registrando...' : 'Registrar'}
          </motion.button>
        </form>
      </div>

      {/* Modal animado */}
      <AnimatePresence>
        {showModal && (
          <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}>
                <Dialog.Panel className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-xl text-center">
                  
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}>
                    <CheckCircleIcon className="h-14 w-14 text-green-500 mx-auto mb-4" />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}>
                    <Dialog.Title className="text-2xl font-bold mb-2">¡Bienvenido a Wasaaa! 🎉</Dialog.Title>
                  </motion.div>

                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }} className="text-gray-700 mb-4">
                    Tu empresa <strong>{nombreEmpresa}</strong> ha sido registrada con éxito.
                    Disfruta de tu <strong>Plan Gratis</strong> con 100 mensajes y 30 días de prueba.
                  </motion.p>

                  <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }} className="text-left text-gray-600 mb-6 list-disc list-inside space-y-1">
                    <li>Respuestas automáticas con IA</li>
                    <li>Clasificación de conversaciones</li>
                    <li>Conexión con WhatsApp Business</li>
                  </motion.ul>

                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleGoDashboard}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-lg">
                    Ir al Dashboard 🚀
                  </motion.button>
                </Dialog.Panel>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
