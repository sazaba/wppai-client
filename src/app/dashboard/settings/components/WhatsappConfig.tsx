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

  // Token de System User
  const [systemToken, setSystemToken] = useState('')
  const [savingToken, setSavingToken] = useState(false)
  const [syncingIds, setSyncingIds] = useState(false)

  // Manual: registrar / enviar prueba
  const [pin, setPin] = useState('') // opcional
  const [testTo, setTestTo] = useState('')
  const [testBody, setTestBody] = useState('Hola! Prueba desde Wasaaa ✅')
  const [loadingRegister, setLoadingRegister] = useState(false)
  const [loadingSend, setLoadingSend] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(false)

  // utilidades
  const [loadingReqCode, setLoadingReqCode] = useState(false)
  const [loadingVerify, setLoadingVerify] = useState(false)
  const [loadingDebug, setLoadingDebug] = useState(false)
  const [loadingHealth, setLoadingHealth] = useState(false)

  const alertError = (title: string, payload?: any) => {
    let html = ''
    try { html = `<pre style="text-align:left;white-space:pre-wrap">${JSON.stringify(payload, null, 2)}</pre>` }
    catch { html = String(payload || '') }
    return Swal.fire({ icon: 'error', title, html, background: '#111827', color: '#fff', width: 700 })
  }
  const alertInfo = (title: string, payload?: any) => {
    let html = ''
    try { html = `<pre style="text-align:left;white-space:pre-wrap">${JSON.stringify(payload, null, 2)}</pre>` }
    catch { html = String(payload || '') }
    return Swal.fire({ icon: 'info', title, html, background: '#111827', color: '#fff', width: 700 })
  }
  const alertSuccess = (title: string, text?: string) =>
    Swal.fire({ icon: 'success', title, text, background: '#111827', color: '#fff', confirmButtonColor: '#10b981' })

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

  // ---------- Guardar System User Token ----------
  const guardarSystemToken = async () => {
    if (!token || !API_URL) return
    if (!systemToken || systemToken.length < 50) {
      return alertInfo('Token requerido', 'Pega el System User token completo.')
    }
    try {
      setSavingToken(true)
      await axios.post(`${API_URL}/api/whatsapp/vincular-manual`,
        { accessToken: systemToken, wabaId: wabaId || '', phoneNumberId: phoneNumberId || '', displayPhoneNumber: displayPhone || '', businessId: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSystemToken('')
      await alertSuccess('Token guardado', 'El System User token quedó almacenado.')
    } catch (e:any) {
      alertError('No se pudo guardar el token', e?.response?.data || e?.message)
    } finally {
      setSavingToken(false)
    }
  }

  // ---------- Validar y persistir IDs (WABA + Phone) ----------
  const sincronizarIds = async () => {
    if (!token || !API_URL) return
    if (!wabaId || !phoneNumberId) {
      return alertInfo('Faltan datos', 'Completa WABA ID y Phone Number ID.')
    }
    try {
      setSyncingIds(true)
      await axios.post(`${API_URL}/api/whatsapp/actualizar-datos`,
        { wabaId, phoneNumberId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await alertSuccess('IDs validados', 'WABA y Phone Number actualizados y validados contra Meta.')
      fetchEstado(token)
    } catch (e:any) {
      alertError('No se pudo validar/persistir', e?.response?.data || e?.message)
    } finally {
      setSyncingIds(false)
    }
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

  // ---------- Cloud API: registrar / enviar / info ----------
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
        alertError('No se pudo registrar', data?.error || data)
      }
    } catch (e: any) {
      const payload = e?.response?.data?.error || e?.response?.data || e?.message || e
      alertError('Error al registrar', payload)
    } finally {
      setLoadingRegister(false)
    }
  }

  const enviarPrueba = async () => {
    if (!token || !API_URL) return
    if (!phoneNumberId || !testTo || !testBody) {
      return alertInfo('Campos requeridos', 'ID, destinatario y mensaje son obligatorios.')
    }
    const toSanitized = String(testTo).replace(/\D+/g, '')
    try {
      setLoadingSend(true)
      const { data } = await axios.post(
        `${API_URL}/api/whatsapp/enviar-prueba`,
        { phoneNumberId, to: toSanitized, body: testBody },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data?.ok) return alertSuccess('Mensaje enviado', 'Revisa el celular destino.')
      return alertError('No se pudo enviar', data?.error || data)
    } catch (e: any) {
      const payload = e?.response?.data?.error || e?.response?.data || e?.message || e
      return alertError('Error al enviar', payload)
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
              <div><b>wa_id:</b> ${n.wa_id ?? '—'}</div>
              <div><b>account_mode:</b> ${n.account_mode ?? '—'}</div>
            </div>
          `,
          background: '#111827',
          color: '#fff'
        })
      } else {
        alertError('No se pudo consultar', data?.error || data)
      }
    } catch (e: any) {
      alertError('Error al consultar', e?.response?.data?.error || e.message)
    } finally {
      setLoadingInfo(false)
    }
  }

  // ---------- utilidades ----------
  const requestCode = async () => {
    if (!token || !API_URL) return
    if (!phoneNumberId) return alertInfo('Falta ID', 'Ingresa el Phone Number ID')

    const { value: method } = await Swal.fire({
      title: 'Método para recibir código',
      input: 'select',
      inputOptions: { SMS: 'SMS', VOICE: 'VOZ' },
      inputValue: 'SMS',
      showCancelButton: true,
      background: '#111827',
      color: '#fff'
    })
    if (!method) return

    const { value: locale } = await Swal.fire({
      title: 'Locale',
      input: 'text',
      inputLabel: 'ej: es_CO, es_ES, en_US',
      inputValue: 'es_CO',
      showCancelButton: true,
      background: '#111827',
      color: '#fff'
    })
    if (!locale) return

    try {
      setLoadingReqCode(true)
      const { data } = await axios.post(
        `${API_URL}/api/whatsapp/request-code`,
        { phoneNumberId, method, locale },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data?.ok) return alertSuccess('Código solicitado', 'Revisa el canal elegido.')
      return alertError('No se pudo solicitar código', data?.error || data)
    } catch (e: any) {
      const payload = e?.response?.data?.error || e?.response?.data || e?.message || e
      return alertError('Error al solicitar código', payload)
    } finally {
      setLoadingReqCode(false)
    }
  }

  const verifyCode = async () => {
    if (!token || !API_URL) return
    if (!phoneNumberId) return alertInfo('Falta ID', 'Ingresa el Phone Number ID')

    const { value: code } = await Swal.fire({
      title: 'Ingresa el código recibido',
      input: 'text',
      inputPlaceholder: '######',
      inputAttributes: { maxlength: '6', inputmode: 'numeric' },
      showCancelButton: true,
      background: '#111827',
      color: '#fff'
    })
    if (!code) return

    try {
      setLoadingVerify(true)
      const { data } = await axios.post(
        `${API_URL}/api/whatsapp/verify-code`,
        { phoneNumberId, code },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data?.ok) return alertSuccess('Código verificado', 'Ahora puedes registrar el número si Meta exige PIN.')
      return alertError('No se pudo verificar el código', data?.error || data)
    } catch (e: any) {
      const payload = e?.response?.data?.error || e?.response?.data || e?.message || e
      return alertError('Error al verificar código', payload)
    } finally {
      setLoadingVerify(false)
    }
  }

  const debugToken = async () => {
    if (!token || !API_URL) return
    try {
      setLoadingDebug(true)
      const { data } = await axios.get(`${API_URL}/api/whatsapp/debug-token`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data?.ok) return alertInfo('Debug token', data?.data)
      return alertError('No se pudo depurar token', data?.error || data)
    } catch (e: any) {
      const payload = e?.response?.data?.error || e?.response?.data || e?.message || e
      return alertError('Error en debug token', payload)
    } finally {
      setLoadingDebug(false)
    }
  }

  const health = async () => {
    if (!token || !API_URL) return
    try {
      setLoadingHealth(true)
      const { data } = await axios.get(`${API_URL}/api/whatsapp/health`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data?.ok) return alertInfo('Health', data)
      return alertError('Health con error', data?.error || data)
    } catch (e: any) {
      const payload = e?.response?.data?.error || e?.response?.data || e?.message || e
      return alertError('Error en health', payload)
    } finally {
      setLoadingHealth(false)
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

          {/* Bloque: guardar System User Token */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2 text-sm">System User Token</h3>
            <textarea
              value={systemToken}
              onChange={(e)=>setSystemToken(e.target.value)}
              placeholder="Pega aquí tu System User access token"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs h-24"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={guardarSystemToken}
                disabled={savingToken}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm disabled:opacity-60"
              >
                {savingToken ? 'Guardando…' : 'Guardar token'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Este token es el que usa la app para enviar mensajes. No es el token del callback de OAuth.
            </p>
          </div>

          {/* Estado actual + IDs */}
          <div className="grid gap-2 text-sm bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Número mostrado</span>
              <input
                value={displayPhone}
                onChange={(e)=>setDisplayPhone(e.target.value)}
                placeholder="+57 314 893 6662"
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-56 text-slate-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Phone Number ID</span>
              <input
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="712725021933030"
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-56 text-slate-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">WABA ID</span>
              <input
                value={wabaId}
                onChange={(e)=>setWabaId(e.target.value)}
                placeholder="1384287482665374"
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-56 text-slate-200"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Business ID</span>
              <code className="text-slate-300">{businessId || '—'}</code>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={async () => {
                  if (!token || !API_URL) return
                  try {
                    await axios.post(`${API_URL}/api/whatsapp/vincular-manual`,
                      { accessToken: '', wabaId, phoneNumberId, displayPhoneNumber: displayPhone, businessId: '' },
                      { headers: { Authorization: `Bearer ${token}` } }
                    )
                    alertSuccess('Actualizado', 'Número mostrado guardado.')
                  } catch (e:any) {
                    alertError('No se pudo actualizar el número mostrado', e?.response?.data || e?.message)
                  }
                }}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm"
              >
                Guardar display
              </button>
              <button
                onClick={sincronizarIds}
                disabled={syncingIds}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm disabled:opacity-60"
              >
                {syncingIds ? 'Validando…' : 'Validar y guardar IDs'}
              </button>
            </div>
          </div>

          {/* Registro número (Cloud API) */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2 text-sm">Registro del número (Cloud API)</h3>

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
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

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={requestCode}
                disabled={loadingReqCode || !phoneNumberId}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm disabled:opacity-60"
              >
                {loadingReqCode ? 'Solicitando…' : 'Solicitar código'}
              </button>
              <button
                onClick={verifyCode}
                disabled={loadingVerify || !phoneNumberId}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm disabled:opacity-60"
              >
                {loadingVerify ? 'Verificando…' : 'Verificar código'}
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Flujo típico: Solicitar código → Verificar código → Registrar (con PIN si Meta lo exige).
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
              Conectar rápido (solo IDs)
            </button>
            <button
              onClick={abrirEmbeddedSignup}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm"
            >
              Conectar (Embedded Signup)
            </button>

            <button
              onClick={debugToken}
              disabled={loadingDebug}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm disabled:opacity-60"
            >
              {loadingDebug ? 'Debug…' : 'Debug token'}
            </button>
            <button
              onClick={health}
              disabled={loadingHealth}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm disabled:opacity-60"
            >
              {loadingHealth ? 'Health…' : 'Health'}
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
            Para listar WABAs/Números automáticamente se requiere el permiso <code>business_management</code>.
            Mientras tanto, usa el modo manual con el <code>Phone Number ID</code> y valida con “Validar y guardar IDs”.
          </p>
        </>
      )}
    </div>
  )
}
