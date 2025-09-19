'use client'
import { useMemo } from 'react'

/* ================= Tipos exportados ================= */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

// Nuevo enum según Prisma (BusinessConfigAppt)
export type ApptVertical = 'odontologica' | 'estetica' | 'spa' | 'custom'

// Horario (se mantiene igual)
export type AppointmentDay = {
  day: Weekday
  isOpen: boolean
  start1: string | null
  end1: string | null
  start2: string | null
  end2: string | null
}

/** Valor del formulario (ampliado) */
export type AppointmentConfigValue = {
  // Base
  appointmentEnabled: boolean
  appointmentVertical: ApptVertical
  appointmentVerticalCustom?: string | null
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentPolicies?: string
  appointmentReminders: boolean

  // Servicios
  appointmentServices?: string // textarea (servicesText)

  // Logística
  location?: {
    name?: string | null
    address?: string | null
    mapsUrl?: string | null
    parkingInfo?: string | null
    virtualLink?: string | null
    instructionsArrival?: string | null
  }

  // Reglas
  rules?: {
    bookingWindowDays?: number | null
    maxDailyAppointments?: number | null
    cancellationWindowHours?: number | null
    noShowPolicy?: string | null
    depositRequired?: boolean | null
    depositAmount?: number | null
    blackoutDates?: string[] | null // opcional, no UI aquí
    overlapStrategy?: string | null // opcional
  }

  // Recordatorios
  reminders?: {
    schedule?: Array<{ offsetHours: number; channel: string }> | null // opcional (no UI aquí)
    templateId?: string | null
    postBookingMessage?: string | null
  }

  // Knowledge base
  kb?: {
    businessOverview?: string | null
    faqsText?: string | null // para pegar JSON o bullets; el backend puede parsear
    freeText?: string | null
  }

  // Horas (se mantiene)
  hours?: AppointmentDay[]
}

type Props = {
  value: AppointmentConfigValue
  onChange: (patch: Partial<AppointmentConfigValue>) => void
}

/* ===== Helper para enviar al backend (siempre aiMode='appointments') ===== */
export function toAppointmentConfigPayload(value: AppointmentConfigValue) {
  const hours = normalizeHours(value.hours)
  return {
    appointment: {
      enabled: value.appointmentEnabled,
      vertical: value.appointmentVertical,
      verticalCustom: value.appointmentVertical === 'custom'
        ? (value.appointmentVerticalCustom?.trim() || null)
        : null,
      timezone: value.appointmentTimezone,
      bufferMin: value.appointmentBufferMin,
      policies: value.appointmentPolicies ?? null,
      reminders: value.appointmentReminders,
      aiMode: 'appointments', // 👈 siempre para que la IA lo detecte
    },
    // servicios
    servicesText: (value.appointmentServices ?? '').trim() || null,

    // logística
    location: {
      name: value.location?.name ?? null,
      address: value.location?.address ?? null,
      mapsUrl: value.location?.mapsUrl ?? null,
      parkingInfo: value.location?.parkingInfo ?? null,
      virtualLink: value.location?.virtualLink ?? null,
      instructionsArrival: value.location?.instructionsArrival ?? null,
    },

    // reglas
    rules: {
      bookingWindowDays: value.rules?.bookingWindowDays ?? null,
      maxDailyAppointments: value.rules?.maxDailyAppointments ?? null,
      cancellationWindowHours: value.rules?.cancellationWindowHours ?? null,
      noShowPolicy: value.rules?.noShowPolicy ?? null,
      depositRequired: value.rules?.depositRequired ?? null,
      depositAmount: value.rules?.depositAmount ?? null,
    },

    // recordatorios
    reminders: {
      templateId: value.reminders?.templateId ?? null,
      postBookingMessage: value.reminders?.postBookingMessage ?? null,
      // schedule puedes manejarlo en otro subform si quieres
    },

    // KB (el backend puede mapear faqsText -> kbFAQs si es JSON válido)
    kb: {
      businessOverview: value.kb?.businessOverview ?? null,
      freeText: value.kb?.freeText ?? null,
      // opcional: si quieres, manda faqs como texto crudo y lo parseas en el controller
      faqs: safeParseJSON(value.kb?.faqsText),
    },

    // horas (AppointmentHour se mantiene igual)
    hours: hours.map(h => ({
      day: h.day,
      isOpen: h.isOpen,
      start1: h.start1,
      end1: h.end1,
      start2: h.start2,
      end2: h.end2,
    })),
  }
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

function safeParseJSON(maybe?: string | null) {
  if (!maybe) return null
  try {
    const parsed = JSON.parse(maybe)
    return parsed
  } catch {
    return null
  }
}

/* ================= Componente ================= */
export default function AppointmentForm({ value, onChange }: Props) {
  const hours = useMemo(() => normalizeHours(value.hours), [value.hours])

  function patch<K extends keyof AppointmentConfigValue>(key: K, v: AppointmentConfigValue[K]) {
    onChange({ [key]: v } as Partial<AppointmentConfigValue>)
  }
  function patchNested<T extends object>(key: keyof AppointmentConfigValue, partial: Partial<T>) {
    onChange({ [key]: { ...(value as any)[key], ...partial } } as any)
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
    <div className="space-y-8">
      {/* ====== 1) Activar agenda (IA) ====== */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Activar agenda con IA</div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div>
              <div className="text-sm font-medium">Habilitar agenda</div>
              <div className="text-xs text-slate-400">La IA ofrece y confirma citas automáticamente</div>
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

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="text-sm font-medium mb-1">Tipo de negocio (vertical)</div>
            <select
              value={value.appointmentVertical}
              onChange={(e) => patch('appointmentVertical', e.target.value as ApptVertical)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <option value="odontologica">Clínica Odontológica</option>
              <option value="estetica">Clínica Estética</option>
              <option value="spa">Spa</option>
              <option value="custom">Otra (especifica abajo)</option>
            </select>

            {value.appointmentVertical === 'custom' && (
              <input
                type="text"
                placeholder="Ej: Clínica Láser, Nutrición, Barbería..."
                value={value.appointmentVerticalCustom ?? ''}
                onChange={(e) => patch('appointmentVerticalCustom', e.target.value)}
                className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            )}
          </div>

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
              <div className="text-sm font-medium mb-1">Tiempo entre citas (min)</div>
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
      </section>

      {/* ====== 2) Servicios que la IA puede agendar ====== */}
      <section className="space-y-2">
        <label className="block">
          <div className="text-sm font-semibold mb-1">Servicios agendables (uno por línea o separados por coma)</div>
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

        <label className="block">
          <div className="text-sm font-semibold mb-1">Políticas visibles para el cliente</div>
          <textarea
            rows={4}
            placeholder="Ej: Llegar 10 minutos antes. Reprogramaciones con 12h de antelación. ..."
            value={value.appointmentPolicies || ''}
            onChange={(e) => patch('appointmentPolicies', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
          />
        </label>
      </section>

      {/* ====== 3) Dónde nos vemos (ubicación y logística) ====== */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Ubicación y logística</div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del lugar (ej: Clínica Centro)"
            value={value.location?.name ?? ''}
            onChange={(e) => patchNested('location', { name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Dirección (ej: Cra 10 # 20-30, Piso 2)"
            value={value.location?.address ?? ''}
            onChange={(e) => patchNested('location', { address: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Link de Google Maps"
            value={value.location?.mapsUrl ?? ''}
            onChange={(e) => patchNested('location', { mapsUrl: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Link de videollamada (si aplica)"
            value={value.location?.virtualLink ?? ''}
            onChange={(e) => patchNested('location', { virtualLink: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            rows={3}
            placeholder="¿Hay parqueadero? ¿Piden documento en recepción? Instrucciones de llegada…"
            value={value.location?.parkingInfo ?? ''}
            onChange={(e) => patchNested('location', { parkingInfo: e.target.value })}
            className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            rows={3}
            placeholder="Indicaciones de llegada para el cliente"
            value={value.location?.instructionsArrival ?? ''}
            onChange={(e) => patchNested('location', { instructionsArrival: e.target.value })}
            className="sm:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* ====== 4) Reglas de agenda ====== */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Reglas de agenda</div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <div className="text-xs text-slate-400">Reservar hasta (días adelante)</div>
            <input
              type="number"
              min={0}
              value={value.rules?.bookingWindowDays ?? 30}
              onChange={(e) => patchNested('rules', { bookingWindowDays: parseInt(e.target.value || '0', 10) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <div className="text-xs text-slate-400">Citas máximas por día</div>
            <input
              type="number"
              min={0}
              value={value.rules?.maxDailyAppointments ?? 0}
              onChange={(e) => patchNested('rules', { maxDailyAppointments: parseInt(e.target.value || '0', 10) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <div className="text-xs text-slate-400">Ventana para cancelar (horas)</div>
            <input
              type="number"
              min={0}
              value={value.rules?.cancellationWindowHours ?? 12}
              onChange={(e) => patchNested('rules', { cancellationWindowHours: parseInt(e.target.value || '0', 10) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="block sm:col-span-3">
            <div className="text-xs text-slate-400 mb-1">Política de inasistencia (No-show)</div>
            <textarea
              rows={3}
              placeholder="Ej: Si no asistes sin avisar, se cobrará $X o se pierde el depósito."
              value={value.rules?.noShowPolicy ?? ''}
              onChange={(e) => patchNested('rules', { noShowPolicy: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <div className="flex items-center gap-3">
            <input
              id="depositRequired"
              type="checkbox"
              checked={!!value.rules?.depositRequired}
              onChange={(e) => patchNested('rules', { depositRequired: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="depositRequired" className="text-sm">Requerir depósito</label>
          </div>

          <label className="block">
            <div className="text-xs text-slate-400">Monto del depósito</div>
            <input
              type="number"
              min={0}
              step={1}
              value={value.rules?.depositAmount ?? 0}
              onChange={(e) => patchNested('rules', { depositAmount: parseFloat(e.target.value || '0') })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      {/* ====== 5) Mensajes y recordatorios ====== */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Mensajes al cliente</div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="ID de plantilla de recordatorio (WhatsApp)"
            value={value.reminders?.templateId ?? ''}
            onChange={(e) => patchNested('reminders', { templateId: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            rows={3}
            placeholder="Mensaje posterior a la reserva (se envía tras confirmar)"
            value={value.reminders?.postBookingMessage ?? ''}
            onChange={(e) => patchNested('reminders', { postBookingMessage: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* ====== 6) Knowledge base (para que la IA no tenga vacíos) ====== */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="px-4 py-3 border-b border-slate-800 text-sm font-semibold">Knowledge base del negocio</div>
        <div className="p-4 grid grid-cols-1 gap-4">
          <textarea
            rows={3}
            placeholder="Resumen del negocio (qué hacen, a quién atienden, tono de comunicación...)"
            value={value.kb?.businessOverview ?? ''}
            onChange={(e) => patchNested('kb', { businessOverview: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            rows={3}
            placeholder={`FAQs (opcional). Puedes pegar JSON: [{"q":"¿Atienden niños?","a":"Sí, desde 6 años"}]`}
            value={value.kb?.faqsText ?? ''}
            onChange={(e) => patchNested('kb', { faqsText: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            rows={4}
            placeholder="Información libre adicional para la IA (casos especiales, excepciones, etc.)"
            value={value.kb?.freeText ?? ''}
            onChange={(e) => patchNested('kb', { freeText: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* ====== 7) Horario semanal (sin cambios de lógica) ====== */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
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
      </section>
    </div>
  )
}
