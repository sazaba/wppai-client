'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios, { AxiosError } from 'axios'
import { X, Lock, Calendar, Bot } from 'lucide-react'

import AgentForm from './AgentForm'
import AppointmentForm, {
  type AppointmentDay,
  type Weekday,
  type AppointmentConfigValue,
  type Vertical,
} from './AppointmentForm'

import { normalizeDays } from '@/lib/appointments'

import type {
  ModalEntrenamientoProps,
  ConfigForm,
  AiMode,
  AgentSpecialty,
} from './types'

/* ============ Helpers básicos ============ */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string
const RESET_MARKER_KEY = 'trainingResetAt' // 👈 marcador local para forzar el picker tras reset

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Evita caché al leer configuración (para que el reset no rehidrate campos) */
function noCacheHeaders() {
  return { ...getAuthHeaders(), 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
}

/** GET /api/appointments/config SIN CACHÉ */
async function fetchAppointmentsNoCache() {
  const r = await axios.get(`${API_URL}/api/appointments/config`, {
    headers: noCacheHeaders(),
    params: { t: Date.now() },
  })
  const data = r?.data ?? {}
  // soporta {config, hours} o {appointment, hours}
  const config = data.config ?? data.appointment ?? {}
  const hours = data.hours ?? []
  return { config, hours }
}

/* ============ Tipos locales ============ */
type FormState = Pick<
  ConfigForm,
  'aiMode' | 'agentSpecialty' | 'agentPrompt' | 'agentScope' | 'agentDisclaimers'
> & {
  appointmentEnabled: boolean
  appointmentVertical: Vertical
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentPolicies?: string
  appointmentReminders: boolean
  hours?: AppointmentDay[]
  appointmentServices?: string
}

type LockedBy = 'agente' | 'citas' | null
type Step = 'pick' | 'agente' | 'citas'

const ORDER: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function hoursFromDb(rows: AppointmentDay[] | undefined | null): AppointmentDay[] {
  const base = new Map<Weekday, AppointmentDay>()
  for (const d of ORDER) {
    base.set(d, { day: d, isOpen: false, start1: null, end1: null, start2: null, end2: null })
  }
  if (Array.isArray(rows)) {
    for (const r of rows) {
      const k = r.day as Weekday
      if (!ORDER.includes(k)) continue
      base.set(k, {
        day: k,
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

/** Payload usando normalizeDays (shape idéntico al backend) */
function buildAppointmentPayloadFromForm(form: FormState) {
  const normalized = normalizeDays(form.hours)
  return {
    appointment: {
      enabled: !!form.appointmentEnabled,
      vertical: form.appointmentVertical,
      timezone: form.appointmentTimezone || 'America/Bogota',
      bufferMin: Number.isFinite(form.appointmentBufferMin) ? form.appointmentBufferMin : 10,
      policies: form.appointmentPolicies || '',
      reminders: !!form.appointmentReminders,
    },
    hours: normalized.map((h) => ({
      day: h.day,
      isOpen: !!h.isOpen,
      start1: h.isOpen ? h.start1 ?? null : null,
      end1: h.isOpen ? h.end1 ?? null : null,
      start2: h.isOpen ? h.start2 ?? null : null,
      end2: h.isOpen ? h.end2 ?? null : null,
    })),
  }
}

/** Mensaje humano para AxiosError */
function prettyAxiosError(e: unknown, fallback = 'Ocurrió un error') {
  const ax = e as AxiosError<any>
  if (ax?.message === 'Network Error') {
    return 'No se pudo conectar con el backend (Network Error). Revisa NEXT_PUBLIC_API_URL, CORS y que el servidor esté en línea.'
  }
  return ax?.response?.data?.error || fallback
}

/* ============ Componente principal ============ */
export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
}: ModalEntrenamientoProps) {
  const [open, setOpen] = useState<boolean>(trainingActive)
  useEffect(() => setOpen(trainingActive), [trainingActive])

  const [saving, setSaving] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Forzamos remount de los formularios (para limpiar inputs al reiniciar)
  const [uiEpoch, setUiEpoch] = useState(0)

  // Lock persistente (derivado de BD)
  const [lockedBy, setLockedBy] = useState<LockedBy>(null)
  // Paso del wizard
  const [step, setStep] = useState<Step>('pick')

  const [form, setForm] = useState<FormState>(() => ({
    aiMode: (initialConfig?.aiMode as AiMode) || 'agente',
    agentSpecialty: (initialConfig?.agentSpecialty as AgentSpecialty) || 'generico',
    agentPrompt: initialConfig?.agentPrompt || '',
    agentScope: initialConfig?.agentScope || '',
    agentDisclaimers: initialConfig?.agentDisclaimers || '',
    appointmentEnabled: false,
    appointmentVertical: 'none',
    appointmentTimezone: 'America/Bogota',
    appointmentBufferMin: 10,
    appointmentPolicies: '',
    appointmentReminders: true,
    hours: [],
    appointmentServices: initialConfig?.servicios || '',
  }))

  const close = () => {
    setOpen(false)
    onClose?.()
  }

  /** Carga inicial: determina el paso según BD (aiMode) y agenda */
  async function loadAllConfig() {
    setReloading(true)
    setErrorMsg(null)
    try {
      // 👇 si hay marcador de reset, forzamos picker
      let forcePick = false
      if (typeof window !== 'undefined') {
        const mk = localStorage.getItem(RESET_MARKER_KEY)
        if (mk) {
          forcePick = true
          localStorage.removeItem(RESET_MARKER_KEY)
        }
      }

      const appt = await fetchAppointmentsNoCache()
      type BackendAppointmentConfig = {
        appointmentEnabled?: boolean
        appointmentVertical?: Vertical
        appointmentTimezone?: string
        appointmentBufferMin?: number
        appointmentPolicies?: string | null
        appointmentReminders?: boolean
      }
      const cfg = ((appt?.config ?? null) as BackendAppointmentConfig | null)
      const hrs = (appt?.hours as AppointmentDay[] | null | undefined) ?? []

      // BusinessConfig (aiMode + servicios) sin caché
      const r = await axios
        .get(`${API_URL}/api/config`, {
          headers: noCacheHeaders(),
          params: { t: Date.now() },
        })
        .catch(() => null)

      // ❗️NO default a 'ecommerce'; si no viene, dejamos undefined y vamos a picker
      const aiModeDb = r?.data?.aiMode as AiMode | undefined
      const serviciosDb = (r?.data?.servicios ?? '') as string

      setForm((f) => ({
        ...f,
        aiMode: (aiModeDb as any) ?? f.aiMode, // solo si vino, lo aplico; si no, mantengo local
        appointmentEnabled: !!cfg?.appointmentEnabled,
        appointmentVertical: (cfg?.appointmentVertical as Vertical) ?? 'none',
        appointmentTimezone: cfg?.appointmentTimezone ?? 'America/Bogota',
        appointmentBufferMin: Number.isFinite(cfg?.appointmentBufferMin as number)
          ? ((cfg?.appointmentBufferMin as number) ?? 10)
          : 10,
        appointmentPolicies: cfg?.appointmentPolicies ?? '',
        appointmentReminders: (cfg?.appointmentReminders ?? true) as boolean,
        hours: hoursFromDb(hrs),
        appointmentServices: serviciosDb,
      }))

      // 🔐 Criterio de bloqueo/step (con override por reset)
      if (forcePick) {
        setLockedBy(null)
        setStep('pick')
      } else if (aiModeDb === 'agente') {
        setLockedBy('agente')
        setStep('agente')
      } else if (aiModeDb === 'ecommerce') {
        setLockedBy('citas')
        setStep('citas')
      } else {
        setLockedBy(null)
        setStep('pick')
      }

      setUiEpoch((n) => n + 1)
    } catch (e: any) {
      console.error('[settings] loadAllConfig error:', e)
      setErrorMsg(prettyAxiosError(e, 'No se pudo cargar la configuración.'))
      setLockedBy(null)
      setStep('pick')
    } finally {
      setReloading(false)
    }
  }

  useEffect(() => {
    if (open) loadAllConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /** Reiniciar: limpia BD, limpia UI y vuelve a 'pick' (sin abrir nada) */
  async function reiniciarEntrenamiento() {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar entrenamiento?\n\nSe eliminará la configuración y deberás elegir una opción nuevamente.'
        )
        if (!ok) return
      }
      setSaving(true)
      setErrorMsg(null)

      // Reset de negocio
      await axios.post(
        `${API_URL}/api/config/reset`,
        null,
        { params: { withCatalog: false, t: Date.now() }, headers: getAuthHeaders() }
      )

      // Limpieza de agenda (si existe endpoint)
      try {
        await axios.post(`${API_URL}/api/appointments/reset`, null, {
          headers: getAuthHeaders(),
          params: { t: Date.now() },
        })
      } catch { /* ignore */ }

      // 👇 Guardamos marcador local para que la próxima apertura vaya a 'pick'
      if (typeof window !== 'undefined') {
        localStorage.setItem(RESET_MARKER_KEY, String(Date.now()))
      }

      // Limpieza UI total
      setLockedBy(null)
      setForm({
        aiMode: 'agente',
        agentSpecialty: 'generico',
        agentPrompt: '',
        agentScope: '',
        agentDisclaimers: '',
        appointmentEnabled: false,
        appointmentVertical: 'none',
        appointmentTimezone: 'America/Bogota',
        appointmentBufferMin: 10,
        appointmentPolicies: '',
        appointmentReminders: true,
        hours: [],
        appointmentServices: '',
      })
      setStep('pick')
      setUiEpoch((n) => n + 1)
    } catch (e: any) {
      setErrorMsg(prettyAxiosError(e, 'No se pudo reiniciar.'))
    } finally {
      setSaving(false)
    }
  }

  /** Elegir “Agente”: bloquea inmediatamente y persiste */
  async function pickAgente() {
    try {
      setSaving(true)
      setErrorMsg(null)
      await axios.put(
        `${API_URL}/api/config/agent`,
        { aiMode: 'agente' as AiMode },
        { headers: getAuthHeaders(), params: { t: Date.now() } }
      )

      // apaga agenda (conserva horas si hubieran)
      const currentHours = normalizeDays(form.hours)
      await axios.post(
        `${API_URL}/api/appointments/config`,
        {
          appointment: {
            enabled: false,
            vertical: form.appointmentVertical || 'none',
            timezone: form.appointmentTimezone || 'America/Bogota',
            bufferMin: Number.isFinite(form.appointmentBufferMin) ? form.appointmentBufferMin : 10,
            policies: form.appointmentPolicies || '',
            reminders: !!form.appointmentReminders,
          },
          hours: currentHours,
        },
        { headers: getAuthHeaders(), params: { t: Date.now() } }
      )

      setLockedBy('agente')
      setStep('agente')
      setUiEpoch((n) => n + 1)
    } catch (e: any) {
      setErrorMsg(prettyAxiosError(e, 'No se pudo seleccionar Agente.'))
    } finally {
      setSaving(false)
    }
  }

  /** Elegir “Citas”: bloquea inmediatamente y persiste */
  async function pickCitas() {
    try {
      setSaving(true)
      setErrorMsg(null)
      await axios.put(
        `${API_URL}/api/config/agent`,
        { aiMode: 'ecommerce' as AiMode },
        { headers: getAuthHeaders(), params: { t: Date.now() } }
      )
      const currentHours = normalizeDays(form.hours)
      await axios.post(
        `${API_URL}/api/appointments/config`,
        {
          appointment: {
            enabled: !!form.appointmentEnabled, // normalmente false al empezar
            vertical: form.appointmentVertical || 'none',
            timezone: form.appointmentTimezone || 'America/Bogota',
            bufferMin: Number.isFinite(form.appointmentBufferMin) ? form.appointmentBufferMin : 10,
            policies: form.appointmentPolicies || '',
            reminders: !!form.appointmentReminders,
          },
          hours: currentHours,
        },
        { headers: getAuthHeaders(), params: { t: Date.now() } }
      )

      setLockedBy('citas')
      setStep('citas')
      setUiEpoch((n) => n + 1)
    } catch (e: any) {
      setErrorMsg(prettyAxiosError(e, 'No se pudo seleccionar Citas.'))
    } finally {
      setSaving(false)
    }
  }

  /** Guardar Agente: mantiene paso y bloqueo */
  async function guardarAgente() {
    try {
      if (lockedBy === 'citas') {
        setErrorMsg('Bloqueado por Citas. Reinicia el entrenamiento para cambiar a Agente.')
        return
      }
      setSaving(true)
      setErrorMsg(null)

      const payload = {
        aiMode: 'agente' as AiMode,
        agentSpecialty: form.agentSpecialty,
        agentPrompt: form.agentPrompt ?? '',
        agentScope: form.agentScope ?? '',
        agentDisclaimers: form.agentDisclaimers ?? '',
      }
      await axios.put(`${API_URL}/api/config/agent`, payload, { headers: getAuthHeaders() })

      // Apaga agenda en BD (conserva horas)
      const currentHours = normalizeDays(form.hours)
      await axios.post(
        `${API_URL}/api/appointments/config`,
        {
          appointment: {
            enabled: false,
            vertical: form.appointmentVertical || 'none',
            timezone: form.appointmentTimezone || 'America/Bogota',
            bufferMin: Number.isFinite(form.appointmentBufferMin) ? form.appointmentBufferMin : 10,
            policies: form.appointmentPolicies || '',
            reminders: !!form.appointmentReminders,
          },
          hours: currentHours,
        },
        { headers: getAuthHeaders() }
      )

      setLockedBy('agente')
      setUiEpoch((n) => n + 1) // mantiene inputs
    } catch (e: any) {
      setErrorMsg(prettyAxiosError(e, 'Error guardando el agente.'))
    } finally {
      setSaving(false)
    }
  }

  /** Guardar Citas: mantiene paso y bloqueo */
  async function guardarCitas() {
    try {
      if (lockedBy === 'agente') {
        setErrorMsg('Bloqueado por Agente. Reinicia el entrenamiento para cambiar a Citas.')
        return
      }
      // Validación: si activas agenda, al menos un día abierto
      const normalized = normalizeDays(form.hours)
      const hasOpenDay = normalized.some((d) => d.isOpen)
      if (form.appointmentEnabled && !hasOpenDay) {
        setErrorMsg('Para habilitar la agenda, abre al menos un día en el horario semanal.')
        return
      }

      setSaving(true)
      setErrorMsg(null)

      const appointmentPayload = buildAppointmentPayloadFromForm(form)
      await axios.post(`${API_URL}/api/appointments/config`, appointmentPayload as any, {
        headers: getAuthHeaders(),
        params: { t: Date.now() },
      })

      const serviciosText = (form.appointmentServices || '').trim()
      await axios.put(
        `${API_URL}/api/config/agent`,
        {
          aiMode: 'ecommerce' as AiMode, // modo citas
          servicios: serviciosText,
        },
        { headers: getAuthHeaders(), params: { t: Date.now() } }
      )

      setLockedBy('citas')
      setUiEpoch((n) => n + 1) // mantiene inputs
    } catch (e: any) {
      setErrorMsg(prettyAxiosError(e, 'Error guardando la agenda.'))
    } finally {
      setSaving(false)
    }
  }

  /* ================== UI ================== */

  const lockBanner = useMemo(() => {
    const dbLock =
      lockedBy === 'agente' ? 'Entrenamiento bloqueado por configuración de Agente.' :
      lockedBy === 'citas' ? 'Entrenamiento bloqueado por configuración de Citas.' :
      null

    if (!dbLock) return null
    return (
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-amber-600/40 bg-amber-900/20 px-3 py-2 text-amber-200">
        <span className="text-sm flex items-center gap-2"><Lock className="w-4 h-4" /> {dbLock}</span>
        <button
          type="button"
          onClick={reiniciarEntrenamiento}
          className="px-3 py-1.5 rounded-lg text-sm bg-amber-600 hover:bg-amber-700 text-white"
          disabled={saving}
        >
          {saving ? 'Reiniciando…' : 'Reiniciar entrenamiento'}
        </button>
      </div>
    )
  }, [lockedBy, saving])

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={() => {}} className="relative z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center px-3 sm:px-6">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="w-full max-w-3xl bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-2xl overflow-y-auto max-h-[92vh]"
            >
              {/* header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-medium border border-slate-700">
                    Entrenamiento de IA
                  </div>
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
                  aria-label="Cerrar"
                  type="button"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>

              {lockBanner}

              {/* Paso 0: Picker */}
              {step === 'pick' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={pickCitas}
                    className="group rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 p-5 text-left transition"
                    disabled={saving}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-600/40">
                        <Calendar className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div className="text-lg font-medium">Configurar Citas</div>
                    </div>
                    <p className="text-sm text-slate-300">
                      Define horarios, políticas, recordatorios y servicios. Esta opción bloqueará la configuración del Agente hasta reiniciar.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={pickAgente}
                    className="group rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 p-5 text-left transition"
                    disabled={saving}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-600/40">
                        <Bot className="w-5 h-5 text-violet-300" />
                      </div>
                      <div className="text-lg font-medium">Configurar Agente</div>
                    </div>
                    <p className="text-sm text-slate-300">
                      Define el modo, especialidad y prompts del agente. Esta opción bloqueará la configuración de Citas hasta reiniciar.
                    </p>
                  </button>
                </div>
              )}

              {/* Paso Agente */}
              {step === 'agente' && (
                <div className={lockedBy === 'citas' ? 'pointer-events-none opacity-50' : ''}>
                  <AgentForm
                    key={`agent-${uiEpoch}`}
                    value={{
                      aiMode: form.aiMode,
                      agentSpecialty: form.agentSpecialty,
                      agentPrompt: form.agentPrompt,
                      agentScope: form.agentScope,
                      agentDisclaimers: form.agentDisclaimers,
                    }}
                    onChange={(patch) =>
                      setForm((prev) => ({ ...prev, ...patch }))
                    }
                  />

                  {errorMsg && (
                    <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
                      {errorMsg}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      Configura el modo y el perfil del agente.
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={reiniciarEntrenamiento}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm disabled:opacity-60"
                        type="button"
                      >
                        Reiniciar
                      </button>
                      <button
                        onClick={guardarAgente}
                        disabled={saving || lockedBy === 'citas'}
                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm disabled:opacity-60"
                        type="button"
                      >
                        {saving ? 'Guardando…' : lockedBy === 'citas' ? 'Bloqueado' : 'Actualizar agente'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Paso Citas */}
              {step === 'citas' && (
                <div className={lockedBy === 'agente' ? 'pointer-events-none opacity-50' : ''}>
                  <AppointmentForm
                    key={`citas-${uiEpoch}`}
                    value={{
                      appointmentEnabled: form.appointmentEnabled,
                      appointmentVertical: form.appointmentVertical,
                      appointmentTimezone: form.appointmentTimezone,
                      appointmentBufferMin: form.appointmentBufferMin,
                      appointmentPolicies: form.appointmentPolicies,
                      appointmentReminders: form.appointmentReminders,
                      hours: form.hours,
                      appointmentServices: form.appointmentServices,
                    } as AppointmentConfigValue}
                    onChange={(patch) =>
                      setForm((prev) => ({ ...prev, ...(patch as Partial<FormState>) }))
                    }
                  />

                  {errorMsg && (
                    <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
                      {errorMsg}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      Configura tu agenda, servicios y políticas.
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={reiniciarEntrenamiento}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm disabled:opacity-60"
                        type="button"
                      >
                        Reiniciar
                      </button>
                      <button
                        onClick={guardarCitas}
                        disabled={saving || lockedBy === 'agente'}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-60"
                        type="button"
                      >
                        {saving ? 'Guardando…' : lockedBy === 'agente' ? 'Bloqueado' : 'Actualizar citas'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
