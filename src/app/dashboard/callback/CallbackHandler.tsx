'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const FB_VERSION = 'v20.0'
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const REDIRECT_URI = 'https://wasaaa.com/dashboard/callback' // debe coincidir con el backend

type WABA = { id: string; name?: string; owner_business_id?: string }
type Phone = { id: string; display_phone_number: string }
type WabaWithPhones = { waba: WABA; phones: Phone[] }

export default function CallbackPage() {
  const searchParams = useSearchParams()
  const mounted = useRef(true)

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<WabaWithPhones[]>([])

  // ---- util para relanzar OAuth con scopes correctos
  const startOAuth = () => {
    if (!META_APP_ID) {
      Swal.fire({ icon: 'error', title: 'Config faltante', text: 'NEXT_PUBLIC_META_APP_ID no está definido.' })
      return
    }
    const scope = [
      'whatsapp_business_messaging',
      'whatsapp_business_management',
      'business_management',
      'pages_show_list', // opcional
    ].join(',')
    const url =
      `https://www.facebook.com/${FB_VERSION}/dialog/oauth` +
      `?client_id=${META_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}`
    window.location.href = url
  }

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    const err = searchParams.get('error')
    const errDesc = searchParams.get('error_description')
    if (err) {
      Swal.fire({ icon: 'error', title: 'OAuth error', text: errDesc || err, background: '#111827', color: '#fff' })
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
          const r = await axios.post<{ access_token: string }>(`${API_URL}/api/auth/exchange-code`, { code })
          at = r.data.access_token
        }
        if (!at) throw new Error('No se recibió token ni code en el callback.')
        setAccessToken(at)

        // 2) Validar permisos: deben estar los 3
        const { granted } = await checkScopes(at)
        const need = ['business_management', 'whatsapp_business_management', 'whatsapp_business_messaging']
        const missing = need.filter(p => !granted.includes(p))
        if (missing.length) {
          await Swal.fire({
            icon: 'error',
            title: 'Faltan permisos',
            html: `Tu inicio de sesión no otorgó: <b>${missing.join(', ')}</b>.<br/>Necesitamos esos permisos para listar tus cuentas de WhatsApp.`,
            confirmButtonText: 'Conectar otra vez'
          })
          startOAuth()
          return
        }

        // 3) Cargar Businesses → WABAs → Phones desde backend
        await loadAssetsViaBackend(at)
      } catch (err: any) {
        const msg =
          typeof err?.response?.data?.error === 'object'
            ? JSON.stringify(err.response.data.error)
            : err?.response?.data?.message || err?.response?.data?.error || err.message

        // casos típicos del (#200)
        if (String(msg).includes('business_management') || String(msg).includes('code 200')) {
          const { isConfirmed } = await Swal.fire({
            icon: 'error',
            title: 'Error en el callback',
            html:
              'Meta devolvió <b>(#200) business_management requerido</b> para gestionar el negocio.<br/>' +
              'Pulsa continuar para relanzar el login con los permisos correctos.',
            confirmButtonText: 'Continuar',
            showCancelButton: true,
            background: '#111827',
            color: '#fff'
          })
          if (isConfirmed) startOAuth()
        } else {
          Swal.fire({ icon: 'error', title: 'Error en el callback', text: msg, background: '#111827', color: '#fff' })
        }
      } finally {
        if (mounted.current) setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkScopes = async (at: string): Promise<{ granted: string[] }> => {
    const { data } = await axios.get(
      `https://graph.facebook.com/${FB_VERSION}/me/permissions?access_token=${at}`
    )
    const granted = (data?.data || [])
      .filter((x: any) => x.status === 'granted')
      .map((x: any) => x.permission)
    return { granted }
  }

  const loadAssetsViaBackend = async (at: string): Promise<void> => {
    const { data } = await axios.get(`${API_URL}/api/auth/wabas`, {
      params: { token: at, debug: 1 }
    })
    const mapped: WabaWithPhones[] = (data.items || []).map((item: any) => ({
      waba: {
        id: item.waba?.id,
        name: item.waba?.name,
        owner_business_id: item.waba?.owner_business_id
      },
      phones: (item.phones || []).map((p: any) => ({
        id: p.id,
        display_phone_number: p.display_phone_number
      }))
    }))
    setItems(mapped)

    if (!mapped.length) {
      Swal.fire({
        icon: 'info',
        title: 'No encontramos WABAs o números',
        text: 'Verifica que tu usuario tenga acceso a la WABA y que existan números en la cuenta.',
        background: '#111827',
        color: '#fff'
      })
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

    // Resolver owner_business_id si hace falta
    let businessId = waba.owner_business_id || ''
    if (!businessId) {
      try {
        const info = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/${waba.id}?fields=owner_business_info&access_token=${accessToken}`
        )
        businessId = info.data?.owner_business_info?.id || ''
      } catch {}
    }

    await axios.post(
      `${API_URL}/api/whatsapp/vincular`,
      {
        accessToken: accessToken,
        wabaId: waba.id,
        phoneNumberId: phone.id,
        businessId,
        displayPhoneNumber: phone.display_phone_number
      },
      { headers: { Authorization: `Bearer ${jwt}` } }
    )

    Swal.fire({ icon: 'success', title: 'Número conectado', background: '#111827', color: '#fff' })
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
          <div className="space-y-3">
            <p className="text-red-400">No se pudo obtener el access token.</p>
            <button onClick={startOAuth} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700">
              Reintentar conexión
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="space-y-3">
            <div className="text-slate-300">No se encontraron WABAs o números disponibles.</div>
            <button onClick={startOAuth} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700">
              Probar de nuevo
            </button>
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
          </div>
        )}
      </div>
    </div>
  )
}
