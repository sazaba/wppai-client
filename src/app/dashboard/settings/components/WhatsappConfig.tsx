'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { useAuth } from '@/app/context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const REDIRECT_URI = `https://wasaaa.com/dashboard/callback`

export default function WhatsappConfig() {
  const { usuario, token } = useAuth()
  const empresaId = usuario?.empresaId || null

  const [estado, setEstado] = useState<'conectado' | 'desconectado' | 'cargando'>('cargando')
  const [displayPhone, setDisplayPhone] = useState('')
  const [oauthDone, setOauthDone] = useState(false)

  useEffect(() => {
    if (token) {
      fetchEstado(token)
    }

    const oauthStatus = localStorage.getItem('oauthDone')
    if (oauthStatus === '1') setOauthDone(true)

    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      Swal.fire({
        icon: 'success',
        title: '¡Conectado con WhatsApp!',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#10b981'
      })
      localStorage.setItem('oauthDone', '1')
    }
  }, [token])

  const fetchEstado = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/whatsapp/estado`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      if (res.data?.conectado) {
        setEstado('conectado')
        setDisplayPhone(res.data.displayPhoneNumber || res.data.phoneNumberId)
      } else {
        setEstado('desconectado')
        setDisplayPhone('')
      }
    } catch (err) {
      console.warn('No hay conexión activa:', err)
      setEstado('desconectado')
    }
  }

  const conectarConMeta = () => {
    if (!empresaId || !token) {
      console.error("Faltan datos para conectar con Meta")
      return
    }

    localStorage.setItem('tempToken', token)

    const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&state=${empresaId}&response_type=code&scope=whatsapp_business_management,whatsapp_business_messaging,business_management`

    console.log("🔗 OAuth URL:", url)
    window.location.href = url
  }

  const eliminarWhatsapp = async () => {
    if (!token) return

    const confirm = await Swal.fire({
      title: '¿Eliminar conexión?',
      text: 'Esta acción desvinculará el número de WhatsApp de tu empresa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1f2937',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    })

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/whatsapp/eliminar`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        setDisplayPhone('')
        setEstado('desconectado')
        localStorage.removeItem('oauthDone')

        Swal.fire({
          icon: 'success',
          title: 'Conexión eliminada',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#10b981'
        })
      } catch (err) {
        console.error('Error al eliminar conexión:', err)
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: 'No se pudo eliminar la conexión.',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        })
      }
    }
  }

  return (
    <div className="w-full sm:max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mt-8 text-center">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Estado de WhatsApp
      </h2>

      {estado === 'conectado' ? (
        <>
          <p className="text-green-500 font-medium mb-2 text-sm sm:text-base">✅ Conectado</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-2">
            Número: <strong>{displayPhone}</strong>
          </p>
          <p className="text-xs text-gray-400 mb-4">
            * Token conectado manualmente (modo demo). En producción se usa OAuth.
          </p>

          {oauthDone && (
            <div className="bg-gray-800 text-white text-xs p-3 rounded mb-4">
              <p><strong>Test Mode:</strong> Using Meta sandbox number.</p>
              <p><strong>Connection:</strong> Token injected manually.</p>
              <p><strong>Note:</strong> Real OAuth flow shown above for demo purposes.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={conectarConMeta}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
            >
              Re-conectar
            </button>
            <button
              onClick={eliminarWhatsapp}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Desconectar
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-yellow-500 font-medium mb-2 text-sm sm:text-base">⚠️ No conectado</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4">
            Conecta un número de WhatsApp para comenzar.
          </p>
          <button
            onClick={conectarConMeta}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
          >
            Conectar con WhatsApp
          </button>
        </>
      )}
    </div>
  )
}
