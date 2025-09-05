// app/dashboard/settings/ActivatePhoneCard.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function onlyDigits(s: string) {
  return String(s || '').replace(/\D+/g, '')
}

export default function ActivatePhoneCard() {
  const [displayPhone, setDisplayPhone] = useState('')
  const [phoneId, setPhoneId] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastPhoneId, setLastPhoneId] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const hasApi = Boolean(API_URL)

  const jwt = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : ''

  const onActivate = async () => {
    if (!hasApi) return alert('Falta NEXT_PUBLIC_API_URL')
    if (!jwt) {
      Swal.fire('Sesión', 'Inicia sesión para continuar.', 'info')
      return
    }
    if (!displayPhone && !phoneId) {
      Swal.fire('Falta dato', 'Ingresa el número o el phone_number_id', 'info')
      return
    }

    try {
      setLoading(true)
      const payload: any = {}
      if (phoneId) payload.phoneNumberId = phoneId.trim()
      if (displayPhone) payload.displayPhoneNumber = displayPhone.trim()

      const { data } = await axios.post(
        `${API_URL}/api/whatsapp/activar-numero`,
        payload,
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      // Si activaste con phoneId, guárdalo para poder consultar estado luego
      if (payload.phoneNumberId) setLastPhoneId(payload.phoneNumberId)

      Swal.fire('Listo', 'El número fue activado correctamente 🎉', 'success')
    } catch (e: any) {
      // Backend ya envía metaErr, intentamos dar el mensaje más útil
      const err = e?.response?.data?.error || e?.response?.data || e
      const code = err?.code
      const msg = err?.message || e?.message || 'Error al activar'

      // Caso típico: ya está registrado (#131000)
      if (String(code) === '131000') {
        Swal.fire('Ya estaba activo', 'El número ya se encontraba registrado.', 'success')
      } else {
        Swal.fire('Error', String(msg), 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    if (!hasApi) return alert('Falta NEXT_PUBLIC_API_URL')
    const targetPhoneId = (phoneId || lastPhoneId || '').trim()
    if (!targetPhoneId) {
      Swal.fire('Dato faltante', 'Proporciona el phone_number_id para consultar estado.', 'info')
      return
    }
    try {
      setChecking(true)
      const { data } = await axios.get(
        `${API_URL}/api/whatsapp/numero/${targetPhoneId}/estado`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      const d = data?.data || {}
      Swal.fire({
        icon: 'info',
        title: 'Estado del número',
        html: `
          <div style="text-align:left">
            <div><b>Phone ID:</b> ${d.id || targetPhoneId}</div>
            <div><b>Display:</b> ${d.display_phone_number || '—'}</div>
            <div><b>Name status:</b> ${d.name_status || '—'}</div>
            <div><b>Quality:</b> ${d.quality_rating || '—'}</div>
            <div><b>Account mode:</b> ${d.account_mode || '—'}</div>
            <div><b>Verified name:</b> ${d.verified_name || '—'}</div>
          </div>
        `,
      })
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Error al consultar estado'
      Swal.fire('Error', String(msg), 'error')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <h3 className="font-semibold text-slate-900">Activar número (Cloud API)</h3>
      <p className="text-sm text-slate-600">
        Ingresa tu número tal como aparece en Meta (ej. “+57 312 345 6789”) o pega el <code>phone_number_id</code>.
        Si pones ambos, se usará el <code>phone_number_id</code>.
      </p>

      <label className="block text-sm text-slate-700">
        Número (display_phone_number)
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="+57 312 345 6789"
          value={displayPhone}
          onChange={(e) => setDisplayPhone(e.target.value)}
          disabled={loading || checking}
        />
      </label>

      <div className="text-xs text-slate-400">— ó —</div>

      <label className="block text-sm text-slate-700">
        Phone Number ID (opcional)
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="712725021933030"
          value={phoneId}
          onChange={(e) => setPhoneId(onlyDigits(e.target.value))}
          disabled={loading || checking}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onActivate}
          disabled={loading || checking}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Activando…' : 'Activar número'}
        </button>

        <button
          type="button"
          onClick={checkStatus}
          disabled={loading || checking}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white disabled:opacity-60"
        >
          {checking ? 'Consultando…' : 'Ver estado'}
        </button>
      </div>
    </div>
  )
}
