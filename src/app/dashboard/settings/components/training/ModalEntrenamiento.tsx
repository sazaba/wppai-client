'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { X, Lock, Calendar, Bot } from 'lucide-react'

import AgentForm from './AgentForm'
import AppointmentForm, {
  type AppointmentDay,
  type Weekday,
  type AppointmentConfigValue,
  toAppointmentConfigPayload,
} from './AppointmentForm'

import { normalizeDays } from '@/lib/appointments'

import type {
  ModalEntrenamientoProps,
  ConfigForm,
  AiMode,
  AgentSpecialty,
} from './types'

/* ================= Constantes / helpers ================= */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string
const FRONTEND_LOCK_KEY = 'trainingLockedBy' as const // 'agente' | 'citas'
const RESET_MARKER_KEY = 'trainingResetAt'

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function noCacheHeaders() {
  return { ...getAuthHeaders(), 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
}

/** ✅ Lee la config de appointments tal cual la devuelve el nuevo endpoint */
async function fetchAppointmentsNoCache() {
  const r = await axios.get(`${API_URL}/api/appointments/config`, {
    headers: noCacheHeaders(),
    params: { t: Date.now() },
  })
  return r?.data ?? {}
}

type FormState = Pick<
  ConfigForm,
  'aiMode' | 'agentSpecialty' | 'agentPrompt' | 'agentScope' | 'agentDisclaimers'
> & {
  appointmentEnabled: boolean
  appointmentVertical: any
  appointmentVerticalCustom?: string | null
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentPolicies?: string
  appointmentReminders: boolean
  hours?: AppointmentDay[]
  appointmentServices?: string
  location?: any
  rules?: any
  reminders?: any
  kb?: any
}

type LockedBy = 'agente' | 'citas' | null
export type ActivePanel = 'agente' | 'citas' | null

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

/* =================== Componente principal =================== */
export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
  panel,
  initialPanel = null,
}: ModalEntrenamientoProps & { panel?: ActivePanel; initialPanel?: ActivePanel }) {
  const [open, setOpen] = useState<boolean>(trainingActive)
  useEffect(() => setOpen(trainingActive), [trainingActive])

  const [saving, setSaving] = useState(false)
  const [reloading, setReloading] = useState(false)

  const [uiEpoch, setUiEpoch] = useState(0)
  const [lockedBy, setLockedBy] = useState<LockedBy>(null)

  const [internalPanel, setInternalPanel] = useState<ActivePanel>(panel ?? initialPanel ?? null)
  const effectivePanel: ActivePanel = panel ?? internalPanel

  const [form, setForm] = useState<FormState>(() => ({
    aiMode: (initialConfig?.aiMode as AiMode) || 'agente',
    agentSpecialty: (initialConfig?.agentSpecialty as AgentSpecialty) || 'generico',
    agentPrompt: initialConfig?.agentPrompt || '',
    agentScope: initialConfig?.agentScope || '',
    agentDisclaimers: initialConfig?.agentDisclaimers || '',
    appointmentEnabled: false,
    appointmentVertical: 'custom',
    appointmentVerticalCustom: '',
    appointmentTimezone: 'America/Bogota',
    appointmentBufferMin: 10,
    appointmentPolicies: '',
    appointmentReminders: true,
    hours: [],
    appointmentServices: '',
    location: {},
    rules: {},
    reminders: {},
    kb: {},
  }))

  const close = () => {
    setOpen(false)
    onClose?.()
  }

  useEffect(() => {
    if (trainingActive && panel === undefined && initialPanel) {
      setInternalPanel(initialPanel)
    }
  }, [trainingActive, panel, initialPanel])

  /* ============ Carga inicial (HIDRATAR) ============ */
  async function loadAllConfig() {
    setReloading(true)
    try {
      if (typeof window !== 'undefined') {
        const mk = localStorage.getItem(RESET_MARKER_KEY)
        if (mk) localStorage.removeItem(RESET_MARKER_KEY)
      }

      const appt = await fetchAppointmentsNoCache()

      setForm((f) => ({
        ...f,
        // Perfil del agente (si aplica)
        agentSpecialty: (initialConfig?.agentSpecialty as AgentSpecialty) || f.agentSpecialty,
        agentPrompt: initialConfig?.agentPrompt ?? f.agentPrompt,
        agentScope: initialConfig?.agentScope ?? f.agentScope,
        agentDisclaimers: initialConfig?.agentDisclaimers ?? f.agentDisclaimers,

        // Appointments
        appointmentEnabled: !!appt?.appointment?.enabled,
        appointmentVertical: appt?.appointment?.vertical ?? 'custom',
        appointmentVerticalCustom: appt?.appointment?.verticalCustom ?? '',
        appointmentTimezone: appt?.appointment?.timezone ?? 'America/Bogota',
        appointmentBufferMin: Number.isFinite(appt?.appointment?.bufferMin)
          ? appt?.appointment?.bufferMin
          : 10,
        appointmentPolicies: appt?.appointment?.policies ?? '',
        appointmentReminders: (appt?.appointment?.reminders ?? true) as boolean,
        hours: hoursFromDb(appt?.hours ?? []),
        appointmentServices: appt?.servicesText ?? '',

        // Campos nuevos
        location: appt?.location ?? {},
        rules: appt?.rules ?? {},
        reminders: appt?.reminders ?? {},
        kb: appt?.kb ?? {},
      }))

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(FRONTEND_LOCK_KEY) as LockedBy | null
        setLockedBy(stored === 'agente' || stored === 'citas' ? stored : null)
      }

      setUiEpoch((n) => n + 1)
    } catch (e) {
      console.error('[settings] loadAllConfig error:', e)
    } finally {
      setReloading(false)
    }
  }

  useEffect(() => {
    if (open) loadAllConfig()
  }, [open])

  /* ================= Acciones ================= */

  // Reiniciar entrenamiento (agente + citas + hours)
  async function reiniciarEntrenamiento() {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm('¿Reiniciar entrenamiento? Esto borrará tu configuración de agente, configuración de citas y horarios.');
        if (!ok) return;
      }
      setSaving(true);

      // 1) Reset del AGENTE
      try {
        await axios.post(
          `${API_URL}/api/config/reset`,
          null,
          { params: { withCatalog: false, t: Date.now() }, headers: getAuthHeaders() }
        );
      } catch (err) {
        console.warn('[reset] /api/config/reset falló (se ignora):', err);
      }

      // 2) Borrar citas + hours
      let apptWiped = false;
      try {
        await axios.delete(`${API_URL}/api/appointments/config`, {
          headers: getAuthHeaders(),
          params: { purgeHours: 1, t: Date.now() },
        });
        apptWiped = true;
      } catch (err) {
        console.warn('[reset] DELETE /api/appointments/config?purgeHours=1 falló, probando /reset:', err);
      }

      // 3) Fallback: /reset
      if (!apptWiped) {
        await axios.post(
          `${API_URL}/api/appointments/config/reset`,
          null,
          { headers: getAuthHeaders(), params: { t: Date.now() } }
        );
      }

      // 4) Limpieza local UI
      if (typeof window !== 'undefined') {
        localStorage.removeItem(FRONTEND_LOCK_KEY);
        localStorage.setItem(RESET_MARKER_KEY, String(Date.now()));
      }
      setLockedBy(null);

      // 5) Estado limpio
      setForm({
        aiMode: 'agente',
        agentSpecialty: 'generico',
        agentPrompt: '',
        agentScope: '',
        agentDisclaimers: '',
        appointmentEnabled: false,
        appointmentVertical: 'custom',
        appointmentVerticalCustom: '',
        appointmentTimezone: 'America/Bogota',
        appointmentBufferMin: 10,
        appointmentPolicies: '',
        appointmentReminders: true,
        hours: [],
        appointmentServices: '',
        location: {},
        rules: {},
        reminders: {},
        kb: {},
      });
      setUiEpoch(n => n + 1);
      // await loadAllConfig()
    } finally {
      setSaving(false);
    }
  }

  async function guardarAgente() {
    try {
      setSaving(true)

      await axios.put(
        `${API_URL}/api/config/agent`,
        {
          aiMode: 'agente' as AiMode,
          agentSpecialty: form.agentSpecialty,
          agentPrompt: form.agentPrompt ?? '',
          agentScope: form.agentScope ?? '',
          agentDisclaimers: form.agentDisclaimers ?? '',
        },
        { headers: getAuthHeaders(), params: { t: Date.now() } }
      )

      if (typeof window !== 'undefined') localStorage.setItem(FRONTEND_LOCK_KEY, 'agente')
      setLockedBy('agente')

      close()
    } finally {
      setSaving(false)
    }
  }

  async function guardarCitas() {
    try {
      setSaving(true)

      const normalized = normalizeDays(form.hours)
      const hasOpenDay = normalized.some((d) => d.isOpen)
      if (form.appointmentEnabled && !hasOpenDay) {
        if (typeof window !== 'undefined')
          alert('Abre al menos un día en el horario para habilitar la agenda.')
        setSaving(false)
        return
      }

      const valueForHelper: AppointmentConfigValue = {
        appointmentEnabled: !!form.appointmentEnabled,
        appointmentVertical: form.appointmentVertical,
        appointmentTimezone: form.appointmentTimezone || 'America/Bogota',
        appointmentBufferMin: Number.isFinite(form.appointmentBufferMin) ? form.appointmentBufferMin : 10,
        appointmentPolicies: form.appointmentPolicies || '',
        appointmentReminders: !!form.appointmentReminders,
        hours: form.hours ?? [],
        appointmentServices: form.appointmentServices || '',
        location: form.location ?? {},
        rules: form.rules ?? {},
        reminders: form.reminders ?? {},
        kb: form.kb ?? {},
      }
      const payload: any = toAppointmentConfigPayload(valueForHelper)
      if (payload?.appointment) payload.appointment.aiMode = 'appointments'

      await axios.post(`${API_URL}/api/appointments/config`, payload, {
        headers: { ...getAuthHeaders(), 'x-appt-intent': 'citas' }, // 👈 header requerido por backend
        params: { t: Date.now() },
      })

      if (typeof window !== 'undefined') localStorage.setItem(FRONTEND_LOCK_KEY, 'citas')
      setLockedBy('citas')

      close()
    } finally {
      setSaving(false)
    }
  }

  /* =================== UI =================== */

  const lockBanner = useMemo(() => {
    const text =
      lockedBy === 'agente'
        ? 'Entrenamiento bloqueado por configuración de Agente (bloqueo frontend).'
        : lockedBy === 'citas'
        ? 'Entrenamiento bloqueado por configuración de Citas (bloqueo frontend).'
        : null
    if (!text) return null
    return (
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-amber-600/40 bg-amber-900/20 px-3 py-2 text-amber-200">
        <span className="text-sm flex items-center gap-2">
          <Lock className="w-4 h-4" /> {text}
        </span>
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

  const shouldShowCards = !effectivePanel && panel === undefined

  const Card = ({
    icon,
    title,
    desc,
    disabled,
    onOpen,
  }: {
    icon: React.ReactNode
    title: string
    desc: string
    disabled?: boolean
    onOpen: () => void
  }) => (
    <button
      type="button"
      onClick={onOpen}
      disabled={!!disabled}
      className={[
        'group rounded-2xl border p-5 text-left transition',
        disabled
          ? 'border-slate-800 bg-slate-800/30 text-slate-400 cursor-not-allowed'
          : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-slate-700/30 border border-slate-700">{icon}</div>
        <div className="text-lg font-medium">{title}</div>
      </div>
      <p className="text-sm text-slate-300">{desc}</p>
    </button>
  )

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
                <div className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-medium border border-slate-700">
                  Entrenamiento de IA
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

              {/* Cards internas SOLO si el modal no está dirigido desde fuera */}
              {shouldShowCards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Card
                    icon={<Calendar className="w-5 h-5 text-emerald-300" />}
                    title="Configurar Citas"
                    desc="Define horarios, políticas, recordatorios y servicios."
                    disabled={lockedBy === 'agente' || saving}
                    onOpen={() => setInternalPanel('citas')}
                  />
                  <Card
                    icon={<Bot className="w-5 h-5 text-violet-300" />}
                    title="Configurar Agente"
                    desc="Define el modo, especialidad y prompts del agente."
                    disabled={lockedBy === 'citas' || saving}
                    onOpen={() => setInternalPanel('agente')}
                  />
                </div>
              )}

              {/* Formularios */}
              {effectivePanel === 'agente' && (
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
                    onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                  />

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      onClick={async () => {
                        await guardarAgente()
                        close()
                      }}
                      disabled={saving || lockedBy === 'citas'}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm disabled:opacity-60"
                      type="button"
                    >
                      {saving ? 'Guardando…' : lockedBy === 'citas' ? 'Bloqueado' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )}

              {effectivePanel === 'citas' && (
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
                      location: form.location ?? {},
                      rules: form.rules ?? {},
                      reminders: form.reminders ?? {},
                      kb: form.kb ?? {},
                    } as AppointmentConfigValue}
                    onChange={(patch) =>
                      setForm((prev) => ({ ...prev, ...(patch as Partial<FormState>) }))
                    }
                  />

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      onClick={async () => {
                        await guardarCitas()
                        close()
                      }}
                      disabled={saving || lockedBy === 'agente'}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-60"
                      type="button"
                    >
                      {saving ? 'Guardando…' : lockedBy === 'agente' ? 'Bloqueado' : 'Guardar'}
                    </button>
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
