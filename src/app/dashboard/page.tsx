'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardHomePage() {
  const { usuario, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null // o un spinner si quieres

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Bienvenid@ al Dashboard</h1>
      <p className="text-sm text-muted-foreground">Tu correo: {usuario?.email}</p>
    </div>
  )
}
