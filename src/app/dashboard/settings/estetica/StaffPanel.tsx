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
      <h2 className="text-lg font-semibold">Staff / Profesionales</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Listado</div>
          <div className="p-3 space-y-2">
            {loading ? (
              <div className="p-3 text-slate-400">Cargando…</div>
            ) : rows.length === 0 ? (
              <div className="p-3 text-slate-400">Aún no hay staff</div>
            ) : (
              rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => editRow(r)}
                  className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.name}</div>
                    <span className="text-xs text-slate-400">{r.role}</span>
                  </div>
                  <div className="text-xs">
                    <span className={`rounded-full px-2 py-0.5 border ${r.active ? 'border-emerald-600 text-emerald-300' : 'border-slate-600 text-slate-300'}`}>
                      {r.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">
            {editing?.id ? 'Editar profesional' : 'Nuevo profesional'}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Nombre *"
              value={editing?.name ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />

            <select
              value={editing?.role ?? 'esteticista'}
              onChange={(e) => setEditing((p) => ({ ...p!, role: e.target.value as StaffRow['role'] }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!editing?.active}
                onChange={(e) => setEditing((p) => ({ ...p!, active: e.target.checked }))}
              />
              Activo
            </label>

            <textarea
              placeholder='Disponibilidad (JSON opcional). Ej: [{"day":"mon","blocks":[["09:00","13:00"]]}]'
              value={(editing?.availability as any) ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, availability: e.target.value }))}
              className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              rows={5}
            />

            <div className="sm:col-span-2 flex gap-2">
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
