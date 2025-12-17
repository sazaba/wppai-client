'use client'
import { useEffect, useState } from 'react'
import { listStaff, upsertStaff, type StaffRow } from '@/services/estetica.service'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '@/app/context/AuthContext'
import { Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react'

// Definición de tipos para la UI de horarios
type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
type DaySchedule = {
  day: DayKey
  label: string
  active: boolean
  start: string
  end: string
}

const ROLES: StaffRow['role'][] = ['profesional', 'esteticista', 'medico']
const API = process.env.NEXT_PUBLIC_API_URL || ''

// Configuración base para inicializar horarios vacíos
const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'mon', label: 'Lunes',     active: true,  start: '09:00', end: '18:00' },
  { day: 'tue', label: 'Martes',    active: true,  start: '09:00', end: '18:00' },
  { day: 'wed', label: 'Miércoles', active: true,  start: '09:00', end: '18:00' },
  { day: 'thu', label: 'Jueves',    active: true,  start: '09:00', end: '18:00' },
  { day: 'fri', label: 'Viernes',   active: true,  start: '09:00', end: '18:00' },
  { day: 'sat', label: 'Sábado',    active: false, start: '09:00', end: '14:00' },
  { day: 'sun', label: 'Domingo',   active: false, start: '00:00', end: '00:00' },
]

export default function StaffPanel() {
  const { token } = useAuth() || {}
  const [rows, setRows] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Estado del formulario
  const [editing, setEditing] = useState<Partial<StaffRow>>({
    name: '',
    role: 'esteticista',
    active: true,
    availability: null
  })

  // Estado local para manejar la UI de horarios (array de 7 días)
  const [scheduleUi, setScheduleUi] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  // Switch para saber si usamos horario personalizado o el general
  const [useCustomSchedule, setUseCustomSchedule] = useState(false)

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

  // Iniciar nuevo Staff
  function startNew() {
    setEditing({ id: undefined, name: '', role: 'esteticista', active: true, availability: null })
    setScheduleUi(DEFAULT_SCHEDULE) // Reset UI
    setUseCustomSchedule(false)     // Por defecto usa horario general
  }

  // Editar existente
  function editRow(r: StaffRow) {
    setEditing(r)
    
    // Parsear availability para la UI
    if (r.availability && Array.isArray(r.availability) && r.availability.length > 0) {
      setUseCustomSchedule(true)
      // Fusionar con el default para asegurar que estén los 7 días y etiquetas correctas
      const merged = DEFAULT_SCHEDULE.map(def => {
        const found = (r.availability as DaySchedule[]).find(x => x.day === def.day)
        return found ? { ...def, ...found } : def
      })
      setScheduleUi(merged)
    } else {
      setUseCustomSchedule(false)
      setScheduleUi(DEFAULT_SCHEDULE)
    }
  }

  // Actualizar un día específico en la UI
  function updateDay(day: DayKey, field: keyof DaySchedule, value: any) {
    setScheduleUi(prev => prev.map(d => d.day === day ? { ...d, [field]: value } : d))
  }

  async function save() {
    if (!editing?.name || !editing.name.trim()) {
      await Swal.fire({
        title: 'Campo requerido',
        text: 'El nombre es obligatorio',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#7c3aed',
        customClass: { popup: 'rounded-2xl border border-white/10' },
      })
      return
    }

    setSaving(true)
    try {
      // Preparar payload final
      const payload = {
        ...editing,
        // Si el switch está activado, enviamos el array de scheduleUi. Si no, null.
        availability: useCustomSchedule ? scheduleUi : null
      }

      await upsertStaff(payload as any)
      await reload()
      startNew()
      
      await Swal.fire({
        icon: 'success',
        title: 'Guardado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#0f172a',
        color: '#fff'
      })

    } catch (e: any) {
      await Swal.fire({
        title: 'Error al guardar',
        text: e?.message || 'Ocurrió un error inesperado',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#ef4444',
        customClass: { popup: 'rounded-2xl border border-white/10' },
      })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!editing?.name && !loading && rows.length && editing?.id == null) startNew()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, rows.length])

  async function confirmAndDelete(r: StaffRow) {
    const result = await Swal.fire({
      title: 'Eliminar miembro',
      html: `<div class="text-slate-300">¿Eliminar a <b>${(r.name || '').replace(/</g,'&lt;')}</b>?</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0f172a',
      color: '#e2e8f0',
      iconColor: '#f59e0b',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      customClass: { popup: 'rounded-2xl border border-white/10' },
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
      })
      if (!res.ok) throw new Error('No se pudo eliminar')
      await reload()
      if (editing?.id === r.id) startNew()
    } catch (e: any) {
      await Swal.fire({ title: 'Error', text: e.message, icon: 'error', background: '#0f172a', color: '#fff' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">Staff / Profesionales</h2>
        <p className="text-sm text-slate-400">
          Configura tu equipo y sus turnos individuales para que la Agenda Inteligente asigne citas correctamente.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* ====== Columna Izquierda: Lista (4 columnas) ====== */}
        <div className="xl:col-span-4 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl flex flex-col h-[fit-content] max-h-[85vh]">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="text-sm font-semibold text-white">Equipo</div>
            <div className="text-[11px] text-slate-400">{loading ? '...' : `${rows.length}`}</div>
          </div>

          <div className="p-2 space-y-2 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No hay profesionales.<br/>Crea el primero.
              </div>
            ) : (
              rows.map((r) => (
                <div
                  key={r.id}
                  onClick={() => editRow(r)}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer group relative
                    ${editing?.id === r.id 
                      ? 'bg-violet-500/10 border-violet-500/50 ring-1 ring-violet-500/20' 
                      : 'border-white/5 bg-white/[.03] hover:bg-white/[.06] hover:border-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className={`font-medium text-sm ${editing?.id === r.id ? 'text-violet-200' : 'text-slate-200'}`}>
                        {r.name}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize mt-0.5 flex items-center gap-2">
                        <span>{r.role}</span>
                        {!r.active && <span className="text-red-400 font-medium">• Inactivo</span>}
                        {r.availability && <span className="text-emerald-400">• Horario Personal</span>}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmAndDelete(r) }}
                      disabled={deletingId === r.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-white/10 mt-auto bg-slate-950/30 rounded-b-2xl">
            <button 
              onClick={startNew}
              className="w-full py-2 rounded-xl border border-dashed border-white/20 text-slate-400 text-xs hover:bg-white/5 hover:text-white transition flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-3 w-3"/> Agregar nuevo
            </button>
          </div>
        </div>

        {/* ====== Columna Derecha: Editor (8 columnas) ====== */}
        <div className="xl:col-span-8 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl flex flex-col">
          
          {/* Toolbar del Editor */}
          <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                {editing?.id ? 'Editar Profesional' : 'Registrar Nuevo Profesional'}
              </h3>
              <p className="text-xs text-slate-400">Información básica y disponibilidad semanal.</p>
            </div>
            
            <div className="flex items-center gap-2">
               <button
                onClick={startNew}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shadow-lg shadow-violet-900/20 disabled:opacity-50 transition flex items-center gap-2"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          <div className="p-5 space-y-8 overflow-y-auto max-h-[80vh]">
            
            {/* Sección 1: Datos Básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={editing?.name ?? ''}
                  onChange={(e) => setEditing(p => ({ ...p!, name: e.target.value }))}
                  placeholder="Ej. Dra. Camila Torres"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500/50 outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Rol en la empresa</label>
                <select
                  value={editing?.role ?? 'esteticista'}
                  onChange={(e) => setEditing(p => ({ ...p!, role: e.target.value as any }))}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500/50 outline-none appearance-none"
                >
                  {ROLES.map(r => <option key={r} value={r} className="bg-slate-900 capitalize">{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Estado del perfil</label>
                <div 
                  onClick={() => setEditing(p => ({ ...p!, active: !p!.active }))}
                  className={`cursor-pointer w-full border rounded-xl px-3 py-2.5 text-sm flex items-center justify-between transition select-none
                    ${editing?.active 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                      : 'bg-slate-800/30 border-slate-700 text-slate-400'}`}
                >
                  <span>{editing?.active ? 'Activo (Recibe citas)' : 'Inactivo (Oculto)'}</span>
                  {editing?.active ? <CheckCircle2 className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
                </div>
              </div>
            </div>

            {/* Sección 2: Configuración de Horario Visual */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-violet-400" />
                    Horario de Trabajo
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Define qué días y horas trabaja este profesional específicamente.
                  </p>
                </div>
                
                {/* Switch Global de Horario Personalizado */}
                <label className="inline-flex items-center cursor-pointer gap-3">
                  <span className="text-xs text-slate-300 text-right leading-tight">
                    {useCustomSchedule ? 'Horario Personalizado' : 'Usar Horario General'}
                  </span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={useCustomSchedule} 
                      onChange={(e) => setUseCustomSchedule(e.target.checked)} 
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </div>
                </label>
              </div>

              {!useCustomSchedule ? (
                <div className="p-6 rounded-xl border border-dashed border-white/10 bg-white/[.02] text-center">
                  <p className="text-sm text-slate-400">
                    Este profesional seguirá el <b>Horario General de Apertura</b> de la empresa.<br/>
                    (Ideal para staff de tiempo completo).
                  </p>
                  <button 
                    onClick={() => setUseCustomSchedule(true)}
                    className="mt-3 text-xs text-violet-300 hover:text-violet-200 underline"
                  >
                    Personalizar turnos
                  </button>
                </div>
              ) : (
                <div className="space-y-1 bg-slate-950/30 rounded-xl border border-white/5 p-1">
                  {/* Grid de días */}
                  {scheduleUi.map((daySch) => (
                    <div 
                      key={daySch.day} 
                      className={`grid grid-cols-12 items-center gap-2 p-2 rounded-lg transition-colors
                        ${daySch.active ? 'bg-white/[.03]' : 'opacity-50'}`}
                    >
                      {/* Toggle del día */}
                      <div className="col-span-3 sm:col-span-2 flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={daySch.active}
                          onChange={(e) => updateDay(daySch.day, 'active', e.target.checked)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                        <span className={`text-sm font-medium ${daySch.active ? 'text-white' : 'text-slate-500'}`}>
                          {daySch.label}
                        </span>
                      </div>

                      {/* Selectores de Hora */}
                      <div className="col-span-9 sm:col-span-10 flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            disabled={!daySch.active}
                            value={daySch.start}
                            onChange={(e) => updateDay(daySch.day, 'start', e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-1 focus:ring-violet-500 outline-none"
                          />
                          <span className="text-slate-500 text-xs">a</span>
                          <input
                            type="time"
                            disabled={!daySch.active}
                            value={daySch.end}
                            onChange={(e) => updateDay(daySch.day, 'end', e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-1 focus:ring-violet-500 outline-none"
                          />
                        </div>
                        
                        <div className="hidden sm:block w-24 text-right">
                          <span className={`text-[10px] ${daySch.active ? 'text-emerald-400' : 'text-slate-600'}`}>
                            {daySch.active ? 'Disponible' : 'Descanso'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}