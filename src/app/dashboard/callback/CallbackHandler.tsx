'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function CallbackHandler() {
  const params = useSearchParams()
  const router = useRouter()
  const hasRun = useRef(false) // para evitar doble ejecución en dev

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

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
        console.log('📲 Enviando código a backend:', code)

        const res = await axios.post(
          `${API_URL}/api/auth/callback`,
          { code },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        // 🔁 Selección de número (si aplica)
        if (res.data.seleccionarNumero) {
          const { availableNumbers, accessToken } = res.data

          const options = availableNumbers.map((n: any) => ({
            value: JSON.stringify({ ...n, accessToken }),
            text: `${n.nombre || 'Número'} – ${n.displayPhoneNumber}`
          }))

          const { value: seleccion } = await Swal.fire({
            title: 'Selecciona un número de WhatsApp',
            input: 'select',
            inputOptions: options.reduce((acc: any, o: any) => {
              acc[o.value] = o.text
              return acc
            }, {}),
            inputPlaceholder: 'Selecciona...',
            background: '#1f2937',
            color: '#fff',
            confirmButtonColor: '#10b981',
            showCancelButton: true,
            cancelButtonColor: '#ef4444'
          })

          if (seleccion) {
            const datos = JSON.parse(seleccion)

            await axios.post(`${API_URL}/api/whatsapp/guardar`, datos, {
              headers: { Authorization: `Bearer ${token}` }
            })

            localStorage.setItem('oauthDone', '1')
            localStorage.removeItem('tempToken')

            Swal.fire({
              icon: 'success',
              title: 'WhatsApp conectado 🎉',
              background: '#1f2937',
              color: '#fff',
              confirmButtonColor: '#10b981'
            }).then(() => router.push('/dashboard'))
          } else {
            Swal.fire({
              icon: 'info',
              title: 'Conexión cancelada',
              background: '#1f2937',
              color: '#fff'
            })
          }

          return
        }

        // ✅ Conexión directa sin selección
        localStorage.setItem('oauthDone', '1')
        localStorage.removeItem('tempToken')

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
  }, [params, router])

  return <p className="text-lg text-white">Conectando con WhatsApp...</p>
}
