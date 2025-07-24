'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL




export default function CallbackHandler() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = params.get('code')
    const token = localStorage.getItem('tempToken')

    if (!code || !token) {
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
          { code },
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
          title: 'Error al conectar',
          text: 'No se pudo conectar el número de WhatsApp.',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        })
      }
    }

    conectar()
  }, [params])

  return <p className="text-lg">Conectando con WhatsApp...</p>
}
