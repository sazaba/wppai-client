'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, Cog, Activity } from 'lucide-react'

export default function DashboardHomePage() {
  const { usuario, empresa, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [modoOnboarding, setModoOnboarding] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    // Aquí simulamos que el usuario ya tiene todo configurado
    // En producción, validarías con un endpoint si la IA está entrenada y WhatsApp conectado
    if (empresa && usuario) {
      const configurado = true // cambiar lógica real
      setModoOnboarding(!configurado)
    }
  }, [empresa, usuario])

  if (loading) return <div className="p-6 text-white">Cargando...</div>
  if (!isAuthenticated) return null

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-lg shadow-xl text-white"
      >
        <h1 className="text-3xl font-bold">
          ¡Hola {usuario?.email || 'Usuario'}! 👋
        </h1>
        <p className="mt-1 text-sm opacity-90">
          Bienvenid@ a tu panel{empresa?.nombre ? ` de ${empresa.nombre}` : ''}.
        </p>
      </motion.div>

      {/* Modo Onboarding */}
      {modoOnboarding ? (
        <>
          {empresa && (
            <div className="bg-gray-900 p-5 rounded-lg shadow-md border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-2">📋 Información de tu empresa</h2>
              <p className="text-sm text-gray-300">
                <strong>Nombre:</strong> {empresa.nombre}
              </p>
            </div>
          )}

          <div className="bg-gray-900 p-5 rounded-lg shadow-md border border-gray-800 space-y-4">
            <h2 className="text-lg font-semibold text-white">🚀 Siguientes pasos</h2>

            <div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-indigo-600/20 cursor-pointer transition"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Cog className="text-indigo-400" size={22} />
              <span className="text-gray-200">
                Configura y entrena tu IA con la información de tu negocio
              </span>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-green-600/20 cursor-pointer transition"
              onClick={() => router.push('/dashboard/callback')}
            >
              <MessageSquare className="text-green-400" size={22} />
              <span className="text-gray-200">
                Conecta tu número de WhatsApp Business
              </span>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-purple-600/20 cursor-pointer transition"
              onClick={() => router.push('/dashboard/chats')}
            >
              <Sparkles className="text-purple-400" size={22} />
              <span className="text-gray-200">
                Revisa y gestiona tus chats en tiempo real
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Modo Resumen con métricas */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800">
            <p className="text-sm text-gray-400">Chats activos</p>
            <p className="text-2xl font-bold text-white">8</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800">
            <p className="text-sm text-gray-400">Mensajes hoy</p>
            <p className="text-2xl font-bold text-white">152</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800">
            <p className="text-sm text-gray-400">Estado WhatsApp</p>
            <p className="text-2xl font-bold text-green-400">Conectado</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800">
            <p className="text-sm text-gray-400">Plan</p>
            <p className="text-2xl font-bold text-indigo-400">Pro</p>
          </div>
        </div>
      )}
    </div>
  )
}
