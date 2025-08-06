'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function DashboardHomePage() {
  const { empresa, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) return <div className="p-6 text-white">Cargando...</div>
  if (!isAuthenticated) return null

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 rounded-lg shadow-xl text-white"
      >
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">
          ¡Hola {empresa?.nombre || 'Usuario'}! 👋
        </h1>
        <p className="mt-1 text-xs sm:text-sm md:text-base opacity-90">
          Este es tu resumen de actividad.
        </p>
      </motion.div>

      {/* Resumen de métricas */}
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
    </div>
  )
}
