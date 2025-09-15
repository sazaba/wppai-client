'use client'

import React from 'react'

/* =======================
   Tipos explícitos (UI)
   ======================= */

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
  // HH:MM (24h) o null si vacío
  start1?: string | null
  end1?: string | null
  start2?: string | null
  end2?: string | null
}

export type AppointmentConfigValue = {
  appointmentEnabled: boolean
  appointmentVertical: Vertical
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentPolicies?: string
  appointmentReminders: boolean
  // filas por día (si ya las traes del backend puedes mapearlas a esto)
  hours?: AppointmentDay[]
}

type Props = {
  value: AppointmentConfigValue
  onChange: (patch: Partial<AppointmentConfigValue>) => void
}

/* =======================
   Helpers / UI inputs
   ======================= */

const dayLabel: Record<Weekday, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
}

function TimeInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value?: string | null
  onChange: (val: string | null) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <input
      type="time"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? e.target.value : null)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50"
    />
  )
}

/* =======================
   Componente principal
   ======================= */

export default function AppointmentForm({ value, onChange }: Props) {
  const v = value

  // Creamos un arreglo de 7 días si no viene desde arriba
  const rows: AppointmentDay[] =
    v.hours && v.hours.length
      ? v.hours
      : (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as Weekday[]).map((d) => ({
          day: d,
          isOpen: false,
          start1: null,
          end1: null,
          start2: null,
          end2: null,
        }))

  // Actualiza una fila por día
  function updateDay(day: Weekday, patch: Partial<AppointmentDay>) {
    const next = rows.map((r) => (r.day === day ? { ...r, ...patch } : r))
    onChange({ hours: next })
  }

  return (
    <div className="rounded-2xl border border-slate-800 p-4 sm:p-5 bg-slate-900">
      <h3 className="text-base font-semibold mb-3">Agenda de citas</h3>
      <p className="text-sm text-slate-400 mb-4">
        Activa la agenda para que el sistema y el asistente manejen horarios y reservas.
      </p>

      <div className="space-y-4">
        {/* Toggle principal */}
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm">Habilitar agenda</span>
          <input
            type="checkbox"
            checked={!!v.appointmentEnabled}
            onChange={(e) => onChange({ appointmentEnabled: e.target.checked })}
            className="h-5 w-5 accent-violet-600"
          />
        </label>

        {/* Selecciones generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-xs text-slate-400">Vertical</span>
            <select
              value={v.appointmentVertical}
              onChange={(e) => onChange({ appointmentVertical: e.target.value as Vertical })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <option value="none">Genérico</option>
              <option value="salud">Salud</option>
              <option value="bienestar">Bienestar</option>
              <option value="automotriz">Automotriz</option>
              <option value="veterinaria">Veterinaria</option>
              <option value="fitness">Fitness</option>
              <option value="otros">Otros</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs text-slate-400">Zona horaria</span>
            <input
              type="text"
              value={v.appointmentTimezone}
              onChange={(e) => onChange({ appointmentTimezone: e.target.value })}
              placeholder="America/Bogota"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs text-slate-400">Buffer entre citas (min)</span>
            <input
              type="number"
              min={0}
              value={Number.isFinite(v.appointmentBufferMin) ? v.appointmentBufferMin : 0}
              onChange={(e) => onChange({ appointmentBufferMin: Number(e.target.value || 0) })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs text-slate-400">Recordatorios automáticos</span>
            <select
              value={v.appointmentReminders ? '1' : '0'}
              onChange={(e) => onChange({ appointmentReminders: e.target.value === '1' })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <option value="1">Activados</option>
              <option value="0">Desactivados</option>
            </select>
          </label>
        </div>

        {/* Políticas */}
        <label className="space-y-1 block">
          <span className="text-xs text-slate-400">Políticas / indicaciones</span>
          <textarea
            rows={3}
            value={v.appointmentPolicies || ''}
            onChange={(e) => onChange({ appointmentPolicies: e.target.value })}
            placeholder="Ej: Llegar 10 minutos antes. Cancelaciones con 24h de antelación."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </label>

        {/* Horarios por día (2 franjas máximo) */}
        <div className="mt-4 rounded-xl border border-slate-800">
          <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-800">
            Horarios por día (formato 24h)
          </div>

          <div className="divide-y divide-slate-800">
            {rows.map((r) => {
              const disabled = !v.appointmentEnabled
              return (
                <div key={r.day} className="p-3 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-violet-600"
                      checked={r.isOpen}
                      onChange={(e) => updateDay(r.day, { isOpen: e.target.checked })}
                      disabled={disabled}
                    />
                    <div className="text-sm">{dayLabel[r.day]}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <TimeInput
                      value={r.start1}
                      onChange={(val) => updateDay(r.day, { start1: val })}
                      placeholder="08:00"
                      disabled={disabled || !r.isOpen}
                    />
                    <TimeInput
                      value={r.end1}
                      onChange={(val) => updateDay(r.day, { end1: val })}
                      placeholder="12:00"
                      disabled={disabled || !r.isOpen}
                    />
                    <TimeInput
                      value={r.start2}
                      onChange={(val) => updateDay(r.day, { start2: val })}
                      placeholder="14:00"
                      disabled={disabled || !r.isOpen}
                    />
                    <TimeInput
                      value={r.end2}
                      onChange={(val) => updateDay(r.day, { end2: val })}
                      placeholder="18:00"
                      disabled={disabled || !r.isOpen}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
