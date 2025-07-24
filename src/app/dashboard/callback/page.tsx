'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function CallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const code = params.get('code')
    const empresaId = params.get('state') // Meta manda esto como "state"
    const token = localStorage.getItem('tempToken')

    if (!code || !empresaId || !token) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan datos',
        text: 'No se pudo completar la conexión con WhatsApp.',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      })
      return
    }

    const conectar = async () => {
      try {
        await axios.post(
          `${API_URL}/api/auth/callback`,
          { code, empresaId },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        Swal.fire({
          icon: 'success',
          title: 'WhatsApp conectado 🎉',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#10b981'
        }).then(() => router.push('/dashboard'))
      } catch (err) {
        console.error('❌ Error al conectar WhatsApp:', err)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo conectar el número de WhatsApp.',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        })
      }
    }

    conectar()
  }, [params])

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">
      <p className="text-lg">Conectando con WhatsApp...</p>
    </div>
  )
}
