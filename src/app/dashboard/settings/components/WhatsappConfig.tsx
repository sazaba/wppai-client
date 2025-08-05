'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { useAuth } from '@/app/context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const REDIRECT_URI = `https://wasaaa.com/dashboard/callback`

// Lista básica de países (puedes ampliarla)
const COUNTRIES = [
  { name: 'Colombia', code: '+57' },
  { name: 'México', code: '+52' },
  { name: 'Argentina', code: '+54' },
  { name: 'Chile', code: '+56' },
  { name: 'Perú', code: '+51' },
  { name: 'España', code: '+34' },
  { name: 'Estados Unidos', code: '+1' } // 🇺🇸 agregado
]


export default function WhatsappConfig() {
  const { usuario, token } = useAuth()
  const empresaId = usuario?.empresaId || null

  const [estado, setEstado] = useState<'conectado' | 'desconectado' | 'cargando'>('cargando')
  const [displayPhone, setDisplayPhone] = useState('')
  const [oauthDone, setOauthDone] = useState(false)
  const [numeroManual, setNumeroManual] = useState('')
  const [phoneIdManual, setPhoneIdManual] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [countryCode, setCountryCode] = useState('+57') // Por defecto Colombia

  useEffect(() => {
    if (token) {
      fetchEstado(token)
    }

    const oauthStatus = localStorage.getItem('oauthDone')
    if (oauthStatus === '1') {
      setOauthDone(true)
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
    if (!empresaId || !token || !numeroManual || !phoneIdManual) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Debes ingresar el número y el Phone Number ID antes de conectar.',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    // Formatear número con indicativo
    const fullNumber = `${countryCode}${numeroManual.replace(/\D/g, '')}`

    localStorage.setItem('tempToken', token)
    const stateValue = `${empresaId}|${fullNumber}|${phoneIdManual}`

    const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&state=${encodeURIComponent(stateValue)}&response_type=code&scope=whatsapp_business_messaging,public_profile`

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
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        Estado de WhatsApp
      </h2>

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
          <p className="text-yellow-400 font-medium mb-2 text-sm sm:text-base">⚠️ No conectado</p>
          <p className="text-gray-300 text-sm sm:text-base mb-4">
            Selecciona el país e ingresa tu número de WhatsApp Business y el Phone Number ID.
          </p>

          <div className="flex gap-2 mb-4">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Número sin indicativo"
              value={numeroManual}
              onChange={(e) => setNumeroManual(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white"
            />
          </div>

          <input
            type="text"
            placeholder="Phone Number ID de Meta"
            value={phoneIdManual}
            onChange={(e) => setPhoneIdManual(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded mb-4 bg-gray-800 text-white"
          />

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
