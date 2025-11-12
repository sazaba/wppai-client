'use client'
import { useEffect, useState } from 'react'
import { listStaff, upsertStaff, type StaffRow } from '@/services/estetica.service'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '@/app/context/AuthContext'
import { Trash2 } from 'lucide-react'

const ROLES: StaffRow['role'][] = ['profesional', 'esteticista', 'medico']
const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function StaffPanel() {
  const { token } = useAuth() || {}
  const [rows, setRows] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Partial<StaffRow>>({
    name: '',
    role: 'esteticista',
    active: true,
    availability: null
  })

  async function reload() {
    setLoading(true)
    try {
      const s = await listStaff().catch(() => [])
      setRows(s)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
    reload()
  }, [])

  function startNew() {
    setEditing({ id: undefined, name: '', role: 'esteticista', active: true, availability: '' })
  }

  function editRow(r: StaffRow) {
    setEditing({ ...r, availability: r.availability ? JSON.stringify(r.availability, null, 2) : '' })
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
        availability: ((): any => {
          if (!editing?.availability) return null
          try { return JSON.parse(String(editing.availability)) } catch { return null }
        })(),
      }
      await upsertStaff(payload as any)
      await reload()
      startNew()
      await Swal.fire({
        title: '¡Guardado!',
        text: 'Staff guardado',
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
        text: e?.message || 'Error al guardar staff',
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

  useEffect(() => {
    if (!editing?.name && !loading && rows.length && editing?.id == null) startNew()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, rows.length])

  // ==== Helpers UI (sólo para rellenar el textarea; no altera la lógica) ====
  function fillAvailabilityPreset(kind: 'none' | 'split' | 'compact') {
    if (kind === 'none') {
      setEditing(p => ({ ...p!, availability: '' }))
      return
    }
    if (kind === 'split') {
      const tpl = [
        { day: 'mon', blocks: [['09:00','13:00'],['14:00','18:00']] },
        { day: 'tue', blocks: [['09:00','13:00'],['14:00','18:00']] },
        { day: 'wed', blocks: [['09:00','13:00'],['14:00','18:00']] },
        { day: 'thu', blocks: [['09:00','13:00'],['14:00','18:00']] },
        { day: 'fri', blocks: [['09:00','13:00'],['14:00','18:00']] },
      ]
      setEditing(p => ({ ...p!, availability: JSON.stringify(tpl, null, 2) }))
      return
    }
    if (kind === 'compact') {
      const tpl = [
        { day: 'mon', blocks: [['10:00','18:00']] },
        { day: 'tue', blocks: [['10:00','18:00']] },
        { day: 'wed', blocks: [['10:00','18:00']] },
        { day: 'thu', blocks: [['10:00','18:00']] },
        { day: 'fri', blocks: [['10:00','18:00']] },
      ]
      setEditing(p => ({ ...p!, availability: JSON.stringify(tpl, null, 2) }))
    }
  }

  async function confirmAndDelete(r: StaffRow) {
    const result = await Swal.fire({
      title: 'Eliminar miembro',
      html: `<div class="text-slate-300">¿Seguro que deseas eliminar a <b>${(r.name || '').replace(/</g,'&lt;')}</b> del staff?</div>`,
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
      const res = await fetch(`${API}/api/estetica/staff/${r.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      })
      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.error || `No se pudo eliminar (#${r.id})`
        throw new Error(msg)
      }
      await reload()
      if (editing?.id === r.id) startNew()
      await Swal.fire({
        title: 'Eliminado',
        text: 'El miembro fue eliminado correctamente.',
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

                    {/* Botón eliminar */}
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmAndDelete(r) }}
                      className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/[.02] hover:bg-red-500/10 hover:border-red-500/50 text-slate-300 hover:text-red-300 transition"
                      title="Eliminar"
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
            <div className="sm:col-span-1">
              <label className="text-xs text-slate-400 mb-1 block">Rol</label>
              <div className="relative">
                <select
                  value={editing?.role ?? 'esteticista'}
                  onChange={(e) => setEditing((p) => ({ ...p!, role: e.target.value as StaffRow['role'] }))}
                  className="peer w-full appearance-none bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600 pr-10"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 peer-focus:text-violet-300"
                  viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">Define el tipo de profesional.</div>
            </div>

            {/* Estado */}
            <div className="sm:col-span-1">
              <label className="text-xs text-slate-400 mb-1 block">Estado</label>
              <label className="flex items-center gap-2 text-sm bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2">
                <input
                  type="checkbox"
                  checked={!!editing?.active}
                  onChange={(e) => setEditing((p) => ({ ...p!, active: e.target.checked }))}
                  className="h-4 w-4"
                />
                Activo (disponible para agendar)
              </label>
            </div>

            {/* Disponibilidad */}
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Disponibilidad del profesional (opcional)</label>

              {/* Atajos */}
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fillAvailabilityPreset('none')}
                  className="text-[11px] rounded-full px-3 py-1 border border-white/10 bg-white/[.02] hover:bg-white/[.06]"
                >
                  Sin disponibilidad (usar horario general)
                </button>
                <button
                  type="button"
                  onClick={() => fillAvailabilityPreset('split')}
                  className="text-[11px] rounded-full px-3 py-1 border border-white/10 bg-white/[.02] hover:bg-white/[.06]"
                >
                  L–V 9:00–13:00 & 14:00–18:00
                </button>
                <button
                  type="button"
                  onClick={() => fillAvailabilityPreset('compact')}
                  className="text-[11px] rounded-full px-3 py-1 border border-white/10 bg-white/[.02] hover:bg-white/[.06]"
                >
                  L–V 10:00–18:00
                </button>
              </div>

              <textarea
                placeholder={
`Opcional. Si este profesional atiende en horarios distintos al general, escribe los días y rangos.
Ejemplos válidos:
• L–V en dos jornadas: 09:00–13:00 y 14:00–18:00
• L–V jornada continua: 10:00–18:00
(Avanzado) Formato técnico que entiende el sistema:
[
  {"day":"mon","blocks":[["09:00","13:00"],["14:00","18:00"]]},
  {"day":"tue","blocks":[["09:00","13:00"],["14:00","18:00"]]}
]`
                }
                value={(editing?.availability as any) ?? ''}
                onChange={(e) => setEditing((p) => ({ ...p!, availability: e.target.value }))}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600 font-mono"
                rows={7}
              />
              <div className="mt-1 text-[11px] text-slate-500">
                Déjalo vacío para heredar el horario semanal del negocio. Usa los atajos de arriba si no quieres escribirlo.
              </div>
            </div>

            {/* Acciones */}
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

                {/* Eliminar desde el editor */}
                {editing?.id ? (
                  <button
                    onClick={() => confirmAndDelete(editing as StaffRow)}
                    className="ml-auto px-3 py-2 rounded-xl border border-white/10 bg-white/[.02] hover:bg-red-500/10 hover:border-red-500/50 text-red-200 flex items-center gap-2"
                    title="Eliminar este miembro"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                ) : (
                  <span className="ml-auto text-[11px] text-slate-400 self-center">
                    Crea o selecciona un profesional para editar.
                  </span>
                )}
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
