'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const FB_VERSION = 'v20.0'

// Evita prerender/SSG para este callback
export const dynamic = 'force-dynamic'
export const revalidate = 0

function CallbackManualInner() {
  const sp = useSearchParams()
  const mounted = useRef(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [wabaId, setWabaId] = useState('')
  const [phoneId, setPhoneId] = useState('')
  const [display, setDisplay] = useState('')
  const [saving, setSaving] = useState(false)

  async function vincularFlexible(jwt: string, payload: any) {
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
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        if (!API_URL) throw new Error('Falta NEXT_PUBLIC_API_URL')
        const code = sp.get('code')
        if (!code) throw new Error('Falta code en el callback')

        // exchange → token
        const r = await axios.post<{ access_token: string }>(`${API_URL}/api/auth/exchange-code`, { code })
        setAccessToken(r.data.access_token)

        // Hints
        const hintW = sp.get('waba_hint'); if (hintW) setWabaId(hintW)
        const hintP = sp.get('phone_hint'); if (hintP) setPhoneId(hintP)
        const hintD = sp.get('display_hint'); if (hintD) setDisplay(hintD)
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Error de OAuth', text: err?.message || 'Fallo en callback', background: '#111827', color: '#fff' })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp])

  const guardar = async () => {
    if (!accessToken) {
      Swal.fire({ icon: 'error', title: 'Sin token', text: 'Repite la conexión.', background: '#111827', color: '#fff' })
      return
    }
    const jwt = localStorage.getItem('tempToken') || ''
    if (!jwt) {
      Swal.fire({ icon: 'error', title: 'Sesión expirada', text: 'Vuelve a conectar.', background: '#111827', color: '#fff' })
      return
    }
    if (!wabaId || !phoneId || !display) {
      Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Completa WABA ID, Phone Number ID y número mostrado.', background: '#111827', color: '#fff' })
      return
    }

    try {
      setSaving(true)
      // intentar descubrir businessId (si se puede)
      let businessId = 'unknown'
      try {
        const info = await axios.get(
          `https://graph.facebook.com/${FB_VERSION}/${wabaId}?fields=owner_business_info&access_token=${accessToken}`
        )
        businessId = info.data?.owner_business_info?.id || 'unknown'
      } catch {}

      await vincularFlexible(jwt, { accessToken, wabaId, phoneNumberId: phoneId, displayPhoneNumber: display, businessId })
      localStorage.removeItem('tempToken')
      window.location.href = '/dashboard/settings?success=1'
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: err?.response?.data?.error || err.message, background: '#111827', color: '#fff' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Conectar manualmente</h1>
        {!accessToken ? (
          <p className="text-slate-300">Obteniendo token…</p>
        ) : (
          <>
            <div className="grid gap-3 bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div>
                <label className="text-sm text-slate-300">WABA ID</label>
                <input value={wabaId} onChange={e=>setWabaId(e.target.value)} className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm" placeholder="3601170550016999" />
              </div>
              <div>
                <label className="text-sm text-slate-300">Phone Number ID</label>
                <input value={phoneId} onChange={e=>setPhoneId(e.target.value)} className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm" placeholder="714875248379508" />
              </div>
              <div>
                <label className="text-sm text-slate-300">Número mostrado</label>
                <input value={display} onChange={e=>setDisplay(e.target.value)} className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm" placeholder="+57 314 8936662" />
              </div>
              <button onClick={guardar} disabled={saving} className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-sm">
                {saving ? 'Guardando…' : 'Guardar y continuar'}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Este flujo no lista WABAs ni números; solo guarda el token y los IDs que pegues.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Procesando OAuth…
      </div>
    }>
      <CallbackManualInner />
    </Suspense>
  )
}
