'use client'
import { useEffect, useState } from 'react'
import { listStaff, upsertStaff, type StaffRow } from '@/services/estetica.service'

const ROLES: StaffRow['role'][] = ['profesional', 'esteticista', 'medico']

export default function StaffPanel() {
  const [rows, setRows] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Partial<StaffRow>>({ name: '', role: 'esteticista', active: true, availability: null })

  async function reload() {
    setLoading(true)
    try {
      const s = await listStaff().catch(() => [])
      setRows(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  function startNew() {
    setEditing({ id: undefined, name: '', role: 'esteticista', active: true, availability: '' })
  }

  function editRow(r: StaffRow) {
    setEditing({ ...r, availability: r.availability ? JSON.stringify(r.availability, null, 2) : '' })
  }

  async function save() {
    if (!editing?.name || !editing.name.trim()) { alert('Nombre es obligatorio'); return }
    setSaving(true)
    try {
      const payload = {
        ...editing,
        availability: ((): any => {
          if (!editing?.availability) return null
          try { return JSON.parse(String(editing.availability)) } catch { return null }
        })(),
      }
      await upsertStaff(payload as any)
      await reload()
      startNew()
      alert('Staff guardado')
    } catch (e: any) {
      alert(e?.message || 'Error al guardar staff')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!editing?.name && !loading && rows.length && editing?.id == null) startNew()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, rows.length])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Staff / Profesionales</h2>
        <p className="text-sm text-slate-400">
          Gestiona el equipo que la IA tendrá en cuenta al proponer horarios y asignar citas.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ====== Lista ====== */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm font-semibold">Listado</div>
            <div className="text-[11px] text-slate-400">{loading ? 'Cargando…' : `${rows.length} miembros`}</div>
          </div>

          <div className="p-3 space-y-2 max-h-[70vh] overflow-auto">
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="p-4 text-slate-400 text-sm">Aún no hay staff. Crea uno en el panel derecho.</div>
            ) : (
              rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => editRow(r)}
                  className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/[.03] hover:bg-white/[.06] transition group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="font-medium truncate">{r.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] rounded-full px-2 py-0.5 border border-indigo-400/40 text-indigo-200 bg-indigo-500/10">
                        {r.role}
                      </span>
                      <span
                        className={[
                          'text-[11px] rounded-full px-2 py-0.5 border',
                          r.active
                            ? 'border-emerald-500/70 text-emerald-300 bg-emerald-500/10'
                            : 'border-slate-500/70 text-slate-300 bg-slate-500/10',
                        ].join(' ')}
                      >
                        {r.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  {r.availability ? (
                    <div className="mt-1 text-[12px] text-slate-500 line-clamp-1">
                      Disponibilidad personalizada
                    </div>
                  ) : (
                    <div className="mt-1 text-[12px] text-slate-500">Sin disponibilidad definida</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ====== Editor ====== */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm font-semibold">
              {editing?.id ? 'Editar profesional' : 'Nuevo profesional'}
            </div>
            <div className="text-[11px] text-slate-400">
              Los cambios no se guardan hasta que presiones “Guardar”.
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Nombre *</label>
              <input
                placeholder="Ej: Dra. María Pérez"
                value={editing?.name ?? ''}
                onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">Nombre como aparecerá en la agenda interna.</div>
            </div>

            {/* Rol */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Rol</label>
              <select
                value={editing?.role ?? 'esteticista'}
                onChange={(e) => setEditing((p) => ({ ...p!, role: e.target.value as StaffRow['role'] }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Estado */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!editing?.active}
                onChange={(e) => setEditing((p) => ({ ...p!, active: e.target.checked }))}
                className="h-4 w-4"
              />
              Activo (disponible para agendar)
            </label>

            {/* Disponibilidad JSON */}
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Disponibilidad (JSON opcional)</label>
              <textarea
                placeholder='Ej: [{"day":"mon","blocks":[["09:00","13:00"],["14:00","18:00"]]}]'
                value={(editing?.availability as any) ?? ''}
                onChange={(e) => setEditing((p) => ({ ...p!, availability: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600 font-mono"
                rows={6}
              />
              <div className="mt-1 text-[11px] text-slate-500">
                Si se deja vacío, se usará el horario general del negocio.
              </div>
            </div>

            {/* Acciones sticky */}
            <div className="sm:col-span-2">
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
                    Editando: <strong className="text-slate-300">{editing.name || `#${editing.id}`}</strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nota inferior */}
      <div className="text-[11px] text-slate-500">
        Tip: Define la disponibilidad sólo si el profesional tiene horarios distintos al general.
      </div>
    </div>
  )
}
