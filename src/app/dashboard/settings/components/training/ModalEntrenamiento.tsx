'use client'

import { useEffect, useState } from 'react'
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
  type ProviderInput,
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

/** 👉 Estado local del formulario (solo campos usados por Agente + Citas) */
type FormState = Pick<
  ConfigForm,
  'aiMode' | 'agentSpecialty' | 'agentPrompt' | 'agentScope' | 'agentDisclaimers'
> & {
  // citas
  appointmentEnabled: boolean
  appointmentVertical: Vertical
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentPolicies?: string
  appointmentReminders: boolean
  hours?: AppointmentDay[]
  provider?: ProviderInput | null
}

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

/** Construye el payload para POST /api/appointments/config */
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
    provider: form.provider ?? null,
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

  // Estado inicial
  const [form, setForm] = useState<FormState>(() => ({
    aiMode: (initialConfig?.aiMode as AiMode) || 'agente',
    agentSpecialty: (initialConfig?.agentSpecialty as AgentSpecialty) || 'generico',
    agentPrompt: initialConfig?.agentPrompt || '',
    agentScope: initialConfig?.agentScope || '',
    agentDisclaimers: initialConfig?.agentDisclaimers || '',
    // citas: se hidrata al abrir la pestaña Citas
    appointmentEnabled: false,
    appointmentVertical: 'none',
    appointmentTimezone: 'America/Bogota',
    appointmentBufferMin: 10,
    appointmentPolicies: '',
    appointmentReminders: true,
    hours: undefined,
    provider: null,
  }))

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
      const p  = (data?.provider ?? null) as (ProviderInput & { id?: number }) | null

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
        provider: p
          ? {
              id: p.id,
              nombre: p.nombre ?? '',
              email: p.email ?? '',
              phone: p.phone ?? '',
              cargo: p.cargo ?? '',
              colorHex: p.colorHex ?? '',
              activo: typeof p.activo === 'boolean' ? p.activo : true,
            }
          : null,
      }))
    } catch (e: any) {
      console.error('[settings] fetchAppointmentConfig error:', e)
      setErrorMsg(e?.response?.data?.error || e?.message || 'No se pudo cargar la agenda')
    } finally {
      setReloading(false)
    }
  }

  async function handleChangeTab(nextTab: EditorTab) {
    setTab(nextTab)
    setErrorMsg(null)
    if (nextTab === 'citas') {
      await loadAppointmentConfigIntoForm()
    }
  }

  // Cargar Citas la primera vez que se abre el modal en la pestaña 'citas'
  useEffect(() => {
    if (open && tab === 'citas' && !form.hours) {
      loadAppointmentConfigIntoForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab])

  async function guardarAgente() {
    try {
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
      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando el agente.')
    } finally {
      setSaving(false)
    }
  }

  async function guardarCitas() {
    try {
      setSaving(true)
      setErrorMsg(null)
      const appointmentPayload = buildAppointmentPayloadFromForm(form)
      await axios.post(`${API_URL}/api/appointments/config`, appointmentPayload as any, {
        headers: getAuthHeaders(),
      })
      // ✅ cerrar al guardar (igual que agente)
      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando la agenda.')
    } finally {
      setSaving(false)
    }
  }

  // Reiniciar SOLO la agenda (apagar + 7 días cerrados)
  async function reiniciarAgenda() {
    try {
      setSaving(true)
      setErrorMsg(null)

      await axios.post(
        `${API_URL}/api/appointments/config`,
        {
          appointment: {
            enabled: false,
            vertical: form.appointmentVertical || 'none',
            timezone: form.appointmentTimezone || 'America/Bogota',
            bufferMin: Number.isFinite(form.appointmentBufferMin) ? form.appointmentBufferMin : 10,
            policies: '',
            reminders: true,
          },
          hours: emptyHours(),
          provider: null,
        },
        { headers: getAuthHeaders() }
      )

      setForm((f) => ({
        ...f,
        appointmentEnabled: false,
        appointmentPolicies: '',
        appointmentReminders: true,
        hours: emptyHours(),
        provider: null,
      }))
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'No se pudo reiniciar la agenda.')
    } finally {
      setSaving(false)
    }
  }

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

              <div className="mb-4">
                <TypeTabs value={tab} onChange={handleChangeTab} loading={reloading} />
              </div>

              {/* contenido */}
              {tab === 'agente' ? (
                <AgentForm
                  value={{
                    aiMode: form.aiMode,
                    agentSpecialty: form.agentSpecialty,
                    agentPrompt: form.agentPrompt,
                    agentScope: form.agentScope,
                    agentDisclaimers: form.agentDisclaimers,
                  }}
                  onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                />
              ) : (
                <AppointmentForm
                  value={{
                    appointmentEnabled: form.appointmentEnabled,
                    appointmentVertical: form.appointmentVertical,
                    appointmentTimezone: form.appointmentTimezone,
                    appointmentBufferMin: form.appointmentBufferMin,
                    appointmentPolicies: form.appointmentPolicies,
                    appointmentReminders: form.appointmentReminders,
                    hours: form.hours,
                    provider: form.provider,
                  } as AppointmentConfigValue}
                  onChange={(patch) => setForm((f) => ({ ...f, ...(patch as Partial<FormState>) }))}
                />
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
                    : 'Configura tu agenda y políticas de atención.'}
                </div>

                <div className="flex items-center gap-2">
                  {tab === 'citas' && (
                    <button
                      onClick={reiniciarAgenda}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm"
                      type="button"
                    >
                      {saving ? 'Reiniciando…' : 'Reiniciar agenda'}
                    </button>
                  )}

                  {tab === 'agente' ? (
                    <button
                      onClick={guardarAgente}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm disabled:opacity-60"
                      type="button"
                    >
                      {saving ? 'Guardando…' : 'Guardar agente'}
                    </button>
                  ) : (
                    <button
                      onClick={guardarCitas}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-60"
                      type="button"
                    >
                      {saving ? 'Guardando…' : 'Guardar citas'}
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
