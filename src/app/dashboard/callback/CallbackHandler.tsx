// app/dashboard/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const FB_VERSION = 'v20.0'

type WABA = { id: string; name?: string; owner_business_id?: string }
type Phone = { id: string; display_phone_number: string }
type WabaWithPhones = { waba: WABA; phones: Phone[] }

export default function CallbackPage() {
  const searchParams = useSearchParams()

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<WabaWithPhones[]>([])

  // Fallback manual
  const [manualOpen, setManualOpen] = useState(false)
  const [manualWabaId, setManualWabaId] = useState('')
  const [manualPhoneId, setManualPhoneId] = useState('')
  const [manualDisplay, setManualDisplay] = useState('')

  // Si Meta trae error por query, muéstralo
  useEffect(() => {
    const err = searchParams.get('error')
    const errDesc = searchParams.get('error_description')
    if (err) {
      Swal.fire({
        icon: 'error',
        title: 'OAuth error',
        text: errDesc || err,
        background: '#111827',
        color: '#fff'
      })
    }
  }, [searchParams])

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token')
    const code = searchParams.get('code')
    const wabaIdQS = searchParams.get('waba_id')
    const phoneIdQS = searchParams.get('phone_number_id')

    ;(async () => {
      try {
        // 💨 Ruta rápida (Embedded Signup) con code + waba_id + phone_number_id
        if (code && wabaIdQS && phoneIdQS) {
          const r = await axios.post<{ access_token: string }>(
            `${API_URL}/api/auth/exchange-code`,
            { code }
          )
          const at = r.data.access_token
          setAccessToken(at)

          // businessId desde la WABA
          const info = await axios.get(
            `https://graph.facebook.com/${FB_VERSION}/${wabaIdQS}?fields=owner_business_info&access_token=${at}`
          )
          const businessId: string = info.data?.owner_business_info?.id || 'unknown'

          // display_phone_number (opcional)
          let displayPhoneNumber = ''
          try {
            const pn = await axios.get(
              `https://graph.facebook.com/${FB_VERSION}/${wabaIdQS}/phone_numbers?fields=id,display_phone_number&access_token=${at}`
            )
            const match = (pn.data?.data || []).find((p: any) => p.id === phoneIdQS)
            displayPhoneNumber = match?.display_phone_number || ''
          } catch {
            // ignore
          }

          const jwt = localStorage.getItem('tempToken') || ''
          if (!jwt) throw new Error('Sesión expirada: inicia sesión e intenta de nuevo.')

          await axios.post(
            `${API_URL}/api/whatsapp/vincular`,
            {
              accessToken: at,
              wabaId: wabaIdQS,
              phoneNumberId: phoneIdQS,
              businessId,
              displayPhoneNumber
            },
            { headers: { Authorization: `Bearer ${jwt}` } }
          )

          localStorage.removeItem('tempToken')
          window.location.href = '/dashboard/settings?success=1'
          return
        }

        // Token directo soportado
        if (tokenFromQuery) {
          setAccessToken(tokenFromQuery)
          await loadAssetsViaBackend(tokenFromQuery)
        } else if (code) {
          // Intercambio code → token
          const r = await axios.post<{ access_token: string }>(
            `${API_URL}/api/auth/exchange-code`,
            { code }
          )
          const at = r.data.access_token
          setAccessToken(at)
          await loadAssetsViaBackend(at)
        } else {
          throw new Error('Missing token or code in callback URL')
        }
      } catch (err: any) {
        const msg =
          typeof err?.response?.data?.error === 'object'
            ? JSON.stringify(err.response.data.error)
            : err?.response?.data?.message ||
              err?.response?.data?.error ||
              err.message
        Swal.fire({
          icon: 'error',
          title: 'OAuth error',
          text: msg,
          background: '#111827',
          color: '#fff'
        })
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // (opcional) validación de permisos mínimos en el token
  const ensureWaPermissions = async (at: string): Promise<void> => {
    try {
      const { data } = await axios.get(
        `https://graph.facebook.com/${FB_VERSION}/me/permissions?access_token=${at}`
      )
      const list: Array<{ permission: string; status: string }> = data?.data || []
      const need = ['whatsapp_business_management', 'whatsapp_business_messaging']
      const missing = need.filter(
        (p) => !list.some((x) => x.permission === p && x.status === 'granted')
      )
      if (missing.length) throw new Error(`Faltan permisos: ${missing.join(', ')}`)
    } catch (e: any) {
      throw new Error(e?.response?.data?.error?.message || 'No se pudieron validar permisos')
    }
  }

  // 🚀 Carga desde backend (con fallback y modo debug)
  const loadAssetsViaBackend = async (at: string): Promise<void> => {
    await ensureWaPermissions(at)
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/wabas`, {
        params: { token: at, debug: 1 } // 👈 modo debug
      })
      // data.items => [{ waba:{id,name}, phones:[{id,display_phone_number}] }]
      const mapped: WabaWithPhones[] = (data.items || []).map((item: any) => ({
        waba: {
          id: item.waba?.id,
          name: item.waba?.name,
          owner_business_id: item.waba?.owner_business_id // puede venir vacío
        },
        phones: (item.phones || []).map((p: any) => ({
          id: p.id,
          display_phone_number: p.display_phone_number
        }))
      }))
      setItems(mapped)
      if (!mapped.length && data.note) {
        Swal.fire({
          icon: 'info',
          title: 'Sin WABAs visibles',
          html:
            `${data.note}<br/><br/>Prueba con <b>Embedded Signup</b> si no tienes acceso directo a la WABA.`,
          background: '#111827',
          color: '#fff'
        })
      }
      if (data?.diagnostics) {
        // útil para investigar en consola
        // eslint-disable-next-line no-console
        console.log('[wabas diagnostics]', data.diagnostics)
      }
    } catch (e: any) {
      const status = e?.response?.status
      const payload = e?.response?.data
      const diag = payload?.diagnostics
      const meta = payload?.meta

      if (status === 403 && payload?.errorCode === 3) {
        const missing = diag?.permissions?.missing?.join(', ') || '—'
        Swal.fire({
          icon: 'warning',
          title: 'Permisos insuficientes en la WABA',
          html:
            'Tu usuario no tiene permisos completos sobre la cuenta de WhatsApp Business.<br/>' +
            'Actívalos en Business Manager (Control total + acceso a “Cuentas de WhatsApp”).<br/>' +
            'O usa el flujo <b>Embedded Signup</b> para continuar.<br/><br/>' +
            `<code style="font-size:12px">Missing: ${missing}</code><br/>` +
            (meta?.message ? `<code style="font-size:12px">${meta.message}</code>` : ''),
          background: '#111827',
          color: '#fff',
          confirmButtonText: 'Entendido'
        })
      } else {
        const txt =
          typeof payload?.error === 'object'
            ? JSON.stringify(payload.error)
            : payload?.message || payload?.error || e.message

        Swal.fire({
          icon: 'error',
          title: 'No se pudieron cargar WABAs',
          html:
            `${txt ? `<div style="margin-bottom:6px">${txt}</div>` : ''}` +
            (meta?.message ? `<code style="font-size:12px">${meta.message}</code>` : ''),
          background: '#111827',
          color: '#fff'
        })
      }

      if (diag) {
        // eslint-disable-next-line no-console
        console.log('[wabas diagnostics]', diag)
      }
      setItems([])
      throw e
    }
  }

  const connectPhone = async (waba: WABA, phone: Phone): Promise<void> => {
    const jwt = localStorage.getItem('tempToken') || ''
    if (!jwt || !accessToken) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Vuelve a iniciar la conexión.',
        background: '#111827',
        color: '#fff'
      })
      return
    }
    try {
      await axios.post(
        `${API_URL}/api/whatsapp/vincular`,
        {
          businessId: waba.owner_business_id || 'unknown',
          wabaId: waba.id,
          phoneNumberId: phone.id,
          displayPhoneNumber: phone.display_phone_number,
          accessToken
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )
      Swal.fire({
        icon: 'success',
        title: 'Número conectado',
        background: '#111827',
        color: '#fff'
      })
      localStorage.removeItem('tempToken')
      window.location.href = '/dashboard/settings?success=1'
    } catch (e: any) {
      const txt =
        typeof e?.response?.data?.error === 'object'
          ? JSON.stringify(e.response.data.error)
          : e?.response?.data?.error || e.message
      Swal.fire({
        icon: 'error',
        title: 'No se pudo conectar',
        text: txt,
        background: '#111827',
        color: '#fff'
      })
    }
  }

  // Fallback manual (por si el backend no encuentra nada)
  const submitManual = async (): Promise<void> => {
    if (!accessToken) {
      Swal.fire({
        icon: 'error',
        title: 'Sin token',
        text: 'Repite la conexión.',
        background: '#111827',
        color: '#fff'
      })
      return
    }
    const jwt = localStorage.getItem('tempToken') || ''
    if (!jwt) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        text: 'Inicia sesión nuevamente.',
        background: '#111827',
        color: '#fff'
      })
      return
    }
    if (!manualWabaId || !manualPhoneId || !manualDisplay) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Completa todos los campos.',
        background: '#111827',
        color: '#fff'
      })
      return
    }

    try {
      const info = await axios.get(
        `https://graph.facebook.com/${FB_VERSION}/${manualWabaId}?fields=owner_business_info&access_token=${accessToken}`
      )
      const businessId: string = info.data?.owner_business_info?.id || 'unknown'

      await axios.post(
        `${API_URL}/api/whatsapp/vincular`,
        {
          businessId,
          wabaId: manualWabaId,
          phoneNumberId: manualPhoneId,
          displayPhoneNumber: manualDisplay,
          accessToken
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )
      Swal.fire({
        icon: 'success',
        title: 'Número conectado (manual)',
        background: '#111827',
        color: '#fff'
      })
      localStorage.removeItem('tempToken')
      window.location.href = '/dashboard/settings?success=1'
    } catch (e: any) {
      const txt =
        typeof e?.response?.data?.error === 'object'
          ? JSON.stringify(e.response.data.error)
          : e?.response?.data?.error || e.message
      Swal.fire({
        icon: 'error',
        title: 'No se pudo conectar',
        text: txt,
        background: '#111827',
        color: '#fff'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Conectando tu WhatsApp Business</h1>

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
            <span>Obteniendo tus WABAs y números…</span>
          </div>
        ) : !accessToken ? (
          <p className="text-red-400">No se pudo obtener el access token.</p>
        ) : items.length === 0 ? (
          <div className="space-y-4">
            <p className="text-slate-300">No encontramos WABAs o no hay números visibles.</p>
            <button
              onClick={() => setManualOpen(!manualOpen)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
            >
              {manualOpen ? 'Ocultar modo manual' : 'Usar modo manual'}
            </button>

            {manualOpen && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 grid gap-3">
                <div>
                  <label className="text-sm text-slate-300">WABA ID</label>
                  <input
                    value={manualWabaId}
                    onChange={(e) => setManualWabaId(e.target.value)}
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                    placeholder="Ej: 123456789012345"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Phone Number ID</label>
                  <input
                    value={manualPhoneId}
                    onChange={(e) => setManualPhoneId(e.target.value)}
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                    placeholder="Ej: 987654321098765"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Display Phone Number</label>
                  <input
                    value={manualDisplay}
                    onChange={(e) => setManualDisplay(e.target.value)}
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                    placeholder="+57 300 000 0000"
                  />
                </div>
                <button
                  onClick={submitManual}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-sm"
                >
                  Vincular manualmente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {items.map(({ waba, phones }) => (
              <div key={waba.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg">{waba.name || 'WABA sin nombre'}</h2>
                  <div className="text-xs text-slate-400">
                    WABA ID: {waba.id}
                    {waba.owner_business_id ? ` · Business ID: ${waba.owner_business_id}` : ''}
                  </div>
                </div>

                {phones.length === 0 ? (
                  <p className="text-slate-400">No hay números en esta WABA.</p>
                ) : (
                  <div className="mt-2 grid gap-2">
                    {phones.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2"
                      >
                        <div>
                          <div className="text-sm">{p.display_phone_number}</div>
                          <div className="text-xs text-slate-500">Phone ID: {p.id}</div>
                        </div>
                        <button
                          onClick={() => connectPhone(waba, p)}
                          className="text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded"
                        >
                          Usar este número
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={() => setManualOpen(!manualOpen)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs"
              >
                {manualOpen ? 'Ocultar modo manual' : 'No veo mi número · Modo manual'}
              </button>
              {manualOpen && (
                <div className="mt-3 bg-slate-800 border border-slate-700 rounded-xl p-4 grid gap-3">
                  <div>
                    <label className="text-sm text-slate-300">WABA ID</label>
                    <input
                      value={manualWabaId}
                      onChange={(e) => setManualWabaId(e.target.value)}
                      className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      placeholder="Ej: 123456789012345"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Phone Number ID</label>
                    <input
                      value={manualPhoneId}
                      onChange={(e) => setManualPhoneId(e.target.value)}
                      className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      placeholder="Ej: 987654321098765"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Display Phone Number</label>
                    <input
                      value={manualDisplay}
                      onChange={(e) => setManualDisplay(e.target.value)}
                      className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                      placeholder="+57 300 000 0000"
                    />
                  </div>
                  <button
                    onClick={submitManual}
                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-sm"
                  >
                    Vincular manualmente
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
