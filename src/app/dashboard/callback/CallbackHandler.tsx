// app/dashboard/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type WABA = { id: string; name?: string; owner_business_id?: string }
type Phone = { id: string; display_phone_number: string }
type WabaWithPhones = { waba: WABA; phones: Phone[] }

export default function CallbackPage() {
  const searchParams = useSearchParams()

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<WabaWithPhones[]>([])

  // Si Meta envía error en querystring
  useEffect(() => {
    const err = searchParams.get('error')
    const errDesc = searchParams.get('error_description')
    if (err) {
      Swal.fire({ icon: 'error', title: 'OAuth error', text: errDesc || err, background: '#111827', color: '#fff' })
    }
  }, [searchParams])

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token')
    const code = searchParams.get('code')

    ;(async () => {
      try {
        if (tokenFromQuery) {
          setAccessToken(tokenFromQuery)
          await loadAssets(tokenFromQuery)
        } else if (code) {
          const r = await axios.post<{ access_token: string }>(`${API_URL}/api/auth/exchange-code`, { code })
          const at = r.data.access_token
          setAccessToken(at)
          await loadAssets(at)
        } else {
          throw new Error('Missing token or code in callback URL')
        }
      } catch (err: any) {
        const msg =
          typeof err?.response?.data?.error === 'object'
            ? JSON.stringify(err.response.data.error)
            : err?.response?.data?.error || err.message
        Swal.fire({ icon: 'error', title: 'OAuth error', text: msg, background: '#111827', color: '#fff' })
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Solo exigimos los 2 permisos de WhatsApp
  const ensurePermissions = async (at: string) => {
    const { data } = await axios.get(`https://graph.facebook.com/v20.0/me/permissions?access_token=${at}`)
    const list: Array<{ permission: string; status: string }> = data?.data || []
    const need = ['whatsapp_business_management', 'whatsapp_business_messaging']
    const missing = need.filter(p => !list.some(x => x.permission === p && x.status === 'granted'))
    if (missing.length) throw new Error(`Faltan permisos: ${missing.join(', ')}`)
  }

  const loadAssets = async (at: string) => {
    await ensurePermissions(at)

    // 1) Traer WABAs del usuario (evita /me?fields=businesses)
    //   Nota: este endpoint funciona con los permisos de WhatsApp (sin business_management).
    //   Formato: /me/owned_whatsapp_business_accounts?fields=name
    const wabRes = await axios.get(
      `https://graph.facebook.com/v20.0/me/owned_whatsapp_business_accounts?fields=name&access_token=${at}`
    )
    const wabList: WABA[] = (wabRes.data?.data || []).map((w: any) => ({ id: w.id, name: w.name }))

    // 2) Para cada WABA: obtener owner_business_info.id y sus phone_numbers
    const results: WabaWithPhones[] = []
    for (const w of wabList) {
      // owner_business_info -> para poblar businessId sin pedir business_management
      const wInfo = await axios.get(
        `https://graph.facebook.com/v20.0/${w.id}?fields=owner_business_info&access_token=${at}`
      )
      const ownerId = wInfo.data?.owner_business_info?.id || ''

      const pn = await axios.get(
        `https://graph.facebook.com/v20.0/${w.id}/phone_numbers?fields=display_phone_number&access_token=${at}`
      )
      const phones: Phone[] = (pn.data?.data || []).map((p: any) => ({
        id: p.id,
        display_phone_number: p.display_phone_number
      }))

      results.push({ waba: { ...w, owner_business_id: ownerId }, phones })
    }

    setItems(results)
  }

  const connectPhone = async (item: WabaWithPhones, phone: Phone) => {
    const jwt = localStorage.getItem('tempToken') || ''
    if (!jwt || !accessToken) {
      Swal.fire({ icon: 'error', title: 'Sesión expirada', text: 'Vuelve a iniciar la conexión.', background: '#111827', color: '#fff' })
      return
    }
    try {
      await axios.post(
        `${API_URL}/api/whatsapp/vincular`,
        {
          businessId: item.waba.owner_business_id || 'unknown',
          wabaId: item.waba.id,
          phoneNumberId: phone.id,
          displayPhoneNumber: phone.display_phone_number,
          accessToken
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )
      Swal.fire({ icon: 'success', title: 'Número conectado', background: '#111827', color: '#fff' })
      window.location.href = '/dashboard/settings?success=1'
    } catch (e: any) {
      const txt =
        typeof e?.response?.data?.error === 'object'
          ? JSON.stringify(e.response.data.error)
          : e?.response?.data?.error || e.message
      Swal.fire({ icon: 'error', title: 'No se pudo conectar', text: txt, background: '#111827', color: '#fff' })
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
          <p className="text-slate-300">No encontramos WABAs asociadas a tu cuenta.</p>
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
                      <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                        <div>
                          <div className="text-sm">{p.display_phone_number}</div>
                          <div className="text-xs text-slate-500">Phone ID: {p.id}</div>
                        </div>
                        <button
                          onClick={() => connectPhone({ waba, phones }, p)}
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
