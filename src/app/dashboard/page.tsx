'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, Cog } from 'lucide-react'

export default function DashboardHomePage() {
  const { usuario, empresa, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [loading, isAuthenticated, router])

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
          Bienvenid@ a tu panel de control{empresa?.nombre ? ` de ${empresa.nombre}` : ''}.
        </p>
      </motion.div>

      {/* Información de la empresa */}
      {empresa && (
        <div className="bg-gray-900 p-5 rounded-lg shadow-md border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-2">📋 Información de tu empresa</h2>
          <p className="text-sm text-gray-300">
            <strong>Nombre:</strong> {empresa.nombre}
          </p>
        </div>
      )}

      {/* Pasos sugeridos */}
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
    </div>
  )
}
