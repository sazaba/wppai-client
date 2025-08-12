'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const FB_VERSION = 'v20.0'

export default function CallbackManualClient() {
  const sp = useSearchParams()
  const router = useRouter()
  const mounted = useRef(true)

  // Solo usamos accessToken del OAuth para confirmar que el callback salió bien (no lo guardamos en BD).
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const [wabaId, setWabaId] = useState('')
  const [phoneId, setPhoneId] = useState('')
  const [display, setDisplay] = useState('')

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

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

        // Intercambia code -> access_token (de usuario). NO lo guardamos en BD.
        const r = await axios.post<{ access_token: string }>(`${API_URL}/api/auth/exchange-code`, { code })
        setAccessToken(r.data.access_token)

        // Prefill si llegan hints en la URL
        const hintW = sp.get('waba_hint'); if (hintW) setWabaId(hintW)
        const hintP = sp.get('phone_hint'); if (hintP) setPhoneId(hintP)
        const hintD = sp.get('display_hint'); if (hintD) setDisplay(hintD)
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error de OAuth',
          text: err?.response?.data?.error || err?.message || 'Fallo en callback',
          background: '#111827',
          color: '#fff'
        })
      } finally {
        if (mounted.current) setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp])

  const guardar = async () => {
    const jwt = typeof window !== 'undefined' ? localStorage.getItem('tempToken') || '' : ''
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

      // ✅ Usamos el endpoint del backend que valida pertenencia y persiste (NO enviamos el access_token de OAuth).
      await axios.post(`${API_URL}/api/whatsapp/actualizar-datos`,
        { wabaId, phoneNumberId: phoneId },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      // Opcional: persistir display en BD usando vincular-manual (solo displayPhoneNumber),
      // no sobreescribimos accessToken. Enviamos strings vacíos en los demás para conservar lo ya guardado.
      await axios.post(`${API_URL}/api/whatsapp/vincular-manual`,
        { accessToken: '', wabaId, phoneNumberId: phoneId, displayPhoneNumber: display, businessId: '' },
        { headers: { Authorization: `Bearer ${jwt}` } }
      ).catch(() => { /* Ignorar si no quieres tocar nada más. */ })

      // Limpiar el tempToken del flujo si lo usaste para el guard
      localStorage.removeItem('tempToken')

      await Swal.fire({
        icon: 'success',
        title: 'Número vinculado',
        text: 'Ahora pega tu System User Token en Settings para finalizar.',
        background: '#111827',
        color: '#fff'
      })

      router.push('/dashboard/settings?success=1')
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: err?.response?.data?.error?.message || err?.response?.data?.error || err.message,
        background: '#111827',
        color: '#fff'
      })
      console.error('[callback guardar] error:', err?.response?.data || err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Conectar número (manual)</h1>

        {loading ? (
          <p className="text-slate-300">Procesando callback…</p>
        ) : (
          <>
            {!accessToken && (
              <p className="text-amber-400 text-sm">
                No se pudo obtener el token de OAuth. Puedes reintentar el flujo desde Settings.
              </p>
            )}

            <div className="grid gap-3 bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div>
                <label className="text-sm text-slate-300">WABA ID</label>
                <input
                  value={wabaId}
                  onChange={e=>setWabaId(e.target.value)}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="1384287482665374"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Phone Number ID</label>
                <input
                  value={phoneId}
                  onChange={e=>setPhoneId(e.target.value)}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="712725021933030"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Número mostrado</label>
                <input
                  value={display}
                  onChange={e=>setDisplay(e.target.value)}
                  className="mt-1 w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="+57 314 893 6662"
                />
              </div>

              <button
                onClick={guardar}
                disabled={saving}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-sm"
              >
                {saving ? 'Guardando…' : 'Guardar y continuar'}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Este flujo guarda <b>WABA ID</b> y <b>Phone Number ID</b> validados en tu backend.
              El <b>System User Token</b> se pega luego en <code>/dashboard/settings</code>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
