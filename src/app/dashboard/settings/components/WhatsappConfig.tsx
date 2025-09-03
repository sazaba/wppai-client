'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { Trash2, RefreshCw, Info } from 'lucide-react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../../context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ⬇️ Config por env (recomendado empatar con backend)
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID!
const FB_VERSION = process.env.NEXT_PUBLIC_FB_VERSION || 'v23.0'
const REDIRECT_URI = process.env.NEXT_PUBLIC_META_REDIRECT_URI || 'https://wasaaa.com/dashboard/callback'

type Estado = 'conectado' | 'desconectado' | 'cargando'

export default function WhatsappConfig() {
  const { usuario, token } = useAuth()
  const empresaId = usuario?.empresaId || null

  const [estado, setEstado] = useState<Estado>('cargando')
  const [displayPhone, setDisplayPhone] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [wabaId, setWabaId] = useState('')
  const [businessId, setBusinessId] = useState('')

  // Diagnóstico extendido
  const [nameStatus, setNameStatus] = useState<string | null>(null)
  const [accountMode, setAccountMode] = useState<string | null>(null)
  const [appSubscribed, setAppSubscribed] = useState<boolean | null>(null)

  const [redirecting, setRedirecting] = useState(false)
  const [loadingEstado, setLoadingEstado] = useState(false)

  const alertError = (titulo: string, texto?: string) =>
    Swal.fire({ icon: 'error', title: titulo, text: texto, background: '#111827', color: '#fff' })
  const alertInfo = (titulo: string, html?: string) =>
    Swal.fire({ icon: 'info', title: titulo, html, background: '#111827', color: '#fff' })
  const alertSuccess = (titulo: string, texto?: string) =>
    Swal.fire({ icon: 'success', title: titulo, text: texto, background: '#111827', color: '#fff', confirmButtonColor: '#10b981' })

  // Estado actual desde backend (versión "real")
  const fetchEstado = useCallback(
    async (authToken: string) => {
      if (!API_URL) return
      try {
        setLoadingEstado(true)
        // 🔁 Nuevo: consultar estado real
        const { data } = await axios.get(`${API_URL}/api/whatsapp/estado-detallado`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })

        const connected = Boolean(data?.connected)
        setAppSubscribed(data?.diagnostics?.appSubscribed ?? null)
        setNameStatus(data?.diagnostics?.number?.name_status ?? null)
        setAccountMode(data?.diagnostics?.number?.account_mode ?? null)

        if (connected) {
          // Si está conectado, también podemos recuperar los IDs desde /estado (DB) para mostrarlos
          const { data: dataDb } = await axios.get(`${API_URL}/api/whatsapp/estado`, {
            headers: { Authorization: `Bearer ${authToken}` }
          })
          setEstado('conectado')
          setDisplayPhone(dataDb.displayPhoneNumber || dataDb.phoneNumberId || '')
          setPhoneNumberId(dataDb.phoneNumberId || '')
          setWabaId(dataDb.wabaId || '')
          setBusinessId(dataDb.businessId || '')
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
      alertError('Configuración requerida', 'Falta NEXT_PUBLIC_API_URL en el frontend.')
      return
    }
    if (token) fetchEstado(token)

    // Leer ?success=1 al volver del callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      alertSuccess('¡Conexión realizada!', 'Tu cuenta de WhatsApp quedó vinculada.')
      localStorage.setItem('oauthDone', '1')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [token, fetchEstado])

  // ✅ Iniciar flujo OAuth desde el frontend con SCOPES correctos
  const iniciarOAuth = () => {
    if (!empresaId || !token) {
      alertInfo('Sesión requerida', 'Inicia sesión para conectar tu WhatsApp.')
      return
    }
    if (!API_URL || !META_APP_ID) {
      alertError('Config requerida', 'Falta NEXT_PUBLIC_API_URL o NEXT_PUBLIC_META_APP_ID')
      return
    }

    // Guardamos el JWT para usarlo en el callback
    localStorage.setItem('tempToken', token)
    localStorage.removeItem('oauthDone')

    const scope = [
      'whatsapp_business_messaging',
      'whatsapp_business_management',
      'business_management',
      'pages_show_list', // opcional
    ].join(',')

    setRedirecting(true)

    const url =
      `https://www.facebook.com/${FB_VERSION}/dialog/oauth` +
      `?client_id=${META_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&auth_type=rerequest`

    window.location.href = url
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
      alertError('No se pudo eliminar la conexión')
    }
  }

  const recargar = () => {
    if (!token) return
    fetchEstado(token)
  }

  const verDiagnostico = () => {
    const lines = [
      `• App suscrita: ${appSubscribed === null ? '—' : appSubscribed ? 'Sí' : 'No'}`,
      `• name_status: ${nameStatus ?? '—'}`,
      `• account_mode: ${accountMode ?? '—'}`
    ].join('\n')
    Swal.fire({
      icon: 'info',
      title: 'Diagnóstico de conexión',
      text: lines,
      background: '#111827',
      color: '#fff'
    })
  }

  const Badge = ({ children, color = 'slate' }: { children: any; color?: 'slate'|'yellow'|'green'|'red' }) => {
    const map: Record<string, string> = {
      slate: 'bg-slate-800 text-slate-300 border-slate-700',
      yellow: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
      green: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
      red: 'bg-red-900/40 text-red-300 border-red-700/50',
    }
    return <span className={`text-xs px-2 py-1 rounded border ${map[color]}`}>{children}</span>
  }

  return (
    <div className="w-full sm:max-w-xl mx-auto bg-gray-900 text-white rounded-xl shadow-md p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Conexión con WhatsApp</h2>
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
          <div className="flex items-center gap-2 mb-3">
            <p className="text-green-400 font-medium">✅ Conectado</p>
            {nameStatus === 'PENDING' && (
              <Badge color="yellow">Nombre para mostrar pendiente</Badge>
            )}
          </div>

          <div className="grid gap-2 text-sm bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Número</span>
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
            <div className="flex items-center justify-between">
              <span className="text-slate-400">App suscrita</span>
              <span className="font-medium">
                {appSubscribed === null ? '—' : appSubscribed ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">account_mode</span>
              <code className="text-slate-300">{accountMode || '—'}</code>
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
              onClick={verDiagnostico}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm flex items-center justify-center gap-2 border border-slate-700"
            >
              <Info className="w-4 h-4" />
              Ver diagnóstico
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
          <p className="text-yellow-400 font-medium mb-4">⚠️ No hay un número conectado</p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={iniciarOAuth}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm disabled:opacity-60"
              disabled={redirecting}
            >
              {redirecting ? 'Redirigiendo…' : 'Conectar con WhatsApp (OAuth)'}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Al conectar, selecciona tu negocio y el número de WhatsApp. Guardaremos en tu cuenta:
            <code> businessId</code>, <code>wabaId</code>, <code>phoneNumberId</code>, <code>displayPhoneNumber</code> y el <code>accessToken</code>.
          </p>
        </>
      )}
    </div>
  )
}
