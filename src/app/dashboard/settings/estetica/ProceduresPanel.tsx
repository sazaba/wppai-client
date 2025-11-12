'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  listProcedures,
  upsertProcedure,
  listStaff,
  type Procedure,
  type StaffRow,
} from '@/services/estetica.service'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '@/app/context/AuthContext'
import { Trash2 } from 'lucide-react'

/** Estado del editor: números o null para montos/duración */
type Editing = {
  id?: number
  name: string
  enabled: boolean
  aliases: string | string[] | null
  durationMin: number | null
  requiresAssessment: boolean
  priceMin: number | null
  priceMax: number | null
  depositRequired: boolean
  depositAmount: number | null
  prepInstructions: string
  postCare: string
  contraindications: string
  notes: string
  pageUrl: string
  requiredStaffIds: number[]
}

const EMPTY: Editing = {
  id: undefined,
  name: '',
  enabled: true,
  aliases: null,
  durationMin: null,
  requiresAssessment: false,
  priceMin: null,
  priceMax: null,
  depositRequired: false,
  depositAmount: null,
  prepInstructions: '',
  postCare: '',
  contraindications: '',
  notes: '',
  pageUrl: '',
  requiredStaffIds: [],
}

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function ProceduresPanel() {
  const { token } = useAuth() || {}
  const [rows, setRows] = useState<Procedure[]>([])
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Editing>(EMPTY)

  async function reload() {
    setLoading(true)
    try {
      const [p, s] = await Promise.all([
        listProcedures().catch(() => []),
        listStaff().catch(() => []),
      ])
      setRows(p)
      setStaff(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
    reload()
  }, [])

  const staffById = useMemo(() => new Map(staff.map(s => [s.id, s])), [staff])

  function startNew() {
    setEditing(EMPTY)
  }

  function numOrNull(v: unknown): number | null {
    if (v === '' || v === null || v === undefined) return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : null
  }

  function editRow(r: Procedure) {
    setEditing({
      id: r.id,
      name: r.name,
      enabled: !!r.enabled,
      aliases: Array.isArray(r.aliases) ? r.aliases : (r.aliases ?? null),
      durationMin: numOrNull(r.durationMin),
      requiresAssessment: !!r.requiresAssessment,
      priceMin: numOrNull(r.priceMin as any),
      priceMax: numOrNull(r.priceMax as any),
      depositRequired: !!r.depositRequired,
      depositAmount: numOrNull(r.depositAmount as any),
      prepInstructions: r.prepInstructions ?? '',
      postCare: r.postCare ?? '',
      contraindications: r.contraindications ?? '',
      notes: r.notes ?? '',
      pageUrl: r.pageUrl ?? '',
      requiredStaffIds: (r.requiredStaffIds ?? []) as number[],
    })
  }

  async function save() {
    if (!editing?.name || !editing.name.trim()) {
      await Swal.fire({
        title: 'Campo requerido',
        text: 'Nombre es obligatorio',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        background: '#0f172a',
        color: '#e2e8f0',
        iconColor: '#f59e0b',
        confirmButtonColor: '#7c3aed',
        customClass: {
          popup: 'rounded-2xl border border-white/10',
          title: 'text-slate-100',
          htmlContainer: 'text-slate-300',
          confirmButton: 'rounded-xl',
        },
      })
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...editing,
        aliases:
          typeof editing.aliases === 'string'
            ? editing.aliases.split(',').map(s => s.trim()).filter(Boolean)
            : editing.aliases ?? null,
      }
      await upsertProcedure(payload as any)
      await reload()
      startNew()

      await Swal.fire({
        title: '¡Guardado!',
        text: 'Procedimiento guardado',
        icon: 'success',
        confirmButtonText: 'Listo',
        background: '#0f172a',
        color: '#e2e8f0',
        iconColor: '#22c55e',
        confirmButtonColor: '#7c3aed',
        customClass: {
          popup: 'rounded-2xl border border-white/10',
          title: 'text-slate-100',
          htmlContainer: 'text-slate-300',
          confirmButton: 'rounded-xl',
        },
      })
    } catch (e: any) {
      await Swal.fire({
        title: 'Error al guardar',
        text: e?.message || 'Error al guardar procedimiento',
        icon: 'error',
        confirmButtonText: 'Entendido',
        background: '#0f172a',
        color: '#e2e8f0',
        iconColor: '#ef4444',
        confirmButtonColor: '#7c3aed',
        customClass: {
          popup: 'rounded-2xl border border-white/10',
          title: 'text-slate-100',
          htmlContainer: 'text-slate-300',
          confirmButton: 'rounded-xl',
        },
      })
    } finally {
      setSaving(false)
    }
  }

  async function confirmAndDelete(r: Procedure) {
    const result = await Swal.fire({
      title: 'Eliminar servicio',
      html: `<div class="text-slate-300">¿Seguro que deseas eliminar <b>${(r.name || '').replace(/</g,'&lt;')}</b>?</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0f172a',
      color: '#e2e8f0',
      iconColor: '#f59e0b',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
        title: 'text-slate-100',
        htmlContainer: 'text-slate-300',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl',
      },
    })
    if (!result.isConfirmed) return

    try {
      setDeletingId(r.id)
      const res = await fetch(`${API}/api/estetica/procedure/${r.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.error || `No se pudo eliminar (#${r.id})`
        throw new Error(msg)
      }
      await reload()
      if (editing?.id === r.id) startNew()
      await Swal.fire({
        title: 'Eliminado',
        text: 'El servicio fue eliminado correctamente.',
        icon: 'success',
        confirmButtonText: 'Listo',
        background: '#0f172a',
        color: '#e2e8f0',
        iconColor: '#22c55e',
        confirmButtonColor: '#7c3aed',
        customClass: {
          popup: 'rounded-2xl border border-white/10',
          title: 'text-slate-100',
          htmlContainer: 'text-slate-300',
          confirmButton: 'rounded-xl',
        },
      })
    } catch (e: any) {
      await Swal.fire({
        title: 'Error al eliminar',
        text: e?.message || 'No fue posible eliminar.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        background: '#0f172a',
        color: '#e2e8f0',
        iconColor: '#ef4444',
        confirmButtonColor: '#7c3aed',
        customClass: {
          popup: 'rounded-2xl border border-white/10',
          title: 'text-slate-100',
          htmlContainer: 'text-slate-300',
          confirmButton: 'rounded-xl',
        },
      })
    } finally {
      setDeletingId(null)
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
        <h2 className="text-lg font-semibold tracking-tight">Servicios / Procedimientos</h2>
        <p className="text-sm text-slate-400">
          El catálogo que la IA usa para cotizar y agendar. Los campos “avanzados” son opcionales.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ====== Lista ====== */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm font-semibold">Listado</div>
            <div className="text-[11px] text-slate-400">
              {loading ? 'Cargando…' : `${rows.length} elementos`}
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
                Aún no hay procedimientos. Crea uno en el panel derecho.
              </div>
            ) : (
              rows.map((r) => (
                <div
                  key={r.id}
                  className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/[.03] hover:bg-white/[.06] transition group"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => editRow(r)}
                      className="flex-1 text-left"
                      title="Editar"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium truncate">{r.name}</div>
                        <span
                          className={[
                            'text-[11px] rounded-full px-2 py-0.5 border',
                            r.enabled
                              ? 'border-emerald-500/70 text-emerald-300 bg-emerald-500/10'
                              : 'border-slate-500/70 text-slate-300 bg-slate-500/10',
                          ].join(' ')}
                        >
                          {r.enabled ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-slate-400">
                        {r.durationMin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            {r.durationMin} min
                          </span>
                        ) : null}
                        {r.priceMin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            Desde {r.priceMin}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            Sin precio
                          </span>
                        )}
                        {Array.isArray(r.aliases) && r.aliases.length > 0 ? (
                          <span className="truncate text-slate-500">
                            · {r.aliases.slice(0, 3).join(', ')}
                            {r.aliases.length > 3 ? '…' : ''}
                          </span>
                        ) : null}
                      </div>
                    </button>

                    {/* Botón eliminar */}
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmAndDelete(r) }}
                      className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/[.02] hover:bg-red-500/10 hover:border-red-500/50 text-slate-300 hover:text-red-300 transition"
                      title="Eliminar servicio"
                      disabled={deletingId === r.id}
                    >
                      {deletingId === r.id ? (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ====== Editor ====== */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm font-semibold">
              {editing?.id ? 'Editar procedimiento' : 'Nuevo procedimiento'}
            </div>
            <div className="text-[11px] text-slate-400">
              Los cambios no se guardan hasta que presiones “Guardar”.
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre & estado */}
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Nombre del servicio *</label>
              <input
                placeholder="Ej: Toxina botulínica en tercera región"
                value={editing.name}
                onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">Nombre con el que el cliente lo reconoce.</div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.enabled}
                onChange={(e) => setEditing((p) => ({ ...p, enabled: e.target.checked }))}
                className="h-4 w-4"
              />
              Activo (visible para la IA)
            </label>

            <div />

            {/* Aliases */}
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Alias (separados por coma)</label>
              <input
                placeholder="ej: Botox, Toxina botulínica, Baby botox"
                value={Array.isArray(editing.aliases) ? editing.aliases.join(', ') : (editing.aliases ?? '')}
                onChange={(e) => setEditing((p) => ({ ...p, aliases: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">Sinónimos que los clientes suelen escribir.</div>
            </div>

            {/* Duración & valoración */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Duración (minutos)</label>
              <input
                type="number"
                min={0}
                step={1}
                placeholder="Ej: 45"
                value={editing.durationMin ?? ''}
                onChange={(e) =>
                  setEditing((p) => ({
                    ...p,
                    durationMin: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">Dejar vacío si varía según el caso.</div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.requiresAssessment}
                onChange={(e) => setEditing((p) => ({ ...p, requiresAssessment: e.target.checked }))}
                className="h-4 w-4"
              />
              Requiere valoración previa
            </label>

            {/* Precios */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Precio mínimo</label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej: 150.00"
                value={editing.priceMin ?? ''}
                onChange={(e) =>
                  setEditing((p) => ({
                    ...p,
                    priceMin: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">Desde este valor la IA cotiza “desde”.</div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Precio máximo (opcional)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej: 300.00"
                value={editing.priceMax ?? ''}
                onChange={(e) =>
                  setEditing((p) => ({
                    ...p,
                    priceMax: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">Útil si el rango es conocido.</div>
            </div>

            {/* Depósito */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.depositRequired}
                onChange={(e) => setEditing((p) => ({ ...p, depositRequired: e.target.checked }))}
                className="h-4 w-4"
              />
              Requiere depósito
            </label>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Monto del depósito</label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej: 50.00"
                value={editing.depositAmount ?? ''}
                onChange={(e) =>
                  setEditing((p) => ({
                    ...p,
                    depositAmount: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">Sólo aplica si activas el depósito.</div>
            </div>

            {/* Textos */}
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Instrucciones de preparación (opcional)</label>
              <textarea
                placeholder="Ej: Evita alcohol 24h antes."
                value={editing.prepInstructions}
                onChange={(e) => setEditing((p) => ({ ...p, prepInstructions: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
                rows={2}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Cuidados posteriores (opcional)</label>
              <textarea
                placeholder="Ej: No exponerse al sol 48h."
                value={editing.postCare}
                onChange={(e) => setEditing((p) => ({ ...p, postCare: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
                rows={2}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Contraindicaciones (opcional)</label>
              <textarea
                placeholder="Ej: Embarazo, trastornos de coagulación…"
                value={editing.contraindications}
                onChange={(e) => setEditing((p) => ({ ...p, contraindications: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
                rows={2}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Notas internas (opcional)</label>
              <textarea
                placeholder="Visible sólo para el equipo."
                value={editing.notes}
                onChange={(e) => setEditing((p) => ({ ...p, notes: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
                rows={2}
              />
            </div>

            {/* URL pública */}
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">URL pública (opcional)</label>
              <input
                placeholder="Landing del servicio"
                value={editing.pageUrl}
                onChange={(e) => setEditing((p) => ({ ...p, pageUrl: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
              />
              <div className="mt-1 text-[11px] text-slate-500">Se puede usar en mensajes de confirmación.</div>
            </div>

            {/* Staff requerido */}
            <div className="sm:col-span-2">
              <div className="text-xs text-slate-400 mb-1">Profesionales requeridos (opcional)</div>
              <div className="flex flex-wrap gap-2">
                {staff.map(s => (
                  <label
                    key={s.id}
                    className="text-sm flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.03] px-2 py-1 hover:bg-white/[.06] transition"
                  >
                    <input
                      type="checkbox"
                      checked={!!editing.requiredStaffIds.includes(s.id)}
                      onChange={(e) => {
                        const set = new Set<number>(editing.requiredStaffIds)
                        if (e.target.checked) set.add(s.id)
                        else set.delete(s.id)
                        setEditing(p => ({ ...p, requiredStaffIds: Array.from(set) }))
                      }}
                      className="h-4 w-4"
                    />
                    {s.name} <span className="text-xs text-slate-400">({s.role})</span>
                  </label>
                ))}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Si seleccionas roles, la IA sólo propondrá horarios con quienes cumplan.
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
                  <button
                    onClick={() => confirmAndDelete(editing as unknown as Procedure)}
                    className="ml-auto px-3 py-2 rounded-xl border border-white/10 bg-white/[.02] hover:bg-red-500/10 hover:border-red-500/50 text-red-200 flex items-center gap-2"
                    title="Eliminar este servicio"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                ) : (
                  <span className="ml-auto text-[11px] text-slate-400 self-center">
                    Crea o selecciona un servicio para editar.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nota inferior */}
      <div className="text-[11px] text-slate-500">
        Tip: Mantén nombres claros y pocos alias; ayuda a la IA a reconocer mejor la intención del cliente.
      </div>
    </div>
  )
}
