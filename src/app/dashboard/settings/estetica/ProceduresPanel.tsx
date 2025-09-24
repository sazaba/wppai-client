'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  listProcedures,
  upsertProcedure,
  listStaff,
  type Procedure,
  type StaffRow,
} from '@/services/estetica.service'

export default function ProceduresPanel() {
  const [rows, setRows] = useState<Procedure[]>([])
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Partial<Procedure>>({
    name: '',
    enabled: true,
    requiresAssessment: false,
    depositRequired: false,
  })

  async function reload() {
    setLoading(true)
    try {
      const [p, s] = await Promise.all([listProcedures().catch(() => []), listStaff().catch(() => [])])
      setRows(p)
      setStaff(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const staffById = useMemo(() => new Map(staff.map(s => [s.id, s])), [staff])

  function startNew() {
    setEditing({
      id: undefined,
      name: '',
      enabled: true,
      aliases: null,
      durationMin: null,
      requiresAssessment: false,
      priceMin: '',
      priceMax: '',
      depositRequired: false,
      depositAmount: '',
      prepInstructions: '',
      postCare: '',
      contraindications: '',
      notes: '',
      pageUrl: '',
      requiredStaffIds: [],
    })
  }

  function editRow(r: Procedure) {
    setEditing({
      ...r,
      // normaliza JSON raros
      aliases: Array.isArray(r.aliases) ? r.aliases : (r.aliases ?? null),
      requiredStaffIds: (r.requiredStaffIds ?? []) as number[],
    })
  }

  async function save() {
    if (!editing?.name || !editing.name.trim()) {
      alert('Nombre es obligatorio')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...editing,
        durationMin: editing.durationMin == null || editing.durationMin === ('' as any) ? null : Number(editing.durationMin),
        priceMin: editing.priceMin === '' ? null : String(editing.priceMin),
        priceMax: editing.priceMax === '' ? null : String(editing.priceMax),
        depositAmount: editing.depositAmount === '' ? null : String(editing.depositAmount),
        aliases:
          typeof editing.aliases === 'string'
            ? editing.aliases.split(',').map(s => s.trim()).filter(Boolean)
            : editing.aliases ?? null,
      }
      await upsertProcedure(payload as any)
      await reload()
      startNew()
      alert('Procedimiento guardado')
    } catch (e: any) {
      alert(e?.message || 'Error al guardar procedimiento')
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
      <div>
        <h2 className="text-lg font-semibold">Servicios / Procedimientos</h2>
        <p className="text-sm text-slate-400">
          Catálogo usado por la IA para cotizar/agendar (campos avanzados son opcionales).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Listado</div>
          <div className="p-3 space-y-2">
            {loading ? (
              <div className="p-3 text-slate-400">Cargando…</div>
            ) : rows.length === 0 ? (
              <div className="p-3 text-slate-400">Aún no hay procedimientos</div>
            ) : (
              rows.map((r) => (
                <button
                  key={r.id}
                  onClick={() => editRow(r)}
                  className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.name}</div>
                    <span className={`text-xs rounded-full px-2 py-0.5 border ${r.enabled ? 'border-emerald-600 text-emerald-300' : 'border-slate-600 text-slate-300'}`}>
                      {r.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {r.durationMin ? `${r.durationMin} min · ` : ''}{r.priceMin ? `Desde ${r.priceMin}` : 'Sin precio'}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">
            {editing?.id ? 'Editar procedimiento' : 'Nuevo procedimiento'}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Nombre *"
              value={editing?.name ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!editing?.enabled}
                onChange={(e) => setEditing((p) => ({ ...p!, enabled: e.target.checked }))}
              />
              Activo
            </label>

            <input
              placeholder="Alias (coma separada)  ej: Botox, Toxina bótulinica"
              value={Array.isArray(editing?.aliases) ? editing?.aliases.join(', ') : (editing?.aliases ?? '')}
              onChange={(e) => setEditing((p) => ({ ...p!, aliases: e.target.value }))}
              className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />

            <input
              type="number"
              placeholder="Duración (min)"
              value={editing?.durationMin ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, durationMin: e.target.value === '' ? null : Number(e.target.value) }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!editing?.requiresAssessment}
                onChange={(e) => setEditing((p) => ({ ...p!, requiresAssessment: e.target.checked }))}
              />
              Requiere valoración previa
            </label>

            <input
              type="text"
              placeholder="Precio mínimo (texto o número)"
              value={editing?.priceMin ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, priceMin: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Precio máximo (opcional)"
              value={editing?.priceMax ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, priceMax: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!editing?.depositRequired}
                onChange={(e) => setEditing((p) => ({ ...p!, depositRequired: e.target.checked }))}
              />
              Requiere depósito
            </label>
            <input
              type="text"
              placeholder="Monto del depósito (texto o número)"
              value={editing?.depositAmount ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, depositAmount: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />

            <textarea
              placeholder="Instrucciones de preparación (opcional)"
              value={editing?.prepInstructions ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, prepInstructions: e.target.value }))}
              className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
            <textarea
              placeholder="Cuidados posteriores (opcional)"
              value={editing?.postCare ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, postCare: e.target.value }))}
              className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
            <textarea
              placeholder="Contraindicaciones (opcional)"
              value={editing?.contraindications ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, contraindications: e.target.value }))}
              className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
            <textarea
              placeholder="Notas internas (opcional)"
              value={editing?.notes ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, notes: e.target.value }))}
              className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />

            <input
              placeholder="URL pública (landing del servicio, opcional)"
              value={editing?.pageUrl ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p!, pageUrl: e.target.value }))}
              className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />

            {/* Requerido por staff */}
            <div className="sm:col-span-2">
              <div className="text-xs text-slate-400 mb-1">Profesionales requeridos (opcional)</div>
              <div className="flex flex-wrap gap-2">
                {staff.map(s => (
                  <label key={s.id} className="text-sm flex items-center gap-2 rounded-lg border border-slate-700 px-2 py-1">
                    <input
                      type="checkbox"
                      checked={!!(editing?.requiredStaffIds ?? []).includes(s.id)}
                      onChange={(e) => {
                        const set = new Set<number>(editing?.requiredStaffIds ?? [])
                        if (e.target.checked) set.add(s.id)
                        else set.delete(s.id)
                        setEditing(p => ({ ...p!, requiredStaffIds: Array.from(set) }))
                      }}
                    />
                    {s.name} <span className="text-xs text-slate-400">({s.role})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button onClick={startNew} className="px-4 py-2 rounded-xl border border-slate-700">
                Nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
