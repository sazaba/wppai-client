'use client'

import React, { useMemo } from 'react'
import { Switch } from '@headlessui/react'
import { Calendar, Clock, Globe2 } from 'lucide-react'

type Vertical = 'none' | 'salud' | 'bienestar' | 'automotriz' | 'veterinaria' | 'fitness' | 'otros'

export type WorkDay = {
  day: 1|2|3|4|5|6|7   // 1=Lunes ... 7=Domingo
  enabled: boolean
  start: string        // "HH:MM"
  end: string          // "HH:MM"
}

export type AppointmentConfigValue = {
  appointmentEnabled: boolean
  appointmentVertical: Vertical
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentWorkHours: WorkDay[] | null
  appointmentPolicies: string | null
  appointmentReminders: boolean
}

export default function AppointmentForm({
  value,
  onChange
}:{
  value: AppointmentConfigValue
  onChange: (patch: Partial<AppointmentConfigValue>) => void
}) {
  const v = value

  // si viene null, proponemos una plantilla por defecto
  const work = useMemo<WorkDay[]>(() => {
    if (Array.isArray(v.appointmentWorkHours) && v.appointmentWorkHours.length === 7) return v.appointmentWorkHours as WorkDay[]
    return [
      { day:1, enabled:true,  start:'08:00', end:'18:00' },
      { day:2, enabled:true,  start:'08:00', end:'18:00' },
      { day:3, enabled:true,  start:'08:00', end:'18:00' },
      { day:4, enabled:true,  start:'08:00', end:'18:00' },
      { day:5, enabled:true,  start:'08:00', end:'13:00' },
      { day:6, enabled:false, start:'',      end:''      },
      { day:7, enabled:false, start:'',      end:''      },
    ]
  }, [v.appointmentWorkHours])

  const setWorkAt = (dayIndex:number, patch: Partial<WorkDay>) => {
    const next = [...work]
    next[dayIndex] = { ...next[dayIndex], ...patch } as WorkDay
    onChange({ appointmentWorkHours: next })
  }

  const daysNames = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
  const tzList = [
    'America/Bogota','America/Lima','America/Mexico_City','America/Argentina/Buenos_Aires',
    'America/Santiago','America/Guayaquil','America/Caracas','UTC','Europe/Madrid'
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/30">
            <Calendar className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-300">Agenda y Citas</div>
            <div className="text-xs text-slate-400">
              Habilita el calendario y define horarios, zona horaria y políticas para reservas.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Desactivada</span>
            <Switch
              checked={v.appointmentEnabled}
              onChange={(b)=>onChange({ appointmentEnabled: b })}
              className={`${v.appointmentEnabled ? 'bg-emerald-500' : 'bg-slate-700'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
            >
              <span className={`${v.appointmentEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
            </Switch>
            <span className="text-xs text-slate-400">Activada</span>
          </div>
        </div>
      </div>

      {/* Config básica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vertical */}
        <label className="block">
          <span className="text-xs text-slate-300">Tipo de negocio</span>
          <select
            value={v.appointmentVertical}
            onChange={(e)=>onChange({ appointmentVertical: e.target.value as Vertical })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="none">General</option>
            <option value="salud">Salud (odontología, estética, nutrición)</option>
            <option value="bienestar">Bienestar (spa, peluquería, barbería)</option>
            <option value="automotriz">Automotriz (taller, mantenimiento)</option>
            <option value="veterinaria">Veterinaria</option>
            <option value="fitness">Fitness (gimnasio, entrenador)</option>
            <option value="otros">Otros</option>
          </select>
        </label>

        {/* Timezone */}
        <label className="block">
          <span className="text-xs text-slate-300 flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" /> Zona horaria</span>
          <select
            value={v.appointmentTimezone}
            onChange={(e)=>onChange({ appointmentTimezone: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            {tzList.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </label>

        {/* Buffer */}
        <label className="block">
          <span className="text-xs text-slate-300 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Buffer entre citas (min)</span>
          <input
            type="number"
            min={0}
            value={v.appointmentBufferMin}
            onChange={(e)=>onChange({ appointmentBufferMin: Number(e.target.value || 0) })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            placeholder="10"
          />
        </label>
      </div>

      {/* Horarios semanales */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="text-sm text-slate-300 mb-3">Horario de atención</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {work.map((d, i)=>(
            <div key={d.day} className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-200">{daysNames[i]}</span>
                <Switch
                  checked={d.enabled}
                  onChange={(b)=>setWorkAt(i, { enabled:b })}
                  className={`${d.enabled ? 'bg-emerald-500' : 'bg-slate-700'} relative inline-flex h-5 w-10 items-center rounded-full transition`}
                >
                  <span className={`${d.enabled ? 'translate-x-5' : 'translate-x-1'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition`} />
                </Switch>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={d.start}
                  onChange={(e)=>setWorkAt(i, { start:e.target.value })}
                  disabled={!d.enabled}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white disabled:opacity-50"
                />
                <input
                  type="time"
                  value={d.end}
                  onChange={(e)=>setWorkAt(i, { end:e.target.value })}
                  disabled={!d.enabled}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white disabled:opacity-50"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Políticas + recordatorios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-slate-300">Políticas de agendamiento (opcional)</span>
          <textarea
            rows={6}
            value={v.appointmentPolicies ?? ''}
            onChange={(e)=>onChange({ appointmentPolicies: e.target.value || null })}
            placeholder="Ej.: Llegar 10 minutos antes. Cancelaciones con 24h de antelación..."
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-white/60"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <input
            type="checkbox"
            checked={v.appointmentReminders}
            onChange={(e)=>onChange({ appointmentReminders: e.target.checked })}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900"
          />
          <div className="text-sm text-slate-300">
            Enviar recordatorios automáticos
            <div className="text-xs text-slate-500">Confirmación y alertas previas (24h / 2h) a la cita.</div>
          </div>
        </label>
      </div>
    </div>
  )
}
