'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { X, Lock } from 'lucide-react'

import TypeTabs, { type EditorTab } from './TypeTabs'
import AgentForm from './AgentForm'
import AppointmentForm, {
  type AppointmentDay,
  type Weekday,
  type AppointmentConfigValue,
  type Vertical,
} from './AppointmentForm'

import { fetchAppointmentConfig } from '@/lib/appointments'

import type {
  ModalEntrenamientoProps,
  ConfigForm,
  AiMode,
  AgentSpecialty,
} from './types'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Estado del form que usamos acá (agente + citas) */
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

function buildAppointmentPayloadFromForm(form: FormState) {
  const hours = hoursFromDb(form.hours)
  return {
    appointment: {
      enabled: !!form.appointmentEnabled,
      vertical: form.appointmentVertical,
      timezone: form.appointmentTimezone || 'America/Bogota',
      bufferMin: Number.isFinite(form.appointmentBufferMin) ? form.appointmentBufferMin : 10,
      policies: form.appointmentPolicies || '',
      reminders: !!form.appointmentReminders,
    },
    hours: hours.map((h) => ({
      day: h.day,
      isOpen: !!h.isOpen,
      start1: h.isOpen ? h.start1 : null,
      end1: h.isOpen ? h.end1 : null,
      start2: h.isOpen ? h.start2 : null,
      end2: h.isOpen ? h.end2 : null,
    })),
  }
}

export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
}: ModalEntrenamientoProps) {
  const [open, setOpen] = useState<boolean>(trainingActive)
  useEffect(() => setOpen(trainingActive), [trainingActive])

  const [tab, setTab] = useState<EditorTab>('citas')
  const [saving, setSaving] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Forzamos remount de los formularios (para limpiar inputs al reiniciar)
  const [uiEpoch, setUiEpoch] = useState(0)

  // 🔎 NUEVO: “actividad local” por pestaña (detector de inputs)
  const [agentDirty, setAgentDirty] = useState(false)
  const [citasDirty, setCitasDirty] = useState(false)

  // Lock permanente (si lo quieres mantener puedes usarlo; si no, ignóralo)
  const [lockedBy, setLockedBy] = useState<LockedBy>(null)

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

  /** Cambios locales que marcan “dirty” */
  function handleAgentChange(patch: Partial<FormState>) {
    setAgentDirty(true) // 👉 se está diligenciando AGENTE
    setForm((prev) => {
      const next: FormState = { ...prev, ...patch }
      if (patch.aiMode === 'agente') next.appointmentEnabled = false
      return next
    })
  }
  function handleAppointmentChange(patch: Partial<FormState>) {
    setCitasDirty(true) // 👉 se está diligenciando CITAS
    setForm((prev) => {
      const next: FormState = { ...prev, ...patch }
      if (patch.appointmentEnabled === true) next.aiMode = 'ecommerce' as AiMode
      return next
    })
  }

  const close = () => {
    setOpen(false)
    onClose?.()
  }

  /** Carga inicial (puedes mantenerla; no afecta el detector local) */
  async function loadAllConfig() {
    setReloading(true)
    setErrorMsg(null)
    try {
      const appt = await fetchAppointmentConfig()
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

      const r = await axios.get(`${API_URL}/api/config`, { headers: getAuthHeaders() }).catch(() => null)
      const aiModeDb = ((r?.data?.aiMode as AiMode) ?? 'ecommerce') as AiMode

      setForm((f) => ({
        ...f,
        aiMode: aiModeDb,
        appointmentEnabled: !!cfg?.appointmentEnabled,
        appointmentVertical: (cfg?.appointmentVertical as Vertical) ?? 'none',
        appointmentTimezone: cfg?.appointmentTimezone ?? 'America/Bogota',
        appointmentBufferMin: Number.isFinite(cfg?.appointmentBufferMin as number)
          ? ((cfg?.appointmentBufferMin as number) ?? 10)
          : 10,
        appointmentPolicies: cfg?.appointmentPolicies ?? '',
        appointmentReminders: (cfg?.appointmentReminders ?? true) as boolean,
        hours: hoursFromDb(hrs),
      }))

      // lock opcional basado en BD (lo puedes quitar si no lo quieres)
      if (cfg?.appointmentEnabled) setLockedBy('citas')
      else if (aiModeDb === 'agente') setLockedBy('agente')
      else setLockedBy(null)

      // Al cargar desde BD no estamos diligenciando nada todavía
      setAgentDirty(false)
      setCitasDirty(false)

      setUiEpoch((n) => n + 1)
    } catch (e: any) {
      console.error('[settings] loadAllConfig error:', e)
      setErrorMsg(e?.response?.data?.error || e?.message || 'No se pudo cargar la configuración.')
      setLockedBy(null)
    } finally {
      setReloading(false)
    }
  }

  useEffect(() => {
    if (open) loadAllConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /** Regla simple de bloqueo local */
  const isAgenteTabBlocked = useMemo(
    () => citasDirty || lockedBy === 'citas',
    [citasDirty, lockedBy]
  )
  const isCitasTabBlocked = useMemo(
    () => agentDirty || lockedBy === 'agente',
    [agentDirty, lockedBy]
  )

  /** Ignora el click si el tab destino está bloqueado */
  async function handleChangeTab(nextTab: EditorTab) {
    setErrorMsg(null)
    if (nextTab === 'agente' && isAgenteTabBlocked) {
      setErrorMsg('No puedes cambiar a “Agente” mientras estás editando Citas.')
      return
    }
    if (nextTab === 'citas' && isCitasTabBlocked) {
      setErrorMsg('No puedes cambiar a “Citas” mientras estás editando Agente.')
      return
    }

    setTab(nextTab)

    // Si abres Citas, refresco sus datos (opcional)
    if (nextTab === 'citas') {
      try {
        setReloading(true)
        const appt = await fetchAppointmentConfig()
        const cfg = appt?.config ?? {}
        const hrs = (appt?.hours as AppointmentDay[] | null | undefined) ?? []
        setForm((f) => ({
          ...f,
          appointmentEnabled: !!(cfg as any)?.appointmentEnabled,
          appointmentVertical: ((cfg as any)?.appointmentVertical as Vertical) ?? 'none',
          appointmentTimezone: (cfg as any)?.appointmentTimezone ?? 'America/Bogota',
          appointmentBufferMin: Number.isFinite((cfg as any)?.appointmentBufferMin)
            ? ((cfg as any)?.appointmentBufferMin ?? 10)
            : 10,
          appointmentPolicies: (cfg as any)?.appointmentPolicies ?? '',
          appointmentReminders: ((cfg as any)?.appointmentReminders ?? true) as boolean,
          hours: hoursFromDb(hrs),
        }))
        setUiEpoch((n) => n + 1)
      } finally {
        setReloading(false)
      }
    }
  }

  /** Reiniciar: limpia todo y quita bloqueos locales */
  async function reiniciarEntrenamiento() {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar entrenamiento?\n\nSe eliminará la configuración del negocio y se limpiará la agenda.'
        )
        if (!ok) return
      }
      setSaving(true)
      setErrorMsg(null)

      await axios.post(
        `${API_URL}/api/config/reset`,
        null,
        { params: { withCatalog: false }, headers: getAuthHeaders() }
      )

      // Limpieza total de UI
      setLockedBy(null)
      setAgentDirty(false)
      setCitasDirty(false)
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
      setTab('citas')
      setUiEpoch((n) => n + 1) // remount: inputs limpios
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'No se pudo reiniciar.')
    } finally {
      setSaving(false)
    }
  }

  async function guardarAgente() {
    try {
      // (opcional) puedes mantener este guard si también quieres lock por BD
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

      // (opcional) apagar agenda en BD
      const currentHours = hoursFromDb(form.hours)
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
          hours: currentHours.map((h) => ({
            day: h.day,
            isOpen: h.isOpen,
            start1: h.start1,
            end1: h.end1,
            start2: h.start2,
            end2: h.end2,
          })),
        },
        { headers: getAuthHeaders() }
      )

      // Si quieres que, al guardar, deje de contar como “editando”
      setAgentDirty(false)
      // Y si quieres lock duro a partir de aquí:
      setLockedBy('agente')

      setUiEpoch((n) => n + 1)
      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando el agente.')
    } finally {
      setSaving(false)
    }
  }

  async function guardarCitas() {
    try {
      if (lockedBy === 'agente') {
        setErrorMsg('Bloqueado por Agente. Reinicia el entrenamiento para cambiar a Citas.')
        return
      }
      setSaving(true)
      setErrorMsg(null)

      const appointmentPayload = buildAppointmentPayloadFromForm(form)
      await axios.post(`${API_URL}/api/appointments/config`, appointmentPayload as any, {
        headers: getAuthHeaders(),
      })

      const serviciosText = (form.appointmentServices || '').trim()
      await axios.put(
        `${API_URL}/api/config/agent`,
        {
          aiMode: appointmentPayload.appointment.enabled ? ('ecommerce' as AiMode) : form.aiMode,
          servicios: serviciosText,
        },
        { headers: getAuthHeaders() }
      )

      setCitasDirty(false)
      setLockedBy(appointmentPayload.appointment.enabled ? 'citas' : null)

      setUiEpoch((n) => n + 1)
      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando la agenda.')
    } finally {
      setSaving(false)
    }
  }

  /** Banner: bloqueos activos */
  const lockBanner = useMemo(() => {
    const localLock =
      agentDirty ? 'Estás editando Agente: “Citas” está bloqueado temporalmente.' :
      citasDirty ? 'Estás editando Citas: “Agente” está bloqueado temporalmente.' :
      null

    const dbLock =
      !localLock && lockedBy === 'agente' ? 'Bloqueado por configuración de Agente en BD.' :
      !localLock && lockedBy === 'citas' ? 'Bloqueado por configuración de Citas en BD.' :
      null

    const msg = localLock ?? dbLock
    if (!msg) return null

    return (
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-amber-600/40 bg-amber-900/20 px-3 py-2 text-amber-200">
        <span className="text-sm flex items-center gap-2"><Lock className="w-4 h-4" /> {msg}</span>
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
  }, [agentDirty, citasDirty, lockedBy, saving])

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

              <div className="mb-4">
                {/* 👇 aunque no modifiquemos TypeTabs, ignoramos clicks en onChange */}
                <TypeTabs value={tab} onChange={handleChangeTab} loading={reloading} />
              </div>

              {/* contenido */}
              {tab === 'agente' ? (
                <div className={(lockedBy === 'citas') ? 'pointer-events-none opacity-50' : ''}>
                  <AgentForm
                    key={`agent-${uiEpoch}`}
                    value={{
                      aiMode: form.aiMode,
                      agentSpecialty: form.agentSpecialty,
                      agentPrompt: form.agentPrompt,
                      agentScope: form.agentScope,
                      agentDisclaimers: form.agentDisclaimers,
                    }}
                    onChange={handleAgentChange}
                  />
                </div>
              ) : (
                <div className={(lockedBy === 'agente') ? 'pointer-events-none opacity-50' : ''}>
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
                    onChange={(patch) => handleAppointmentChange(patch as Partial<FormState>)}
                  />
                </div>
              )}

              {errorMsg && (
                <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
                  {errorMsg}
                </div>
              )}

              {/* footer */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {tab === 'agente'
                    ? 'Configura el modo y el perfil del agente.'
                    : 'Configura tu agenda, servicios y políticas.'}
                </div>

                <div className="flex items-center gap-2">
                  {tab === 'agente' ? (
                    <button
                      onClick={guardarAgente}
                      disabled={saving || lockedBy === 'citas'}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm disabled:opacity-60"
                      type="button"
                      title={lockedBy === 'citas' ? 'Bloqueado por Citas' : undefined}
                    >
                      {saving ? 'Guardando…' : lockedBy === 'citas' ? 'Bloqueado' : 'Guardar agente'}
                    </button>
                  ) : (
                    <button
                      onClick={guardarCitas}
                      disabled={saving || lockedBy === 'agente'}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-60"
                      type="button"
                      title={lockedBy === 'agente' ? 'Bloqueado por Agente' : undefined}
                    >
                      {saving ? 'Guardando…' : lockedBy === 'agente' ? 'Bloqueado' : 'Guardar citas'}
                    </button>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
