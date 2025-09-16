'use client'

import { useMemo } from 'react'

/* ================= Tipos exportados ================= */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type Vertical =
  | 'none'
  | 'salud'
  | 'bienestar'
  | 'automotriz'
  | 'veterinaria'
  | 'fitness'
  | 'otros'

export type AppointmentDay = {
  day: Weekday
  isOpen: boolean
  start1: string | null
  end1: string | null
  start2: string | null
  end2: string | null
}

export type AppointmentConfigValue = {
  appointmentEnabled: boolean
  appointmentVertical: Vertical
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentPolicies?: string
  appointmentReminders: boolean
  hours?: AppointmentDay[]
  appointmentServices?: string
}

type Props = {
  value: AppointmentConfigValue
  onChange: (patch: Partial<AppointmentConfigValue>) => void
}

/* ================= Helpers locales ================= */
const ORDER: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABEL: Record<Weekday, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/
const isHHMM = (s?: string | null) => !!(s && HHMM.test(s))

function normalizeHours(rows?: AppointmentDay[] | null): AppointmentDay[] {
  const base = new Map<Weekday, AppointmentDay>()
  for (const d of ORDER) {
    base.set(d, { day: d, isOpen: false, start1: null, end1: null, start2: null, end2: null })
  }
  if (Array.isArray(rows)) {
    for (const r of rows) {
      if (!ORDER.includes(r.day)) continue
      base.set(r.day, {
        day: r.day,
        isOpen: !!r.isOpen,
        start1: r.start1 ?? null,
        end1: r.end1 ?? null,
        start2: r.start2 ?? null,
        end2: r.end2 ?? null,
      })
    }
  }
  return ORDER.map((d) => base.get(d)!)
}

function clampBuffer(n: number) {
  if (!Number.isFinite(n)) return 10
  if (n < 0) return 0
  if (n > 240) return 240
  return Math.round(n)
}

/* ================= Componente ================= */
export default function AppointmentForm({ value, onChange }: Props) {
  const hours = useMemo(() => normalizeHours(value.hours), [value.hours])

  function patch<K extends keyof AppointmentConfigValue>(key: K, v: AppointmentConfigValue[K]) {
    onChange({ [key]: v } as Partial<AppointmentConfigValue>)
  }

  function patchDay(day: Weekday, partial: Partial<AppointmentDay>) {
    const next = hours.map((h) => (h.day === day ? { ...h, ...partial } : h))
    onChange({ hours: next })
  }

  function toggleDay(d: Weekday) {
    const current = hours.find((h) => h.day === d)!
    const nextOpen = !current.isOpen
    patchDay(d, {
      isOpen: nextOpen,
      start1: nextOpen ? current.start1 ?? '09:00' : null,
      end1: nextOpen ? current.end1 ?? '13:00' : null,
      start2: nextOpen ? current.start2 : null,
      end2: nextOpen ? current.end2 : null,
    })
  }

  function updateTime(d: Weekday, field: keyof AppointmentDay, val: string) {
    const safe = val || ''
    if (safe && !isHHMM(safe)) return
    patchDay(d, { [field]: safe ? safe : null } as any)
  }

  return (
    <div className="space-y-6">
      {/* Básicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
          <div>
            <div className="text-sm font-medium">Habilitar agenda</div>
            <div className="text-xs text-slate-400">Permite que la IA ofrezca y confirme citas</div>
          </div>
          <button
            type="button"
            onClick={() => patch('appointmentEnabled', !value.appointmentEnabled)}
            className={`w-12 h-7 rounded-full border transition ${
              value.appointmentEnabled
                ? 'bg-emerald-500/90 border-emerald-400'
                : 'bg-slate-700 border-slate-600'
            } relative`}
            aria-pressed={value.appointmentEnabled}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
                value.appointmentEnabled ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </label>

        <label className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
          <div className="text-sm font-medium mb-1">Vertical / Rol</div>
          <select
            value={value.appointmentVertical}
            onChange={(e) => patch('appointmentVertical', e.target.value as Vertical)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
          >
            <option value="none">Ninguno</option>
            <option value="salud">Salud</option>
            <option value="bienestar">Bienestar</option>
            <option value="automotriz">Automotriz</option>
            <option value="veterinaria">Veterinaria</option>
            <option value="fitness">Fitness</option>
            <option value="otros">Otros</option>
          </select>
        </label>

        <label className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
          <div className="text-sm font-medium mb-1">Zona horaria (IANA)</div>
          <input
            type="text"
            placeholder="America/Bogota"
            value={value.appointmentTimezone}
            onChange={(e) => patch('appointmentTimezone', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </label>

        <label className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium mb-1">Buffer entre citas (min)</div>
            <div className="text-xs text-slate-400">0–240</div>
          </div>
          <input
            type="number"
            min={0}
            max={240}
            value={value.appointmentBufferMin}
            onChange={(e) => patch('appointmentBufferMin', clampBuffer(parseInt(e.target.value, 10)))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium mb-1">Políticas visibles</div>
        <textarea
          rows={4}
          placeholder="Ej: Llegar 10 minutos antes. Reprogramaciones con 12h de antelación. ..."
          value={value.appointmentPolicies || ''}
          onChange={(e) => patch('appointmentPolicies', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
        />
      </label>

      <label className="block">
        <div className="text-sm font-medium mb-1">Servicios agendables</div>
        <textarea
          rows={5}
          placeholder={`Ejemplos:\n- Limpieza dental\n- Blanqueamiento\n- Consulta de valoración\n\nTambién puedes separar por comas.`}
          value={value.appointmentServices || ''}
          onChange={(e) => patch('appointmentServices', e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
        />
        <p className="mt-1 text-xs text-slate-400">
          La IA solo ofrecerá/agendará los servicios listados aquí.
        </p>
      </label>

      {/* Horario semanal */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Horario semanal</div>
        <div className="divide-y divide-slate-800">
          {hours.map((h) => (
            <div key={h.day} className="px-4 py-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleDay(h.day)}
                  className={`w-10 h-6 rounded-full border transition ${
                    h.isOpen ? 'bg-emerald-500/90 border-emerald-400' : 'bg-slate-700 border-slate-600'
                  } relative`}
                  aria-pressed={h.isOpen}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                      h.isOpen ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
                <div className="text-sm">{DAY_LABEL[h.day]}</div>
              </div>

              <div className="sm:col-span-9 grid grid-cols-2 sm:grid-cols-8 gap-2">
                {/* Bloque 1 */}
                <input
                  type="time"
                  value={h.start1 || ''}
                  disabled={!h.isOpen}
                  onChange={(e) => updateTime(h.day, 'start1', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                />
                <input
                  type="time"
                  value={h.end1 || ''}
                  disabled={!h.isOpen}
                  onChange={(e) => updateTime(h.day, 'end1', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                />
                {/* Bloque 2 */}
                <input
                  type="time"
                  value={h.start2 || ''}
                  disabled={!h.isOpen}
                  onChange={(e) => updateTime(h.day, 'start2', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                />
                <input
                  type="time"
                  value={h.end2 || ''}
                  disabled={!h.isOpen}
                  onChange={(e) => updateTime(h.day, 'end2', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                />

                <div className="col-span-2 sm:col-span-4 text-xs text-slate-500 self-center">
                  {h.isOpen ? 'Bloques: 1 obligatorio, 2 opcional.' : 'Cerrado'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
