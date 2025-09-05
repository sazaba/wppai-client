// app/dashboard/settings/ActivatePhoneCard.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Phone = {
  id: string
  display_phone_number: string
}

export default function ActivateWabaPhone() {
  const [wabaId, setWabaId] = useState('')
  const [pin, setPin] = useState('')
  const [phones, setPhones] = useState<Phone[]>([])
  const [selected, setSelected] = useState<Phone | null>(null)
  const [loading, setLoading] = useState(false)
  const [activating, setActivating] = useState(false)
  const [status, setStatus] = useState<any>(null)

  const jwt = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  const listPhones = async () => {
    if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
    if (!wabaId.trim()) {
      Swal.fire('Falta WABA ID', 'Pega el WABA ID de tu cuenta de WhatsApp Business.', 'info')
      return
    }
    try {
      setLoading(true)
      setSelected(null)
      setPhones([])
      setStatus(null)
      const { data } = await axios.get(`${API_URL}/api/whatsapp/waba/${wabaId}/phones`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      const list: Phone[] = data?.data || []
      setPhones(list)
      if (!list.length) {
        Swal.fire('Sin números', 'Esa WABA no tiene teléfonos configurados.', 'info')
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Error listando números'
      Swal.fire('Error', String(msg), 'error')
    } finally {
      setLoading(false)
    }
  }

  const activate = async () => {
    if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
    if (!selected) {
      return Swal.fire('Elige un número', 'Selecciona un teléfono de la lista.', 'info')
    }
    const cleanPin = pin.trim()
    if (!/^\d{6}$/.test(cleanPin)) {
      return Swal.fire(
        'PIN requerido',
        'Debes ingresar un PIN de 6 dígitos. En Cloud API el PIN se establece al registrar.',
        'warning'
      )
    }
    try {
      setActivating(true)
      setStatus(null)

      await axios.post(
        `${API_URL}/api/whatsapp/activar-numero`,
        {
          wabaId: wabaId.trim(),
          phoneNumberId: selected.id,
          pin: cleanPin,
        },
        { headers: { Authorization: `Bearer ${jwt}` } }
      )

      const st = await axios.get(`${API_URL}/api/whatsapp/numero/${selected.id}/estado`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      setStatus(st.data?.data || null)

      Swal.fire('¡Listo!', 'El número fue activado (o ya estaba activo).', 'success')
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'No se pudo activar'
      Swal.fire('Error', String(msg), 'error')
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <h3 className="font-semibold text-slate-900">Activar número por WABA ID</h3>

      <label className="block text-sm text-slate-700">
        WABA ID
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="2384316055299650"
          value={wabaId}
          onChange={(e) => setWabaId(e.target.value)}
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={listPhones}
          disabled={loading || !wabaId.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Buscando…' : 'Listar números'}
        </button>

        <label className="ml-auto text-sm text-slate-700 flex items-center gap-2">
          PIN (2FA)
          <input
            className="rounded border px-2 py-1"
            placeholder="6 dígitos"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: 120 }}
          />
        </label>
      </div>

      {!!phones.length && (
        <div className="space-y-2">
          <div className="text-sm text-slate-600">Números encontrados:</div>
          {phones.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelected(p)
                setStatus(null)
              }}
              className={`w-full text-left rounded border px-3 py-2 ${
                selected?.id === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
              }`}
            >
              <div className="font-medium">{p.display_phone_number}</div>
              <div className="text-xs text-slate-500">phone_number_id: {p.id}</div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={activate}
            disabled={activating}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {activating ? 'Activando…' : 'Activar este número'}
          </button>

          <div className="text-xs text-slate-500">
            Seleccionado: {selected.display_phone_number} · ID: {selected.id}
          </div>
        </div>
      )}

      {status && (
        <pre className="bg-slate-50 border border-slate-200 text-xs p-3 rounded overflow-auto">
          {JSON.stringify(status, null, 2)}
        </pre>
      )}

      <p className="text-xs text-slate-500">
        Nota: En WhatsApp Cloud API, el PIN (verificación en dos pasos) se fija al registrar el número.
      </p>
    </div>
  )
}
