'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { useAuth } from '../../../context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const REDIRECT_URI = `https://wasaaa.com/dashboard/callback`

export default function WhatsappConfig() {
  const { usuario, token } = useAuth()
  const empresaId = usuario?.empresaId || null

  const [estado, setEstado] = useState<'conectado' | 'desconectado' | 'cargando'>('cargando')
  const [displayPhone, setDisplayPhone] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')

  useEffect(() => {
    if (token) {
      fetchEstado(token)
    }

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
      window.history.replaceState({}, document.title, window.location.pathname)
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
        setPhoneNumberId(res.data.phoneNumberId || '')
      } else {
        setEstado('desconectado')
        setDisplayPhone('')
        setPhoneNumberId('')
      }
    } catch (err) {
      console.warn('No hay conexión activa:', err)
      setEstado('desconectado')
      setDisplayPhone('')
      setPhoneNumberId('')
    }
  }

  const conectarConMeta = () => {
    if (!empresaId || !token) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'No se pudo iniciar el proceso OAuth.',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    localStorage.setItem('tempToken', token)

    const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=whatsapp_business_messaging,public_profile`

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
        setPhoneNumberId('')
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
    <div className="w-full sm:max-w-xl mx-auto bg-gray-900 text-white rounded-xl shadow-md p-6 mt-8 text-center">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Estado de WhatsApp</h2>

      {estado === 'conectado' ? (
        <>
          <p className="text-green-400 font-medium mb-2 text-sm sm:text-base">✅ Conectado</p>
          <p className="text-gray-300 text-sm sm:text-base mb-2">
            Número: <strong>{displayPhone}</strong> <br />
            ID: <strong>{phoneNumberId}</strong>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={conectarConMeta}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
            >
              Re-conectar
            </button>
            <button
              onClick={eliminarWhatsapp}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Desconectar
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-yellow-400 font-medium mb-4 text-sm sm:text-base">⚠️ No conectado</p>

          <button
            onClick={conectarConMeta}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
          >
            Conectar con WhatsApp
          </button>
        </>
      )}
    </div>
  )
}
