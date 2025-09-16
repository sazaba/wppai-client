'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { X } from 'lucide-react'

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

function emptyHours(): AppointmentDay[] {
  return ORDER.map((d) => ({
    day: d,
    isOpen: false,
    start1: null,
    end1: null,
    start2: null,
    end2: null,
  }))
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
    hours: undefined,
    appointmentServices: initialConfig?.servicios || '',
  }))

  const [lockedBy, setLockedBy] = useState<LockedBy>(() =>
    (initialConfig?.aiMode as AiMode) === 'agente' ? 'agente' : null
  )

  function handleAgentChange(patch: Partial<FormState>) {
    setForm((prev) => {
      const next: FormState = { ...prev, ...patch }
      if (patch.aiMode === 'agente') next.appointmentEnabled = false
      return next
    })
  }

  function handleAppointmentChange(patch: Partial<FormState>) {
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

  async function loadAppointmentConfigIntoForm() {
    try {
      setReloading(true)
      const data = await fetchAppointmentConfig()

      type BackendAppointmentConfig = {
        appointmentEnabled?: boolean
        appointmentVertical?: Vertical
        appointmentTimezone?: string
        appointmentBufferMin?: number
        appointmentPolicies?: string
        appointmentReminders?: boolean
      }

      const cfg = (data?.config ?? {}) as BackendAppointmentConfig

      setForm((f) => ({
        ...f,
        appointmentEnabled: !!cfg.appointmentEnabled,
        appointmentVertical: (cfg.appointmentVertical as Vertical) ?? 'none',
        appointmentTimezone: cfg.appointmentTimezone ?? 'America/Bogota',
        appointmentBufferMin: Number.isFinite(cfg.appointmentBufferMin!)
          ? (cfg.appointmentBufferMin as number)
          : 10,
        appointmentPolicies: cfg.appointmentPolicies ?? '',
        appointmentReminders: cfg.appointmentReminders ?? true,
        hours: hoursFromDb(data?.hours as AppointmentDay[] | null | undefined),
      }))

      // 🔒 bloquear por Citas si detectamos configuración diligenciada
      const hours = (data?.hours as AppointmentDay[] | undefined) || []
      const anyOpen = hours.some((h) => h?.isOpen)
      const anyTimes = hours.some((h) => h?.start1 || h?.end1 || h?.start2 || h?.end2)
      const hasPolicies = !!(cfg?.appointmentPolicies && cfg.appointmentPolicies.trim().length > 0)
      const citasConfigured = !!cfg?.appointmentEnabled || anyOpen || anyTimes || hasPolicies
      if (citasConfigured) setLockedBy('citas')
    } catch (e: any) {
      console.error('[settings] fetchAppointmentConfig error:', e)
      setErrorMsg(e?.response?.data?.error || e?.message || 'No se pudo cargar la agenda')
    } finally {
      setReloading(false)
    }
  }

  async function handleChangeTab(nextTab: EditorTab) {
    if (lockedBy === 'agente' && nextTab === 'citas') {
      setErrorMsg('Esta empresa ya está configurada en modo Agente. Reinicia el entrenamiento para cambiar a Citas.')
      return
    }
    if (lockedBy === 'citas' && nextTab === 'agente') {
      setErrorMsg('Esta empresa ya está configurada para Citas. Reinicia el entrenamiento para cambiar a Agente.')
      return
    }

    setTab(nextTab)
    setErrorMsg(null)
    if (nextTab === 'citas') await loadAppointmentConfigIntoForm()
  }

  useEffect(() => {
    if (lockedBy === 'agente' && tab !== 'agente') setTab('agente')
    if (lockedBy === 'citas' && tab !== 'citas') setTab('citas')
  }, [lockedBy, tab])

  // ⛔️ RESETEO TOTAL: ahora **solo** llamamos /api/config/reset (ya borra appointmentHour)
  //    No re-sembramos horas después: así la tabla queda vacía en DB.
  async function reiniciarEntrenamiento() {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar entrenamiento?\n\nSe eliminará la configuración del negocio y se limpiará la agenda (no se borrará el catálogo).'
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

      // Estado local limpio (mostramos 7 días cerrados en UI, pero la DB quedó vacía)
      setLockedBy(null)
      setForm((f) => ({
        ...f,
        aiMode: 'agente',
        appointmentEnabled: false,
        appointmentVertical: 'none',
        appointmentTimezone: 'America/Bogota',
        appointmentBufferMin: 10,
        appointmentPolicies: '',
        appointmentReminders: true,
        hours: emptyHours(),
        appointmentServices: '',
      }))
      setTab('citas')
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'No se pudo reiniciar.')
    } finally {
      setSaving(false)
    }
  }

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

      // Apaga agenda en backend (conserva horas si existieran)
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

      setLockedBy('agente')
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

      setLockedBy('citas')
      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando la agenda.')
    } finally {
      setSaving(false)
    }
  }

  const lockBanner = useMemo(() => {
    if (!lockedBy) return null
    const msg =
      lockedBy === 'agente'
        ? 'Este entrenamiento está bloqueado por el modo Agente.'
        : 'Este entrenamiento está bloqueado por la configuración de Citas.'
    return (
      <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-amber-600/40 bg-amber-900/20 px-3 py-2 text-amber-200">
        <span className="text-sm">{msg} Para cambiar, reinicia el entrenamiento.</span>
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
                <TypeTabs value={tab} onChange={handleChangeTab} loading={reloading} />
              </div>

              {tab === 'agente' ? (
                <div className={lockedBy === 'citas' ? 'pointer-events-none opacity-50' : ''}>
                  <AgentForm
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
                <div className={lockedBy === 'agente' ? 'pointer-events-none opacity-50' : ''}>
                  <AppointmentForm
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

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {tab === 'agente'
                    ? 'Configura el modo y el perfil del agente.'
                    : 'Configura tu agenda, servicios y políticas.'}
                </div>

                <div className="flex items-center gap-2">
                  {tab === 'citas' && (
                    <button
                      onClick={reiniciarEntrenamiento}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm"
                      type="button"
                    >
                      {saving ? 'Reiniciando…' : 'Reiniciar entrenamiento'}
                    </button>
                  )}

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
