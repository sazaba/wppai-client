'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const REDIRECT_URI = `${API_URL}/api/auth/callback`

export default function WhatsappConfig() {
  const [estado, setEstado] = useState<'conectado' | 'desconectado' | 'cargando'>('cargando')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId')
    const storedToken = localStorage.getItem('token')
    if (storedEmpresaId) setEmpresaId(parseInt(storedEmpresaId))
    if (storedToken) setToken(storedToken)
    if (storedToken) fetchEstado(storedToken)
  }, [])

  const fetchEstado = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/whatsapp/estado`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      if (res.data?.conectado) {
        setEstado('conectado')
        setPhoneNumberId(res.data.phoneNumberId)
      } else {
        setEstado('desconectado')
        setPhoneNumberId('')
      }
    } catch (err) {
      console.warn('No hay conexión activa:', err)
      setEstado('desconectado')
    }
  }

  const conectarConMeta = () => {
    console.log("Intentando conectar con Meta", { empresaId, META_APP_ID, REDIRECT_URI })
  
    if (!empresaId) {
      console.warn("❌ No hay empresaId en localStorage")
      return
    }
  
    const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&state=${empresaId}&response_type=code&scope=whatsapp_business_management`
  
    console.log("Redirigiendo a:", url)
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
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setPhoneNumberId('')
        setEstado('desconectado')

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
    <div className="mt-8 bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl text-white space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        Estado de WhatsApp
        {estado === 'conectado' ? (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
      </h2>

      {estado === 'conectado' && (
        <p className="text-sm text-slate-300">
          📞 Número conectado: <strong>{phoneNumberId}</strong>
        </p>
      )}

      <div className="flex gap-4">
        <button
          onClick={conectarConMeta}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          {estado === 'conectado' ? 'Re-conectar WhatsApp' : 'Conectar con WhatsApp'}
        </button>

        {estado === 'conectado' && (
          <button
            onClick={eliminarWhatsapp}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminaaaaaar
          </button>
        )}
      </div>
    </div>
  )
}
