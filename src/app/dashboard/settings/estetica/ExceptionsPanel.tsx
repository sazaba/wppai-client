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

function getNextSaturday(): string {
  const d = new Date()
  const day = d.getDay() // 0=Dom
  const diff = (6 - day + 7) % 7 || 7 // próximo sábado
  d.setDate(d.getDate() + diff)
  return toYMD(d)
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

  // Helpers UI (sólo autocompletan; no cambian la lógica)
  function quickDate(kind: 'today' | 'tomorrow' | 'sat') {
    if (kind === 'today') setEditing(p => ({ ...p!, date: toYMD(new Date()) }))
    if (kind === 'tomorrow') {
      const d = new Date(); d.setDate(d.getDate() + 1); setEditing(p => ({ ...p!, date: toYMD(d) }))
    }
    if (kind === 'sat') setEditing(p => ({ ...p!, date: getNextSaturday() }))
  }

  function quickReason(text: string) {
    setEditing(p => ({ ...p!, reason: text }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Fechas bloqueadas / Excepciones</h2>
        <p className="text-sm text-slate-400">
          Usa excepciones para cerrar días específicos (festivos, inventarios, capacitaciones o mantenimientos).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ====== Lista ====== */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm font-semibold">Listado</div>
            <div className="text-[11px] text-slate-400">
              {loading ? 'Cargando…' : `${rows.length} excepción${rows.length === 1 ? '' : 'es'}`}
            </div>
          </div>

          <div className="p-3 space-y-2 max-h-[70vh] overflow-auto">
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="p-4 text-slate-400 text-sm">
                Aún no hay excepciones. Crea una al lado derecho.
              </div>
            ) : (
              rows
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((r) => (
                  <button
                    key={r.id}
                    onClick={() => editRow(r)}
                    className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/[.03] hover:bg-white/[.06] transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium tracking-tight">{r.date.slice(0, 10)}</div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full border border-amber-400/40 text-amber-200 bg-amber-500/10">
                        Cerrado
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{r.reason || '—'}</div>
                  </button>
                ))
            )}
          </div>
        </div>

        {/* ====== Editor ====== */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm font-semibold">
              {editing?.id ? 'Editar excepción' : 'Nueva excepción'}
            </div>
            <div className="text-[11px] text-slate-400">Los cambios se aplican al guardar.</div>
          </div>

          <div className="p-4 space-y-4">
            {/* Fecha */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Fecha a bloquear</label>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2">
                <input
                  type="date"
                  value={editing?.date ?? ''}
                  onChange={(e) => setEditing((p) => ({ ...p!, date: e.target.value }))}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
                />
                <button
                  type="button"
                  onClick={() => quickDate('today')}
                  className="rounded-lg border border-white/10 bg-white/[.03] hover:bg-white/[.06] px-3 text-xs"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => quickDate('tomorrow')}
                  className="rounded-lg border border-white/10 bg-white/[.03] hover:bg-white/[.06] px-3 text-xs"
                >
                  Mañana
                </button>
                <button
                  type="button"
                  onClick={() => quickDate('sat')}
                  className="rounded-lg border border-white/10 bg-white/[.03] hover:bg-white/[.06] px-3 text-xs"
                >
                  Próx. sábado
                </button>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Ese día no se podrán agendar citas.
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Motivo (opcional)</label>

              {/* Chips de motivos comunes (rellenan el input) */}
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  'Feriado',
                  'Capacitación interna',
                  'Mantenimiento de equipos',
                  'Inventario',
                  'Evento del equipo',
                ].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => quickReason(m)}
                    className="text-[11px] rounded-full px-3 py-1 border border-white/10 bg-white/[.02] hover:bg-white/[.06]"
                  >
                    {m}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Ej: Feriado nacional / Jornada de entrenamiento / Visita técnica…"
                value={editing?.reason ?? ''}
                onChange={(e) => setEditing((p) => ({ ...p!, reason: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">
                Solo para referencia interna; no se muestra al cliente.
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-2">
              <div className="sticky bottom-2 flex gap-2 bg-gradient-to-t from-slate-950/80 to-transparent pt-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/30 disabled:opacity-60"
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  onClick={startNew}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/[.03] hover:bg-white/[.06] text-white"
                >
                  Nuevo
                </button>
                {editing?.id ? (
                  <span className="ml-auto text-[11px] text-slate-400 self-center">
                    Editando: <strong className="text-slate-300">{editing.date?.slice(0, 10)}</strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nota inferior */}
      <div className="text-[11px] text-slate-500">
        Tip: si cierras varios días seguidos (p. ej., vacaciones), crea una excepción por cada fecha.
      </div>
    </div>
  )
}
