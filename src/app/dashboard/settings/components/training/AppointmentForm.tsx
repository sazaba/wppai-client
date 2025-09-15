'use client'

import React from 'react'

type Vertical = 'none' | 'salud' | 'bienestar' | 'automotriz' | 'veterinaria' | 'fitness' | 'otros'

export default function AppointmentForm({
  value,
  onChange,
}: {
  value: {
    appointmentEnabled: boolean
    appointmentVertical: Vertical
    appointmentTimezone: string
    appointmentBufferMin: number
    appointmentWorkHours: any
    appointmentPolicies?: string
    appointmentReminders: boolean
  }
  onChange: (patch: Partial<typeof value>) => void
}) {
  const v = value

  return (
    <div className="rounded-2xl border border-slate-800 p-4 sm:p-5 bg-slate-900">
      <h3 className="text-base font-semibold mb-3">Agenda de citas</h3>
      <p className="text-sm text-slate-400 mb-4">
        Activa la agenda para que el sistema y el asistente manejen horarios y reservas.
      </p>

      <div className="space-y-4">
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm">Habilitar agenda</span>
          <input
            type="checkbox"
            checked={v.appointmentEnabled}
            onChange={(e) => onChange({ appointmentEnabled: e.target.checked })}
            className="h-5 w-5 accent-violet-600"
          />
        </label>

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
              value={v.appointmentBufferMin}
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

        {/* WorkHours: puedes reemplazar por un editor más avanzado cuando quieras */}
        <label className="space-y-1 block">
          <span className="text-xs text-slate-400">Horario de trabajo (JSON simple por ahora)</span>
          <textarea
            rows={4}
            value={JSON.stringify(v.appointmentWorkHours ?? {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value || '{}')
                onChange({ appointmentWorkHours: parsed })
              } catch {
                // no rompas por JSON inválido; el usuario puede corregir
              }
            }}
            placeholder='{"mon":[["08:00","12:00"],["14:00","18:00"]], "sat":[["09:00","13:00"]]}'
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </label>
      </div>
    </div>
  )
}
