// app/dashboard/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Business = { id: string; name: string }
type WABA = { id: string; name?: string }
type Phone = { id: string; display_phone_number: string }

export default function CallbackPage() {
  const searchParams = useSearchParams()

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [wabas, setWabas] = useState<Record<string, WABA[]>>({})
  const [phones, setPhones] = useState<Record<string, Phone[]>>({})

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token') // string | null
    const code = searchParams.get('code')            // string | null

    ;(async () => {
      try {
        if (tokenFromQuery) {
          setAccessToken(tokenFromQuery)
          await loadAssets(tokenFromQuery)
        } else if (code) {
          // Intercambia el "code" por un access_token en tu backend
          const r = await axios.post<{ access_token: string }>(
            `${API_URL}/api/auth/exchange-code`,
            { code }
          )
          const at = r.data.access_token
          setAccessToken(at)
          await loadAssets(at)
        } else {
          throw new Error('Missing token or code in callback URL')
        }
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'OAuth error',
          text: err?.response?.data?.error || err.message,
          background: '#111827',
          color: '#fff'
        })
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAssets = async (at: string) => {
    // 1) Businesses
    const me = await axios.get(
      `https://graph.facebook.com/v20.0/me?fields=businesses{name}&access_token=${at}`
    )
    const list: Business[] =
      me.data?.businesses?.data?.map((b: any) => ({ id: b.id, name: b.name })) || []
    setBusinesses(list)

    const wMap: Record<string, WABA[]> = {}
    const pMap: Record<string, Phone[]> = {}

    for (const biz of list) {
      // 2) WABAs
      const wab = await axios.get(
        `https://graph.facebook.com/v20.0/${biz.id}/owned_whatsapp_business_accounts?fields=name&access_token=${at}`
      )
      const wabList: WABA[] = (wab.data?.data || []).map((w: any) => ({ id: w.id, name: w.name }))
      wMap[biz.id] = wabList

      // 3) Números
      for (const w of wabList) {
        const pn = await axios.get(
          `https://graph.facebook.com/v20.0/${w.id}/phone_numbers?fields=display_phone_number&access_token=${at}`
        )
        pMap[w.id] = (pn.data?.data || []).map((p: any) => ({
          id: p.id,
          display_phone_number: p.display_phone_number
        }))
      }
    }

    setWabas(wMap)
    setPhones(pMap)
  }

  const connectPhone = async (wabaId: string, phone: Phone) => {
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
        `${API_URL}/api/whatsapp/conectar`,
        {
          phoneNumberId: phone.id,
          displayPhoneNumber: phone.display_phone_number,
          wabaId,
          accessToken
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )
      Swal.fire({ icon: 'success', title: 'Número conectado', background: '#111827', color: '#fff' })
      window.location.href = '/dashboard/settings?success=1'
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo conectar',
        text: e?.response?.data?.error || e.message,
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
            <span>Obteniendo tus activos de Meta…</span>
          </div>
        ) : !accessToken ? (
          <p className="text-red-400">No se pudo obtener el access token.</p>
        ) : businesses.length === 0 ? (
          <p className="text-slate-300">No encontramos negocios en tu cuenta de Meta.</p>
        ) : (
          <div className="space-y-6">
            {businesses.map((b) => (
              <div key={b.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg">{b.name}</h2>
                  <span className="text-xs text-slate-400">Business ID: {b.id}</span>
                </div>

                {(wabas[b.id] || []).length === 0 ? (
                  <p className="text-slate-400">No hay cuentas de WhatsApp Business (WABA) en este negocio.</p>
                ) : (
                  (wabas[b.id] || []).map((w) => (
                    <div key={w.id} className="mt-3">
                      <div className="font-medium text-slate-200">
                        WABA: {w.name || 'sin nombre'} <span className="text-slate-400 text-xs">({w.id})</span>
                      </div>
                      <div className="mt-2 grid gap-2">
                        {(phones[w.id] || []).length === 0 ? (
                          <div className="text-slate-400 text-sm">No hay números en esta WABA.</div>
                        ) : (
                          (phones[w.id] || []).map((p) => (
                            <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                              <div>
                                <div className="text-sm">{p.display_phone_number}</div>
                                <div className="text-xs text-slate-500">Phone ID: {p.id}</div>
                              </div>
                              <button
                                onClick={() => connectPhone(w.id, p)}
                                className="text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded"
                              >
                                Usar este número
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
