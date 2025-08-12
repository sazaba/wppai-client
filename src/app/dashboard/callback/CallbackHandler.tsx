// app/dashboard/callback/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
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
  const mounted = useRef(true)

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<WabaWithPhones[]>([])

  // Modo manual
  const [manualOpen, setManualOpen] = useState(false)
  const [manualWabaId, setManualWabaId] = useState('')
  const [manualPhoneId, setManualPhoneId] = useState('')
  const [manualDisplay, setManualDisplay] = useState('')

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // Si Meta trae error
  useEffect(() => {
    const err = searchParams.get('error')
    const errDesc = searchParams.get('error_description')
    if (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de OAuth',
        text: errDesc || err,
        background: '#111827',
        color: '#fff'
      })
    }
  }, [searchParams])

  // Helper: intenta /vincular, y si falta info, cae a /vincular-manual
  async function vincularFlexible(
    jwt: string,
    payload: {
      accessToken: string
      wabaId?: string
      phoneNumberId?: string
      displayPhoneNumber?: string
      businessId?: string
    }
  ) {
    try {
      await axios.post(`${API_URL}/api/whatsapp/vincular`, payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
    } catch (e: any) {
      const status = e?.response?.status
      const msg = e?.response?.data?.error || ''
      if (status === 400 && /Faltan datos/i.test(String(msg))) {
        await axios.post(`${API_URL}/api/whatsapp/vincular-manual`, payload, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
      } else {
        throw e
      }
    }
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        if (!API_URL) throw new Error('Falta NEXT_PUBLIC_API_URL')

        // 1) Embedded Signup (code + waba_id + phone_number_id)
        const code = searchParams.get('code')
        const wabaIdQS = searchParams.get('waba_id')
        const phoneIdQS = searchParams.get('phone_number_id')
        if (code && wabaIdQS && phoneIdQS) {
          const r = await axios.post<{ access_token: string }>(`${API_URL}/api/auth/exchange-code`, { code })
          const at = r.data.access_token
          setAccessToken(at)

          // Business owner de la WABA
          let businessId = 'unknown'
          try {
            const info = await axios.get(
              `https://graph.facebook.com/${FB_VERSION}/${wabaIdQS}?fields=owner_business_info&access_token=${at}`
            )
            businessId = info.data?.owner_business_info?.id || 'unknown'
          } catch {}

          // Display del número
          let displayPhoneNumber = ''
          try {
            const pn = await axios.get(
              `https://graph.facebook.com/${FB_VERSION}/${wabaIdQS}/phone_numbers?fields=id,display_phone_number&access_token=${at}`
            )
            const match = (pn.data?.data || []).find((p: any) => p.id === phoneIdQS)
            displayPhoneNumber = match?.display_phone_number || ''
          } catch {}

          const jwt = localStorage.getItem('tempToken') || ''
          if (!jwt) throw new Error('Sesión expirada')

          await vincularFlexible(jwt, {
            accessToken: at,
            wabaId: wabaIdQS,
            phoneNumberId: phoneIdQS,
            businessId,
            displayPhoneNumber,
          })

          localStorage.removeItem('tempToken')
          window.location.href = '/dashboard/settings?success=1'
          return
        }

        // 2) Token directo (?token) o intercambio por code
        let at = searchParams.get('token')
        if (!at) {
          const code2 = searchParams.get('code')
          if (code2) {
            const r = await axios.post<{ access_token: string }>(`${API_URL}/api/auth/exchange-code`, { code: code2 })
            at = r.data.access_token
          }
        }
        if (!at) throw new Error('Falta token o code en el callback')
        setAccessToken(at)

        // 3) Revisa permisos — si falta business_management, habilita modo manual y NO bloquea
        const scopes = await checkScopes(at)
        const hasBM = scopes.granted.includes('business_management')
        const hasWbm = scopes.granted.includes('whatsapp_business_management')
        const hasWmsg = scopes.granted.includes('whatsapp_business_messaging')

        if (!hasWmsg || !hasWbm) {
          throw new Error('Faltan permisos de WhatsApp (messaging o management). Vuelve a conectar.')
        }

        if (hasBM) {
          // 4) Con business_management: cargar WABAs y teléfonos por backend
          await loadAssetsViaBackend(at)
        } else {
          // Sin business_management: abrir modo manual automáticamente
          setManualOpen(true)
          const hintWaba = searchParams.get('waba_hint')
          const hintPhone = searchParams.get('phone_hint')
          const hintDisplay = searchParams.get('display_hint')
          if (hintWaba) setManualWabaId(hintWaba)
          if (hintPhone) setManualPhoneId(hintPhone)
          if (hintDisplay) setManualDisplay(hintDisplay)
          Swal.fire({
            icon: 'info',
            title: 'Permiso parcial',
            text: 'No tienes business_management. Usa el modo manual con WABA ID y Phone Number ID.',
            background: '#111827',
            color: '#fff'
          })
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
          title: 'Error en el callback',
          text: msg,
          background: '#111827',
          color: '#fff'
        })
      } finally {
        if (mounted.current) setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkScopes = async (
    at: string
  ): Promise<{ ok: boolean; missing: string[]; granted: string[] }> => {
    const { data } = await axios.get(
      `https://graph.facebook.com/${FB_VERSION}/me/permissions?access_token=${at}`
    )
    const list: Array<{ permission: string; status: string }> = data?.data || []
    const need = ['whatsapp_business_management', 'whatsapp_business_messaging'] // business_management opcional
    const granted = list.filter((x) => x.status === 'granted').map((x) => x.permission)
    const missing = need.filter((p) => !granted.includes(p))
    return { ok: missing.length === 0, missing, granted }
  }

  const loadAssetsViaBackend = async (at: string): Promise<void> => {
    const { data } = await axios.get(`${API_URL}/api/auth/wabas`, {
      params: { token: at, debug: 1 }
    })
    const mapped: WabaWithPhones[] = (data.items || []).map((item: any) => ({
      waba: { id: item.waba?.id, name: item.waba?.name, owner_business_id: item.waba?.owner_business_id },
      phones: (item.phones || []).map((p: any) => ({ id: p.id, display_phone_number: p.display_phone_number }))
    }))
    setItems(mapped)

    if (!mapped.length) {
      Swal.fire({
        icon: 'info',
        title: 'No encontramos WABAs o números',
        text: 'Verifica permisos o usa el modo manual con los IDs.',
        background: '#111827',
        color: '#fff'
      })
      setManualOpen(true)
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
    await vincularFlexible(jwt, {
      accessToken,
      wabaId: waba.id,
      phoneNumberId: phone.id,
      displayPhoneNumber: phone.display_phone_number,
      businessId: waba.owner_business_id || 'unknown',
    })
    Swal.fire({ icon: 'success', title: 'Número conectado', background: '#111827', color: '#fff' })
    localStorage.removeItem('tempToken')
    window.location.href = '/dashboard/settings?success=1'
  }

  const submitManual = async (): Promise<void> => {
    if (!accessToken) {
      Swal.fire({ icon: 'error', title: 'Sin token', text: 'Repite la conexión.', background: '#111827', color: '#fff' })
      return
    }
    const jwt = localStorage.getItem('tempToken') || ''
    if (!jwt) {
      Swal.fire({ icon: 'error', title: 'Sesión expirada', text: 'Vuelve a conectar.', background: '#111827', color: '#fff' })
      return
    }
    if (!manualWabaId || !manualPhoneId || !manualDisplay) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa WABA ID, Phone Number ID y número mostrado.', background: '#111827', color: '#fff' })
      return
    }

    // Intentar descubrir businessId del owner de la WABA
    let businessId = 'unknown'
    try {
      const info = await axios.get(
        `https://graph.facebook.com/${FB_VERSION}/${manualWabaId}?fields=owner_business_info&access_token=${accessToken}`
      )
      businessId = info.data?.owner_business_info?.id || 'unknown'
    } catch {}

    await vincularFlexible(jwt, {
      accessToken,
      wabaId: manualWabaId,
      phoneNumberId: manualPhoneId,
      displayPhoneNumber: manualDisplay,
      businessId,
    })
    Swal.fire({ icon: 'success', title: 'Número conectado (manual)', background: '#111827', color: '#fff' })
    localStorage.removeItem('tempToken')
    window.location.href = '/dashboard/settings?success=1'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Conectando tu WhatsApp Business</h1>

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
            <span>Procesando OAuth…</span>
          </div>
        ) : !accessToken ? (
          <p className="text-red-400">No se pudo obtener el access token.</p>
        ) : items.length > 0 ? (
          // Listado (cuando sí hay business_management)
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
          </div>
        ) : (
          // Modo manual (cuando falta business_management o no hubo resultados)
          <div className="space-y-4">
            {!manualOpen && (
              <button
                onClick={() => setManualOpen(true)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                Usar modo manual
              </button>
            )}
            {manualOpen && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 grid gap-3">
                <div>
                  <label className="text-sm text-slate-300">WABA ID</label>
                  <input
                    value={manualWabaId}
                    onChange={(e) => setManualWabaId(e.target.value)}
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                    placeholder="Ej: 3601170550016999"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Phone Number ID</label>
                  <input
                    value={manualPhoneId}
                    onChange={(e) => setManualPhoneId(e.target.value)}
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                    placeholder="Ej: 714875248379508"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Número mostrado</label>
                  <input
                    value={manualDisplay}
                    onChange={(e) => setManualDisplay(e.target.value)}
                    className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                    placeholder="+57 314 8936662"
                  />
                </div>
                <button
                  onClick={submitManual}
                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-sm"
                >
                  Conectar manualmente
                </button>
                <p className="text-xs text-slate-500">
                  Si aún no ves el Phone Number ID, ábrelo en WhatsApp Manager y cópialo (o usa el método de
                  “Network” que ya probamos).
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
