'use client'

import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Phone = {
  id: string
  display_phone_number: string
}

export default function ActivateWabaPhone() {
  const [wabaId, setWabaId] = useState('')
  const [pin, setPin] = useState('') // ← requerido por Meta si el número ya tiene 2FA
  const [phones, setPhones] = useState<Phone[]>([])
  const [selected, setSelected] = useState<Phone | null>(null)
  const [loading, setLoading] = useState(false)
  const [activating, setActivating] = useState(false)
  const [status, setStatus] = useState<any>(null)

  const jwt = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  const listPhones = async () => {
    if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
    if (!wabaId.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Falta WABA ID',
        text: 'Pega el WABA ID de tu cuenta de WhatsApp Business.',
        background: '#0f172a',
        color: '#e2e8f0'
      })
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
        Swal.fire({
          icon: 'info',
          title: 'Sin números',
          text: 'Esa WABA no tiene teléfonos configurados.',
          background: '#0f172a',
          color: '#e2e8f0'
        })
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Error listando números'
      Swal.fire({ icon: 'error', title: 'Error', text: String(msg), background: '#0f172a', color: '#e2e8f0' })
    } finally {
      setLoading(false)
    }
  }

  const activate = async () => {
    if (!API_URL) return alert('Falta NEXT_PUBLIC_API_URL')
    if (!selected) {
      return Swal.fire({
        icon: 'info',
        title: 'Elige un número',
        text: 'Selecciona un teléfono de la lista.',
        background: '#0f172a',
        color: '#e2e8f0'
      })
    }

    // ⚠️ En tu caso Meta está exigiendo PIN sí o sí (logs: #100 y #133005)
    const cleanPin = pin.trim()
    if (!/^\d{6}$/.test(cleanPin)) {
      return Swal.fire({
        icon: 'warning',
        title: 'PIN requerido',
        html:
          'Meta exige un PIN de <b>6 dígitos</b> para registrar este número. ' +
          'Si el número ya fue registrado antes, debes ingresar el <b>mismo PIN</b>. ' +
          'Si no lo recuerdas, resetea la verificación en dos pasos desde WhatsApp Manager.',
        background: '#0f172a',
        color: '#e2e8f0'
      })
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

      Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'El número fue activado (registro exitoso).',
        background: '#0f172a',
        color: '#e2e8f0'
      })
    } catch (e: any) {
      const statusCode = e?.response?.status
      const backendMsg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.message ||
        'No se pudo activar'

      // Mensajes más claros para casos frecuentes
      const text =
        /pin.*required/i.test(String(backendMsg))
          ? 'Meta exige PIN de 6 dígitos para este número. Ingresa el PIN correcto.'
          : /two step verification pin mismatch|133005/i.test(String(backendMsg))
          ? 'PIN incorrecto. Debes usar el PIN exacto que se configuró anteriormente o resetearlo desde WhatsApp Manager.'
          : String(backendMsg)

      if (statusCode === 409) {
        Swal.fire({
          icon: 'warning',
          title: 'Número ya conectado',
          text:
            'Este número ya está vinculado a otra empresa en tu cuenta. Desconéctalo allí primero o usa otro número.',
          background: '#0f172a',
          color: '#e2e8f0'
        })
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text, background: '#0f172a', color: '#e2e8f0' })
      }
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 text-slate-100 p-5 space-y-5">
      <h3 className="font-semibold text-base">Activar número por WABA ID</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="text-sm text-slate-300 col-span-2">
          WABA ID
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="789815586744507"
            value={wabaId}
            onChange={(e) => setWabaId(e.target.value)}
          />
        </label>

        <label className="text-sm text-slate-300">
          PIN (2FA)
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="6 dígitos"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            maxLength={6}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={listPhones}
          disabled={loading || !wabaId.trim()}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Buscando…' : 'Listar números'}
        </button>

        {selected && (
          <button
            type="button"
            onClick={activate}
            disabled={activating}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {activating ? 'Activando…' : 'Activar este número'}
          </button>
        )}

        {selected && (
          <div className="text-xs text-slate-400">
            Seleccionado: <span className="text-slate-200">{selected.display_phone_number}</span>{' '}
            · ID: <code className="text-slate-300">{selected.id}</code>
          </div>
        )}
      </div>

      {!!phones.length && (
        <div className="space-y-2">
          <div className="text-sm text-slate-400">Números encontrados:</div>
          {phones.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelected(p)
                setStatus(null)
              }}
              className={`w-full text-left rounded-lg px-3 py-2 border transition ${
                selected?.id === p.id
                  ? 'border-indigo-500 bg-slate-800/80'
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-800/70'
              }`}
            >
              <div className="text-sm text-slate-100">{p.display_phone_number}</div>
              <div className="text-[11px] text-slate-400">phone_number_id: {p.id}</div>
            </button>
          ))}
        </div>
      )}

      {status && (
        <pre className="bg-slate-800 border border-slate-700 text-xs text-slate-200 p-3 rounded-lg overflow-auto">
{JSON.stringify(
  {
    id: status.id,
    display_phone_number: status.display_phone_number,
    status: status.status,
    name_status: status.name_status,
    account_mode: status.account_mode,
    quality_rating: status.quality_rating,
  },
  null,
  2
)}
        </pre>
      )}

      <p className="text-xs text-slate-400 leading-relaxed">
        Meta puede exigir PIN (verificación en dos pasos) para registrar el número. Si ves error de
        <span className="font-medium"> PIN incorrecto</span>, usa el PIN exacto configurado
        anteriormente o <span className="font-medium">restablécelo</span> desde WhatsApp Manager.
      </p>
    </div>
  )
}
