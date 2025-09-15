'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { saveAppointmentConfig, normalizeDays } from '@/lib/appointments'

/* =======================
   Tipos UI (alineados a Prisma)
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

export type ProviderInput = {
  id?: number
  nombre?: string          // opcional en el front; si viene vacío no se envía al backend
  email?: string
  phone?: string
  cargo?: string
  colorHex?: string
  activo?: boolean
}

export type AppointmentConfigValue = {
  appointmentEnabled: boolean
  appointmentVertical: Vertical
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentPolicies?: string
  appointmentReminders: boolean
  hours?: AppointmentDay[]
  /** Nuevo: agente/proveedor opcional */
  provider?: ProviderInput | null
}

type Props = {
  value: AppointmentConfigValue
  onChange: (patch: Partial<AppointmentConfigValue>) => void
}

const DAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const dayLabel: Record<Weekday, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
}

function emptyWeek(): AppointmentDay[] {
  return DAYS.map((d) => ({
    day: d,
    isOpen: false,
    start1: null,
    end1: null,
    start2: null,
    end2: null,
  }))
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1) Garantiza que siempre haya 7 filas una sola vez
  useEffect(() => {
    if (!v.hours || v.hours.length !== 7) {
      onChange({ hours: emptyWeek() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // solo al montar

  // 2) Memo de filas
  const rows: AppointmentDay[] = useMemo(() => {
    return v.hours && v.hours.length === 7 ? v.hours : emptyWeek()
  }, [v.hours])

  // 3) Actualiza una fila por día
  function updateDay(day: Weekday, patch: Partial<AppointmentDay>) {
    const next = rows.map((r) => (r.day === day ? { ...r, ...patch } : r))
    onChange({ hours: next })
  }

  // 4) Toggle de día
  function toggleDay(day: Weekday, isOpen: boolean) {
    if (!isOpen) {
      updateDay(day, { isOpen: false, start1: null, end1: null, start2: null, end2: null })
    } else {
      updateDay(day, { isOpen: true })
    }
  }

  const disabledAll = !v.appointmentEnabled

  /* =======================
     Guardar (config + hours + provider)
     ======================= */
  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      const hasOpen = (v.hours || []).some((d) => d.isOpen)
      if (v.appointmentEnabled && !hasOpen) {
        console.warn('Agenda activa sin días abiertos.')
      }

      // si no hay nombre, no enviamos provider
      const providerToSend =
        v.provider && v.provider.nombre && v.provider.nombre.trim()
          ? v.provider
          : null

      await saveAppointmentConfig({
        appointmentEnabled: !!v.appointmentEnabled,
        appointmentVertical: v.appointmentVertical,
        appointmentTimezone: v.appointmentTimezone || 'America/Bogota',
        appointmentBufferMin: Number.isFinite(v.appointmentBufferMin)
          ? v.appointmentBufferMin
          : 10,
        appointmentPolicies: v.appointmentPolicies ?? '',
        appointmentReminders: !!v.appointmentReminders,
        hours: normalizeDays(v.hours),
        provider: providerToSend,
      })

      alert('Configuración de agenda guardada ✅')
    } catch (e: any) {
      console.error('[AppointmentForm] guardar agenda error:', e)
      const msg = e?.response?.data?.error || e?.message || 'No se pudo guardar la agenda'
      setError(msg)
      alert(`❌ ${msg}`)
    } finally {
      setSaving(false)
    }
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
              disabled={disabledAll}
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
              disabled={disabledAll}
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
              disabled={disabledAll}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs text-slate-400">Recordatorios automáticos</span>
            <select
              value={v.appointmentReminders ? '1' : '0'}
              onChange={(e) => onChange({ appointmentReminders: e.target.value === '1' })}
              disabled={disabledAll}
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
            disabled={disabledAll}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </label>

        {/* Horarios por día */}
        <div className="mt-4 rounded-xl border border-slate-800">
          <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-800">
            Horarios por día (formato 24h)
          </div>

          <div className="divide-y divide-slate-800">
            {rows.map((r) => {
              const disabled = disabledAll
              return (
                <div
                  key={r.day}
                  className="p-3 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-violet-600"
                      checked={!!r.isOpen}
                      onChange={(e) => toggleDay(r.day, e.target.checked)}
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

        {/* ===== Profesional principal (opcional) ===== */}
        <div className="rounded-xl border border-slate-800">
          <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-800">
            Profesional principal (opcional)
          </div>
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-slate-400">Nombre</span>
              <input
                type="text"
                value={v.provider?.nombre ?? ''}
                onChange={(e) =>
                  onChange({
                    provider: {
                      ...(v.provider ?? { nombre: '' }),
                      nombre: e.target.value,
                    },
                  })
                }
                placeholder="Ej: Dra. Ana Pérez"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs text-slate-400">Cargo</span>
              <input
                type="text"
                value={v.provider?.cargo ?? ''}
                onChange={(e) =>
                  onChange({
                    provider: {
                      ...(v.provider ?? { nombre: '' }),
                      cargo: e.target.value,
                    },
                  })
                }
                placeholder="Dermatóloga / Odontólogo / Esteticista"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs text-slate-400">Email</span>
              <input
                type="email"
                value={v.provider?.email ?? ''}
                onChange={(e) =>
                  onChange({
                    provider: {
                      ...(v.provider ?? { nombre: '' }),
                      email: e.target.value,
                    },
                  })
                }
                placeholder="contacto@negocio.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs text-slate-400">Teléfono</span>
              <input
                type="tel"
                value={v.provider?.phone ?? ''}
                onChange={(e) =>
                  onChange({
                    provider: {
                      ...(v.provider ?? { nombre: '' }),
                      phone: e.target.value,
                    },
                  })
                }
                placeholder="+57 300 000 0000"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs text-slate-400">Color (hex)</span>
              <input
                type="text"
                value={v.provider?.colorHex ?? ''}
                onChange={(e) =>
                  onChange({
                    provider: {
                      ...(v.provider ?? { nombre: '' }),
                      colorHex: e.target.value,
                    },
                  })
                }
                placeholder="#8b5cf6"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </label>

            {v.provider?.id ? <input type="hidden" value={v.provider.id} /> : null}
          </div>
          <div className="px-3 pb-3 text-[11px] text-slate-500">
            * Si dejas “Nombre” vacío, no se guardará ningún profesional.
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {error && <span className="text-xs text-rose-400">{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar agenda'}
          </button>
        </div>
      </div>
    </div>
  )
}
