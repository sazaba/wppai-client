'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { X, Lock, Calendar, Bot, RotateCcw, Pencil } from 'lucide-react'

import AgentForm from './AgentForm'

import type {
  ModalEntrenamientoProps,
  ConfigForm,
  AiMode,
  AgentSpecialty,
} from './types'

// 👇 NUEVO: servicios de Estética (unwrap)
import { getApptConfig, getAppointmentHours } from '@/services/estetica.service'

/* ================= Constantes / helpers ================= */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string
const FRONTEND_LOCK_KEY = 'trainingLockedBy' as const // 'agente' | 'estetica'
const RESET_MARKER_KEY = 'trainingResetAt'

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/* =============== Estado local (solo AGENTE en el modal) =============== */
type FormState = Pick<
  ConfigForm,
  'aiMode' | 'agentSpecialty' | 'agentPrompt' | 'agentScope' | 'agentDisclaimers'
>

type LockedBy = 'agente' | 'estetica' | null
export type ActivePanel = 'agente' | null

// 🔁 NUEVO: detección usando servicios (unwrap) + horarios
async function detectEsteticaConfigured(): Promise<boolean> {
  try {
    const [cfg, hours] = await Promise.all([getApptConfig(), getAppointmentHours()])
    const enabled = !!cfg?.appointmentEnabled
    const hasTz   = typeof cfg?.appointmentTimezone === 'string' && cfg.appointmentTimezone.trim() !== ''
    const hasVert = typeof cfg?.appointmentVertical === 'string' && cfg.appointmentVertical.trim() !== ''
    const hasServ = typeof (cfg as any)?.servicesText === 'string' && (cfg as any).servicesText.trim() !== ''
    const anyOpen = Array.isArray(hours) && hours.some((h: any) => !!h?.isOpen)
    return Boolean(enabled || hasTz || hasVert || hasServ || anyOpen)
  } catch {
    return false
  }
}

/* =================== Componente principal =================== */
export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
  panel,
  initialPanel = null,
}: ModalEntrenamientoProps & { panel?: ActivePanel; initialPanel?: ActivePanel }) {
  const router = useRouter()

  const [open, setOpen] = useState<boolean>(trainingActive)
  useEffect(() => setOpen(trainingActive), [trainingActive])

  const [saving, setSaving] = useState(false)
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
  }))

  // NUEVO: flag de estética
  const [esteticaConfigured, setEsteticaConfigured] = useState(false)

  const close = () => {
    setOpen(false)
    onClose?.()
  }

  useEffect(() => {
    if (trainingActive && panel === undefined && initialPanel) {
      setInternalPanel(initialPanel)
    }
  }, [trainingActive, panel, initialPanel])

  /* ============ Carga inicial (solo agente + lock + estética cfg) ============ */
  async function loadAllConfig() {
    try {
      if (typeof window !== 'undefined') {
        const mk = localStorage.getItem(RESET_MARKER_KEY)
        if (mk) localStorage.removeItem(RESET_MARKER_KEY)
      }

      // Perfil del agente desde initialConfig
      setForm((f) => ({
        ...f,
        aiMode: (initialConfig?.aiMode as AiMode) || f.aiMode,
        agentSpecialty: (initialConfig?.agentSpecialty as AgentSpecialty) || f.agentSpecialty,
        agentPrompt: initialConfig?.agentPrompt ?? f.agentPrompt,
        agentScope: initialConfig?.agentScope ?? f.agentScope,
        agentDisclaimers: initialConfig?.agentDisclaimers ?? f.agentDisclaimers,
      }))

      // Leer bloqueo del frontend (lo setea la página de Estética al guardar)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(FRONTEND_LOCK_KEY) as LockedBy | null
        setLockedBy(stored === 'agente' || stored === 'estetica' ? stored : null)
      }

      // NUEVO: consultar si estética está configurado
      const apptOk = await detectEsteticaConfigured()
      setEsteticaConfigured(apptOk)

      setUiEpoch((n) => n + 1)
    } catch (e) {
      console.error('[settings] loadAllConfig error:', e)
    }
  }

  useEffect(() => {
    if (open) loadAllConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /* ================= Acciones ================= */

  // Reiniciar: agente + estética
  async function reiniciarEntrenamiento() {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar entrenamiento completo? Esto borrará tu configuración de agente, configuración de estética y horarios.'
        )
        if (!ok) return
      }
      setSaving(true)

      // 1) Reset del AGENTE
      try {
        await axios.post(
          `${API_URL}/api/config/reset`,
          null,
          { params: { withCatalog: false, t: Date.now() }, headers: getAuthHeaders() }
        )
      } catch (err) {
        console.warn('[reset] /api/config/reset falló (se ignora):', err)
      }

      // 2) Borrar estetica + hours
      let wiped = false
      try {
        await axios.delete(`${API_URL}/api/estetica/config`, {
          headers: getAuthHeaders(),
          params: { purgeHours: 1, t: Date.now() },
        })
        wiped = true
      } catch (err) {
        console.warn('[reset] DELETE /api/estetica/config?purgeHours=1 falló, probando /reset:', err)
      }

      // 3) Fallback: /reset
      if (!wiped) {
        await axios.post(
          `${API_URL}/api/estetica/config/reset`,
          null,
          { headers: getAuthHeaders(), params: { t: Date.now() } }
        )
      }

      // 4) Limpieza local UI
      if (typeof window !== 'undefined') {
        localStorage.removeItem(FRONTEND_LOCK_KEY)
        localStorage.setItem(RESET_MARKER_KEY, String(Date.now()))
      }
      setLockedBy(null)

      // 5) Estado limpio (solo agente en el modal)
      setForm({
        aiMode: 'agente',
        agentSpecialty: 'generico',
        agentPrompt: '',
        agentScope: '',
        agentDisclaimers: '',
      })

      // 6) NUEVO: Re-consultar estado de estética
      setEsteticaConfigured(await detectEsteticaConfigured())
      setUiEpoch(n => n + 1)
    } finally {
      setSaving(false)
    }
  }

  // Reiniciar SOLO Estética (config + horarios)
  async function resetEsteticaOnly() {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar Estética? Esto borrará SOLO la configuración de estética y sus horarios.'
        )
        if (!ok) return
      }
      setSaving(true)

      let wiped = false
      try {
        await axios.delete(`${API_URL}/api/estetica/config`, {
          headers: getAuthHeaders(),
          params: { purgeHours: 1, t: Date.now() },
        })
        wiped = true
      } catch (err) {
        console.warn('[reset estética] DELETE /api/estetica/config falló, intentando /reset:', err)
      }

      if (!wiped) {
        await axios.post(
          `${API_URL}/api/estetica/config/reset`,
          null,
          { headers: getAuthHeaders(), params: { t: Date.now() } }
        )
      }

      // Si el lock provenía de estética, libéralo
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(FRONTEND_LOCK_KEY)
        if (stored === 'estetica') {
          localStorage.removeItem(FRONTEND_LOCK_KEY)
        }
      }
      if (lockedBy === 'estetica') setLockedBy(null)

      // NUEVO: Re-consultar para refrescar la barra de acciones
      setEsteticaConfigured(await detectEsteticaConfigured())
      setUiEpoch(n => n + 1)
    } finally {
      setSaving(false)
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

  /* =================== UI =================== */

  const lockBanner = useMemo(() => {
    const text =
      lockedBy === 'agente'
        ? 'Entrenamiento bloqueado por configuración de Agente (bloqueo frontend).'
        : lockedBy === 'estetica'
        ? 'Entrenamiento bloqueado por configuración de Estética (bloqueo frontend).'
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

  // Barra de acciones rápidas para Estética ya configurada
  const esteticaActionBar = esteticaConfigured ? (
    <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-emerald-700/40 bg-emerald-900/15 px-3 py-3">
      <div className="text-sm text-emerald-200">
        Estética ya está configurado. Puedes editar o reiniciar esta configuración.
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            router.push('/dashboard/settings/estetica')
            close()
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
          disabled={saving}
          aria-label="Editar Estética"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </button>
        <button
          type="button"
          onClick={resetEsteticaOnly}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-emerald-700 hover:bg-emerald-800 text-white"
          disabled={saving}
          aria-label="Reiniciar Estética"
        >
          <RotateCcw className="w-4 h-4" />
          {saving ? 'Reiniciando…' : 'Reiniciar'}
        </button>
      </div>
    </div>
  ) : null

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
              {esteticaActionBar}

              {/* Cards internas solo si no se fuerza panel */}
              {shouldShowCards && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Card
                    icon={<Calendar className="w-5 h-5 text-emerald-300" />}
                    title={esteticaConfigured ? 'Estética configurada' : 'Configurar Estética'}
                    desc={
                      esteticaConfigured
                        ? 'Ya tienes Estética configurado. Usa los botones de arriba para editar o reiniciar.'
                        : 'Define horarios, políticas, recordatorios y servicios.'
                    }
                    disabled={esteticaConfigured || lockedBy === 'agente' || saving}
                    onOpen={() => {
                      if (esteticaConfigured) return
                      router.push('/dashboard/settings/estetica')
                      close()
                    }}
                  />
                  <Card
                    icon={<Bot className="w-5 h-5 text-violet-300" />}
                    title="Configurar Agente"
                    desc="Define el modo, especialidad y prompts del agente."
                    disabled={lockedBy === 'estetica' || saving}
                    onOpen={() => setInternalPanel('agente')}
                  />
                </div>
              )}

              {/* Formulario AGENTE */}
              {effectivePanel === 'agente' && (
                <div className={lockedBy === 'estetica' ? 'pointer-events-none opacity-50' : ''}>
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
                      disabled={saving || lockedBy === 'estetica'}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm disabled:opacity-60"
                      type="button"
                    >
                      {saving ? 'Guardando…' : lockedBy === 'estetica' ? 'Bloqueado' : 'Guardar'}
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
