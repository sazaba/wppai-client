// app/dashboard/settings/ActivatePhoneCard.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function ActivatePhoneCard() {
  const [displayPhone, setDisplayPhone] = useState('')
  const [phoneId, setPhoneId] = useState('')
  const [loading, setLoading] = useState(false)

  const onActivate = async () => {
    if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
    if (!displayPhone && !phoneId) {
      Swal.fire('Falta dato', 'Ingresa el número o el phone_number_id', 'info')
      return
    }
    try {
      setLoading(true)
      const jwt = localStorage.getItem('token') || '' // tu token de sesión
      const { data } = await axios.post(
        `${API_URL}/api/whatsapp/activar-numero`,
        {
          displayPhoneNumber: displayPhone || undefined,
          phoneNumberId: phoneId || undefined,
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )
      console.log('register-result', data)
      Swal.fire('Listo', 'El número fue activado correctamente 🎉', 'success')
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Error al activar'
      Swal.fire('Error', String(msg), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <h3 className="font-semibold text-slate-900">Activar número (Cloud API)</h3>
      <p className="text-sm text-slate-600">
        Ingresa tu número tal como aparece en Meta (ej. +57 312 345 6789) o pega el <code>phone_number_id</code>.
      </p>

      <label className="block text-sm text-slate-700">
        Número (display_phone_number)
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="+57 312 345 6789"
          value={displayPhone}
          onChange={(e) => setDisplayPhone(e.target.value)}
        />
      </label>

      <div className="text-xs text-slate-400">— ó —</div>

      <label className="block text-sm text-slate-700">
        Phone Number ID (opcional)
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="712725021933030"
          value={phoneId}
          onChange={(e) => setPhoneId(e.target.value)}
        />
      </label>

      <button
        type="button"
        onClick={onActivate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? 'Activando…' : 'Activar número'}
      </button>
    </div>
  )
}
