'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL
// Sugerencia: alinear con el backend (usa v23.0 si tu server también la usa)
const FB_VERSION = process.env.NEXT_PUBLIC_FB_VERSION || 'v23.0'

type WABA = { id: string; name?: string; owner_business_id?: string }
type Phone = { id: string; display_phone_number: string }
type WabaWithPhones = { waba: WABA; phones: Phone[] }

export default function CallbackPage() {
  const searchParams = useSearchParams()
  const mounted = useRef(true)

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<WabaWithPhones[]>([])
  const [connectingId, setConnectingId] = useState<string | null>(null) // loading por teléfono

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const err = searchParams.get('error')
    const errDesc = searchParams.get('error_description')
    if (err) {
      Swal.fire({
        icon: 'error',
        title: 'OAuth error',
        text: errDesc || err,
        background: '#111827',
        color: '#fff',
      })
    }
  }, [searchParams])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        if (!API_URL) throw new Error('Falta NEXT_PUBLIC_API_URL')

        // 1) Obtener access token: ?token o code -> exchange
        let at = searchParams.get('token')
        const code = searchParams.get('code')
        if (!at && code) {
          const r = await axios.post<{ access_token: string }>(
            `${API_URL}/api/auth/exchange-code`,
            { code }
          )
          at = r.data.access_token
        }
        if (!at) throw new Error('No se recibió token ni code en el callback.')
        setAccessToken(at)

        // 2) Validar permisos requeridos
        const { data: perms } = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/me/permissions`,
          { params: { access_token: at } }
        )
        const granted: string[] = (perms?.data || [])
          .filter((x: any) => x.status === 'granted')
          .map((x: any) => x.permission)
        const need = [
          'business_management',
          'whatsapp_business_management',
          'whatsapp_business_messaging',
        ]
        const missing = need.filter((p) => !granted.includes(p))
        if (missing.length) throw new Error(`Faltan permisos: ${missing.join(', ')}`)

        // 3) Cargar Businesses → WABAs → Phones desde backend
        const { data } = await axios.get(`${API_URL}/api/auth/wabas`, {
          params: { token: at, debug: 1 },
        })
        const mapped: WabaWithPhones[] = (data.items || []).map((item: any) => ({
          waba: {
            id: item.waba?.id,
            name: item.waba?.name,
            owner_business_id: item.waba?.owner_business_id,
          },
          phones: (item.phones || []).map((p: any) => ({
            id: p.id,
            display_phone_number: p.display_phone_number,
          })),
        }))
        setItems(mapped)

        if (!mapped.length) {
          Swal.fire({
            icon: 'info',
            title: 'No encontramos WABAs o números',
            text: 'Verifica acceso a la WABA y que existan números en la cuenta.',
            background: '#111827',
            color: '#fff',
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
          color: '#fff',
        })
      } finally {
        if (mounted.current) setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectPhone = async (waba: WABA, phone: Phone): Promise<void> => {
    const jwt = localStorage.getItem('tempToken') || ''
    if (!jwt) {
      await Swal.fire({
        icon: 'error',
        title: 'Sesión expirada',
        html: 'No encontramos tu sesión (<code>tempToken</code>). Vuelve a iniciar la conexión desde <b>Settings → Conectar WhatsApp</b>.',
        background: '#111827',
        color: '#fff',
      })
      return
    }
    if (!accessToken) {
      await Swal.fire({
        icon: 'error',
        title: 'Token de Meta faltante',
        text: 'Refresca la página o repite el flujo.',
        background: '#111827',
        color: '#fff',
      })
      return
    }

    try {
      setConnectingId(phone.id)

      // Resolver owner_business_id si faltara
      let businessId = waba.owner_business_id || ''
      if (!businessId) {
        try {
          const info = await axios.get(
            `https://graph.facebook.com/${FB_VERSION}/${waba.id}`,
            { params: { fields: 'owner_business_info', access_token: accessToken } }
          )
          businessId = info.data?.owner_business_info?.id || ''
        } catch {}
      }

      // 1) Vincular (suscribe app + guarda credenciales)
      await axios.post(
        `${API_URL}/api/whatsapp/vincular`,
        {
          accessToken: accessToken,
          wabaId: waba.id,
          phoneNumberId: phone.id,
          businessId,
          displayPhoneNumber: phone.display_phone_number,
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      // 2) Chequeo de conexión real (nuevo)
      const estadoDet = await axios.get(`${API_URL}/api/whatsapp/estado-detallado`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })

      const connected = Boolean(estadoDet?.data?.connected)
      if (connected) {
        await Swal.fire({
          icon: 'success',
          title: 'Número conectado',
          text: `Listo. ${phone.display_phone_number} quedó conectado.`,
          background: '#111827',
          color: '#fff',
        })
        localStorage.removeItem('tempToken')
        window.location.href = '/dashboard/settings?success=1'
        return
      }

      // Si no quedó conectado, mostramos diagnóstico y no marcamos éxito
      const diag = estadoDet?.data?.diagnostics || {}
      const msg = [
        'No pudimos confirmar la conexión.',
        diag.appSubscribed === false ? '• La app no figura suscrita al WABA.' : '',
        diag?.number?.wa_id ? '' : '• El número no devuelve wa_id.',
        diag?.number?.name_status ? `• name_status: ${diag.number.name_status}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      await Swal.fire({
        icon: 'warning',
        title: 'Verificación incompleta',
        text: msg || 'Reintenta en unos segundos.',
        background: '#111827',
        color: '#fff',
      })
    } catch (e: any) {
      const raw = e?.response?.data
      const msg =
        typeof raw?.error === 'object'
          ? raw?.error?.message || JSON.stringify(raw.error)
          : raw?.error || e?.message || 'Error al vincular número'
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo conectar',
        text: String(msg),
        background: '#111827',
        color: '#fff',
      })
    } finally {
      setConnectingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Conectando tu WhatsApp Business</h1>

        {/* Debug mínimo para saber si algo bloquea el click */}
        <div className="text-xs text-slate-400 mb-4">
          accessToken: {accessToken ? 'OK' : '—'} · tempToken:{' '}
          {typeof window !== 'undefined' && localStorage.getItem('tempToken') ? 'OK' : '—'}
        </div>

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
            <span>Procesando OAuth…</span>
          </div>
        ) : !items.length ? (
          <div className="text-slate-300">No se encontraron WABAs o números disponibles.</div>
        ) : (
          <div className="space-y-6">
            {items.map(({ waba, phones }) => (
              <div
                key={waba.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 pointer-events-auto"
              >
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
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div>
                          <div className="text-sm">{p.display_phone_number}</div>
                          <div className="text-xs text-slate-500">Phone ID: {p.id}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => connectPhone(waba, p)}
                          disabled={connectingId === p.id}
                          className="text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded"
                          style={{ pointerEvents: 'auto' }}
                        >
                          {connectingId === p.id ? 'Conectando…' : 'Usar este número'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
