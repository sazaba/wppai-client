'use client'
import { useEffect, useState } from 'react'
import {
  listAppointmentExceptions,
  upsertAppointmentException,
  type AppointmentExceptionRow,
} from '@/services/estetica.service'

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function ExceptionsPanel() {
  const [rows, setRows] = useState<AppointmentExceptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Partial<AppointmentExceptionRow>>({
    date: toYMD(new Date()),
    reason: '',
  })

  async function reload() {
    setLoading(true)
    try {
      const data = await listAppointmentExceptions().catch(() => [])
      setRows(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  function editRow(r: AppointmentExceptionRow) {
    setEditing({ id: r.id, date: r.date.slice(0, 10), reason: r.reason ?? '' })
  }

  function startNew() {
    setEditing({ id: undefined, date: toYMD(new Date()), reason: '' })
  }

  async function save() {
    if (!editing?.date) { alert('Fecha requerida'); return }
    setSaving(true)
    try {
      const payload = { id: editing.id, date: new Date(editing.date!).toISOString(), reason: editing.reason ?? null }
      await upsertAppointmentException(payload)
      await reload()
      startNew()
      alert('Excepción guardada')
    } catch (e: any) {
      alert(e?.message || 'Error al guardar excepción')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Fechas bloqueadas / Excepciones</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Listado</div>
          <div className="p-3 space-y-2">
            {loading ? (
              <div className="p-3 text-slate-400">Cargando…</div>
            ) : rows.length === 0 ? (
              <div className="p-3 text-slate-400">Sin excepciones</div>
            ) : (
              rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => editRow(r)}
                  className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 transition"
                >
                  <div className="font-medium">{r.date.slice(0, 10)}</div>
                  <div className="text-xs text-slate-400">{r.reason || '—'}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">
            {editing?.id ? 'Editar excepción' : 'Nueva excepción'}
          </div>
          <div className="p-4 grid grid-cols-1 gap-4">
            <input
              type="date"
              value={editing?.date ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, date: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Motivo (opcional)"
              value={editing?.reason ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, reason: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />

            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button onClick={startNew} className="px-4 py-2 rounded-xl border border-slate-700">Nuevo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
