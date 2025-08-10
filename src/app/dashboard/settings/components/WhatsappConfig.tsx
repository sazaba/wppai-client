'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { Trash2, RefreshCw } from 'lucide-react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../../context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_META_REDIRECT_URI || 'https://wasaaa.com/dashboard/callback'

type Estado = 'conectado' | 'desconectado' | 'cargando'

export default function WhatsappConfig() {
  const { usuario, token } = useAuth()
  const empresaId = usuario?.empresaId || null

  const [estado, setEstado] = useState<Estado>('cargando')
  const [displayPhone, setDisplayPhone] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [wabaId, setWabaId] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  const [loadingEstado, setLoadingEstado] = useState(false)

  // ---------- Helpers ----------
  const alertError = (title: string, text?: string) =>
    Swal.fire({
      icon: 'error',
      title,
      text,
      background: '#111827',
      color: '#fff'
    })

  const alertInfo = (title: string, html?: string) =>
    Swal.fire({
      icon: 'info',
      title,
      html,
      background: '#111827',
      color: '#fff'
    })

  const alertSuccess = (title: string, text?: string) =>
    Swal.fire({
      icon: 'success',
      title,
      text,
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#10b981'
    })

  // ---------- Cargar estado actual ----------
  const fetchEstado = useCallback(
    async (authToken: string) => {
      if (!API_URL) return
      try {
        setLoadingEstado(true)
        const { data } = await axios.get(`${API_URL}/api/whatsapp/estado`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })

        const acc = data?.whatsappAccount
        if (acc) {
          setEstado('conectado')
          setDisplayPhone(acc.displayPhoneNumber || acc.phoneNumberId || '')
          setPhoneNumberId(acc.phoneNumberId || '')
          setWabaId(acc.wabaId || '')
          setBusinessId(acc.businessId || '')
          // limpiar tempToken por si quedó de intentos anteriores
          localStorage.removeItem('tempToken')
        } else {
          setEstado('desconectado')
          setDisplayPhone('')
          setPhoneNumberId('')
          setWabaId('')
          setBusinessId('')
        }
      } catch (e: any) {
        setEstado('desconectado')
        setDisplayPhone('')
        setPhoneNumberId('')
        setWabaId('')
        setBusinessId('')
      } finally {
        setLoadingEstado(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!API_URL) {
      alertError('Config requerida', 'Falta NEXT_PUBLIC_API_URL en el frontend.')
      return
    }
    if (token) fetchEstado(token)

    // Leer ?success=1 desde callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      alertSuccess('¡Conectado con WhatsApp!')
      localStorage.setItem('oauthDone', '1')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [token, fetchEstado])

  // ---------- Acciones ----------
  const iniciarOAuth = () => {
    if (!empresaId || !token) {
      alertInfo('Sesión requerida', 'Inicia sesión para conectar tu WhatsApp.')
      return
    }
    if (!API_URL) return

    // Guarda JWT para que el CallbackPage lo use al guardar la selección
    localStorage.setItem('tempToken', token)
    localStorage.removeItem('oauthDone')

    setRedirecting(true)
    // auth_type=rerequest para forzar re-consent si faltó business_management
    window.location.href = `${API_URL}/api/auth/whatsapp?auth_type=rerequest`
  }

  const abrirEmbeddedSignup = () => {
    if (!token) {
      alertInfo('Sesión requerida', 'Inicia sesión para continuar.')
      return
    }
    localStorage.setItem('tempToken', token)
    window.location.href = '/dashboard/callback' // tu flujo embedded debería redirigir aquí
  }

  const eliminarWhatsapp = async () => {
    if (!token || !API_URL) return
    const confirm = await Swal.fire({
      title: '¿Eliminar conexión?',
      text: 'Esto desvinculará el número de tu empresa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    })
    if (!confirm.isConfirmed) return

    try {
      await axios.delete(`${API_URL}/api/whatsapp/eliminar`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEstado('desconectado')
      setDisplayPhone('')
      setPhoneNumberId('')
      setWabaId('')
      setBusinessId('')
      localStorage.removeItem('oauthDone')
      localStorage.removeItem('tempToken')
      alertSuccess('Conexión eliminada')
    } catch {
      alertError('No se pudo eliminar')
    }
  }

  const recargar = () => {
    if (!token) return
    fetchEstado(token)
  }

  // ---------- Render ----------
  return (
    <div className="w-full sm:max-w-xl mx-auto bg-gray-900 text-white rounded-xl shadow-md p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Estado de WhatsApp</h2>
        <button
          onClick={recargar}
          disabled={loadingEstado}
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm disabled:opacity-60"
          title="Refrescar estado"
        >
          <RefreshCw className="w-4 h-4" />
          {loadingEstado ? 'Actualizando…' : 'Refrescar'}
        </button>
      </div>

      {estado === 'cargando' ? (
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="w-6 h-6 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-300">Verificando conexión…</span>
        </div>
      ) : estado === 'conectado' ? (
        <>
          <p className="text-green-400 font-medium mb-3">✅ Conectado</p>

          <div className="grid gap-2 text-sm bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Display Number</span>
              <span className="font-medium">{displayPhone || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Phone Number ID</span>
              <code className="text-slate-300">{phoneNumberId || '—'}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">WABA ID</span>
              <code className="text-slate-300">{wabaId || '—'}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Business ID</span>
              <code className="text-slate-300">{businessId || '—'}</code>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={iniciarOAuth}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm disabled:opacity-60"
              disabled={redirecting}
            >
              {redirecting ? 'Redirigiendo…' : 'Re-conectar'}
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
          <p className="text-yellow-400 font-medium mb-4">⚠️ No conectado</p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={iniciarOAuth}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm disabled:opacity-60"
              disabled={redirecting}
            >
              {redirecting ? 'Redirigiendo…' : 'Conectar con WhatsApp (OAuth)'}
            </button>
            <button
              onClick={abrirEmbeddedSignup}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm"
            >
              Conectar (Embedded Signup)
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Tras la aprobación, el usuario deberá re-autorizar para otorgar{' '}
            <code>business_management</code>. Luego, en el callback verás la lista de Businesses → WABAs
            → Phone Numbers y podrás seleccionar el número a conectar.
          </p>
        </>
      )}
    </div>
  )
}
