'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { Trash2, RefreshCw, Send, Info } from 'lucide-react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../../context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL

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

  // Manual: registrar / enviar prueba
  const [pin, setPin] = useState('') // opcional
  const [testTo, setTestTo] = useState('')
  const [testBody, setTestBody] = useState('Hola! Prueba desde Wasaaa ✅')
  const [loadingRegister, setLoadingRegister] = useState(false)
  const [loadingSend, setLoadingSend] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(false)

  const alertError = (title: string, text?: string) =>
    Swal.fire({ icon: 'error', title, text, background: '#111827', color: '#fff' })

  const alertInfo = (title: string, html?: string) =>
    Swal.fire({ icon: 'info', title, html, background: '#111827', color: '#fff' })

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

        if (data?.conectado) {
          setEstado('conectado')
          setDisplayPhone(data.displayPhoneNumber || data.phoneNumberId || '')
          setPhoneNumberId(data.phoneNumberId || '')
          setWabaId(data.wabaId || '')
          setBusinessId(data.businessId || '')
          localStorage.removeItem('tempToken')
        } else {
          setEstado('desconectado')
          setDisplayPhone('')
          setPhoneNumberId('')
          setWabaId('')
          setBusinessId('')
        }
      } catch {
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

    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      alertSuccess('¡Conexión realizada!', 'Tu cuenta de WhatsApp quedó vinculada.')
      localStorage.setItem('oauthDone', '1')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [token, fetchEstado])

  // ---------- Acciones OAuth / Embedded ----------
  // (ACTUALIZADO) Forzamos redirect_uri al callback clásico
  const iniciarOAuth = () => {
    if (!empresaId || !token) {
      alertInfo('Sesión requerida', 'Inicia sesión para conectar tu WhatsApp.')
      return
    }
    if (!API_URL) return

    localStorage.setItem('tempToken', token)
    localStorage.removeItem('oauthDone')

    const redirect = encodeURIComponent(`${window.location.origin}/dashboard/callback`)
    setRedirecting(true)
    window.location.href = `${API_URL}/api/auth/whatsapp?auth_type=rerequest&redirect_uri=${redirect}`
  }

  // (NUEVO) Flujo rápido: siempre muestra formulario manual en callback-manual
  const iniciarOAuthManual = () => {
    if (!empresaId || !token) {
      alertInfo('Sesión requerida', 'Inicia sesión para conectar tu WhatsApp.')
      return
    }
    if (!API_URL) return
    localStorage.setItem('tempToken', token)
    const redirect = encodeURIComponent(`${window.location.origin}/dashboard/callback-manual`)
    window.location.href = `${API_URL}/api/auth/whatsapp?redirect_uri=${redirect}`
  }

  const abrirEmbeddedSignup = () => {
    if (!token) {
      alertInfo('Sesión requerida', 'Inicia sesión para continuar.')
      return
    }
    localStorage.setItem('tempToken', token)
    window.location.href = '/dashboard/callback'
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

  // ---------- Acciones Modo Manual ----------
  const registrarNumero = async () => {
    if (!token || !API_URL) return
    if (!phoneNumberId) return alertInfo('Falta ID', 'Ingresa el Phone Number ID')
    try {
      setLoadingRegister(true)
      const payload: any = { phoneNumberId }
      if (pin && pin.length === 6) payload.pin = pin
  
      const { data } = await axios.post(`${API_URL}/api/whatsapp/registrar`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data?.ok) {
        alertSuccess('Registro enviado', 'Espera 1–2 minutos y prueba el envío.')
      } else {
        const msg = typeof data?.error === 'object' ? JSON.stringify(data.error, null, 2) : (data?.error ?? '')
        alertError('No se pudo registrar', msg)
      }
    } catch (e: any) {
      const msg = e?.response?.data
        ? (typeof e.response.data === 'object' ? JSON.stringify(e.response.data, null, 2) : e.response.data)
        : e.message
      alertError('Error al registrar', msg)
    } finally {
      setLoadingRegister(false)
    }
  }

  const enviarPrueba = async () => {
    if (!token || !API_URL) return
    if (!phoneNumberId || !testTo || !testBody) {
      return alertInfo('Campos requeridos', 'ID, destinatario y mensaje son obligatorios.')
    }
    try {
      setLoadingSend(true)
      const { data } = await axios.post(
        `${API_URL}/api/whatsapp/enviar-prueba`,
        { phoneNumberId, to: testTo, body: testBody },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data?.ok) alertSuccess('Mensaje enviado', 'Revisa el celular destino.')
      else alertError('No se pudo enviar', JSON.stringify(data?.error ?? ''))
    } catch (e: any) {
      alertError('Error al enviar', e?.response?.data?.error || e.message)
    } finally {
      setLoadingSend(false)
    }
  }

  const consultarInfoNumero = async () => {
    if (!token || !API_URL) return
    if (!phoneNumberId) return alertInfo('Falta ID', 'Ingresa el Phone Number ID')
    try {
      setLoadingInfo(true)
      const { data } = await axios.get(`${API_URL}/api/whatsapp/numero/${phoneNumberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data?.ok) {
        const n = data.data || {}
        Swal.fire({
          icon: 'info',
          title: 'Información del número',
          html: `
            <div style="text-align:left">
              <div><b>display_phone_number:</b> ${n.display_phone_number ?? '—'}</div>
              <div><b>verified_name:</b> ${n.verified_name ?? '—'}</div>
              <div><b>name_status:</b> ${n.name_status ?? '—'}</div>
            </div>
          `,
          background: '#111827',
          color: '#fff'
        })
      } else {
        alertError('No se pudo consultar', JSON.stringify(data?.error ?? ''))
      }
    } catch (e: any) {
      alertError('Error al consultar', e?.response?.data?.error || e.message)
    } finally {
      setLoadingInfo(false)
    }
  }

  return (
    <div className="w-full sm:max-w-2xl mx-auto bg-gray-900 text-white rounded-xl shadow-md p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Conexión con WhatsApp</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={consultarInfoNumero}
            disabled={!phoneNumberId || loadingInfo}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm disabled:opacity-60"
            title="Consultar info del número"
          >
            <Info className="w-4 h-4" />
            {loadingInfo ? 'Consultando…' : 'Info número'}
          </button>
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
      </div>

      {estado === 'cargando' ? (
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="w-6 h-6 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-300">Verificando conexión…</span>
        </div>
      ) : (
        <>
          {estado === 'conectado' ? (
            <p className="text-green-400 font-medium mb-3">✅ Conectado</p>
          ) : (
            <p className="text-yellow-400 font-medium mb-3">⚠️ No hay un número conectado</p>
          )}

          <div className="grid gap-2 text-sm bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Número mostrado</span>
              <span className="font-medium">{displayPhone || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ID del número</span>
              <input
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Phone Number ID"
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-56 text-slate-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ID de la WABA</span>
              <code className="text-slate-300">{wabaId || '—'}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ID del negocio</span>
              <code className="text-slate-300">{businessId || '—'}</code>
            </div>
          </div>

          {/* MODO MANUAL: Registrar número */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2 text-sm">Registro del número (Cloud API)</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN de 6 dígitos (opcional)"
                className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                maxLength={6}
              />
              <button
                onClick={registrarNumero}
                disabled={loadingRegister || !phoneNumberId}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm disabled:opacity-60"
              >
                {loadingRegister ? 'Registrando…' : 'Registrar número'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Si el PIN no está habilitado aún, deja el campo vacío.
            </p>
          </div>

          {/* Enviar mensaje de prueba */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-sm">Enviar mensaje de prueba</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="Destino en formato E.164 (ej. +57300...)"
                className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm flex-1"
              />
              <input
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                placeholder="Mensaje"
                className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm flex-1"
              />
              <button
                onClick={enviarPrueba}
                disabled={loadingSend || !phoneNumberId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm flex items-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" /> {loadingSend ? 'Enviando…' : 'Enviar prueba'}
              </button>
            </div>
          </div>

          {/* Acciones de cuenta */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={iniciarOAuth}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm disabled:opacity-60"
              disabled={redirecting}
            >
              {redirecting ? 'Redirigiendo…' : 'Conectar con WhatsApp (OAuth)'}
            </button>
            <button
              onClick={iniciarOAuthManual}  
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-sm"
            >
              Conectar rápido (solo token)
            </button>
            <button
              onClick={abrirEmbeddedSignup}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm"
            >
              Conectar (Embedded Signup)
            </button>
            {estado === 'conectado' && (
              <button
                onClick={eliminarWhatsapp}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Desconectar
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Para listar WABAs/Números automáticamente se requiere el permiso{' '}
            <code>business_management</code>. Mientras tanto, usa el modo manual con el{' '}
            <code>Phone Number ID</code>.
          </p>
        </>
      )}
    </div>
  )
}
