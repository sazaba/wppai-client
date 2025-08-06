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

  if (loading) return <div className="p-6">Cargando...</div>
  if (!isAuthenticated) return null

  return (
    <div className="p-6 space-y-6">
      {/* Bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow-lg text-white"
      >
        <h1 className="text-2xl font-bold">
          ¡Hola {usuario?.email || 'Usuario'}! 👋
        </h1>
        <p className="mt-1 text-sm">
          Bienvenid@ a tu panel de control{empresa?.nombre ? ` de ${empresa.nombre}` : ''}.
        </p>
      </motion.div>

      {/* Información de la empresa */}
      {empresa && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">📋 Información de tu empresa</h2>
          <p className="text-sm"><strong>Nombre:</strong> {empresa.nombre}</p>
          <p className="text-sm"><strong>ID:</strong> {empresa.id}</p>
        </div>
      )}

      {/* Pasos sugeridos */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">🚀 Siguientes pasos</h2>

        <div
          className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => router.push('/dashboard/settings')}
        >
          <Cog className="text-indigo-600" />
          <span>Configura y entrena tu IA con la información de tu negocio</span>
        </div>

        <div
          className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => router.push('/dashboard/callback')}
        >
          <MessageSquare className="text-green-600" />
          <span>Conecta tu número de WhatsApp Business</span>
        </div>

        <div
          className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => router.push('/dashboard/chats')}
        >
          <Sparkles className="text-purple-600" />
          <span>Revisa y gestiona tus chats en tiempo real</span>
        </div>
      </div>
    </div>
  )
}
