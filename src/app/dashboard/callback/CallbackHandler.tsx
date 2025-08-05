'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    // Espera un segundo para mostrar animación y luego redirige
    const timeout = setTimeout(() => {
      const success = params.get('success') || '1'
      router.replace(`/dashboard/settings?success=${success}`)
    }, 1500)

    return () => clearTimeout(timeout)
  }, [router, params])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium">Conectando con WhatsApp...</p>
      <p className="text-sm text-gray-400 mt-2">Por favor espera unos segundos</p>
    </div>
  )
}
