'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { 
  X, Lock, Calendar, Bot, RotateCcw, Pencil, Sparkles, 
  CheckCircle2, ShoppingBag // Importamos icono de tienda
} from 'lucide-react'
import clsx from 'clsx'

import AgentForm from './AgentForm'
// 👇 Importamos el formulario nuevo
import EcommerceForm from './EcommerceForm'

import type {
  ModalEntrenamientoProps,
  ConfigForm,
  AiMode,
  AgentSpecialty,
} from './types'

// Servicios
import { getApptConfig, getAppointmentHours } from '@/services/estetica.service'
import { getEcommerceConfig } from '@/services/ecommerce.service' // 👇 Importamos servicio ecommerce

/* ================= Constantes / helpers ================= */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string
const FRONTEND_LOCK_KEY = 'trainingLockedBy' as const // 'agente' | 'estetica' | 'ecommerce'
const RESET_MARKER_KEY = 'trainingResetAt'

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/* =============== Estado local =============== */
type FormState = Pick<
  ConfigForm,
  'aiMode' | 'agentSpecialty' | 'agentPrompt' | 'agentScope' | 'agentDisclaimers'
>

// 👇 Actualizamos tipos de bloqueo y panel
type LockedBy = 'agente' | 'estetica' | 'ecommerce' | null
export type ActivePanel = 'agente' | 'ecommerce' | null

// Detección Estética (Existente)
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

// 👇 NUEVO: Detección E-commerce
async function detectEcommerceConfigured(): Promise<boolean> {
  try {
    const cfg = await getEcommerceConfig()
    return !!cfg?.isActive // Si la tienda está marcada como activa
  } catch {
    return false
  }
}

/* =================== Componente principal =================== */
export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
  panel, // Puede venir 'agente' o 'ecommerce' desde afuera
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

  // Flags de configuración
  const [esteticaConfigured, setEsteticaConfigured] = useState(false)
  const [ecommerceConfigured, setEcommerceConfigured] = useState(false) // 👇 Nuevo flag

  const close = () => {
    setOpen(false)
    onClose?.()
  }

  useEffect(() => {
    if (trainingActive && panel === undefined && initialPanel) {
      setInternalPanel(initialPanel)
    }
  }, [trainingActive, panel, initialPanel])

  /* ============ Carga inicial ============ */
  async function loadAllConfig() {
    try {
      if (typeof window !== 'undefined') {
        const mk = localStorage.getItem(RESET_MARKER_KEY)
        if (mk) localStorage.removeItem(RESET_MARKER_KEY)
      }

      setForm((f) => ({
        ...f,
        aiMode: (initialConfig?.aiMode as AiMode) || f.aiMode,
        agentSpecialty: (initialConfig?.agentSpecialty as AgentSpecialty) || f.agentSpecialty,
        agentPrompt: initialConfig?.agentPrompt ?? f.agentPrompt,
        agentScope: initialConfig?.agentScope ?? f.agentScope,
        agentDisclaimers: initialConfig?.agentDisclaimers ?? f.agentDisclaimers,
      }))

      // Leer bloqueo
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(FRONTEND_LOCK_KEY) as LockedBy | null
        if (['agente', 'estetica', 'ecommerce'].includes(stored as string)) {
           setLockedBy(stored)
        } else {
           setLockedBy(null)
        }
      }

      // Detectar configuraciones
      const [apptOk, ecomOk] = await Promise.all([
        detectEsteticaConfigured(),
        detectEcommerceConfigured()
      ])
      
      setEsteticaConfigured(apptOk)
      setEcommerceConfigured(ecomOk)

      // Auto-lock lógico si detectamos backend activo pero no hay lock local
      if (apptOk && !lockedBy) setLockedBy('estetica')
      if (ecomOk && !lockedBy) setLockedBy('ecommerce')

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

  // Reiniciar TODO
  async function reiniciarEntrenamiento() {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar TODO? Se borrará configuración de Agente, Estética y E-commerce.'
        )
        if (!ok) return
      }
      setSaving(true)

      // 1. Reset Agente
      try {
        await axios.post(`${API_URL}/api/config/reset`, null, { params: { withCatalog: false }, headers: getAuthHeaders() })
      } catch {}

      // 2. Reset Estética
      try {
        await axios.post(`${API_URL}/api/estetica/config/reset`, null, { headers: getAuthHeaders() })
      } catch {}

      // 3. Reset E-commerce (Desactivar)
      // Como no tenemos endpoint de reset específico, lo desactivamos manualmente
      try {
         await axios.post(`${API_URL}/api/ecommerce/config`, { isActive: false }, { headers: getAuthHeaders() })
      } catch {}

      // 4. Limpieza Local
      if (typeof window !== 'undefined') {
        localStorage.removeItem(FRONTEND_LOCK_KEY)
      }
      setLockedBy(null)
      setEsteticaConfigured(false)
      setEcommerceConfigured(false)
      setForm({
        aiMode: 'agente',
        agentSpecialty: 'generico',
        agentPrompt: '',
        agentScope: '',
        agentDisclaimers: '',
      })
      setInternalPanel(null) // Volver a las cards
      
      setUiEpoch(n => n + 1)
    } finally {
      setSaving(false)
    }
  }

  // Reiniciar SOLO Estética
  async function resetEsteticaOnly() {
    try {
      if (!confirm('¿Reiniciar solo Estética?')) return
      setSaving(true)
      await axios.post(`${API_URL}/api/estetica/config/reset`, null, { headers: getAuthHeaders() })
      
      if (lockedBy === 'estetica') {
         localStorage.removeItem(FRONTEND_LOCK_KEY)
         setLockedBy(null)
      }
      setEsteticaConfigured(false)
      setUiEpoch(n => n + 1)
    } finally {
      setSaving(false)
    }
  }

  // Reiniciar SOLO Ecommerce
  async function resetEcommerceOnly() {
    try {
      if (!confirm('¿Reiniciar solo Tienda?')) return
      setSaving(true)
      // Desactivamos la tienda
      await axios.post(`${API_URL}/api/ecommerce/config`, { isActive: false }, { headers: getAuthHeaders() })
      
      if (lockedBy === 'ecommerce') {
         localStorage.removeItem(FRONTEND_LOCK_KEY)
         setLockedBy(null)
      }
      setEcommerceConfigured(false)
      setInternalPanel(null)
      setUiEpoch(n => n + 1)
    } finally {
      setSaving(false)
    }
  }

  async function guardarAgente() {
    try {
      setSaving(true)
      await axios.put(`${API_URL}/api/config/agent`, {
          aiMode: 'agente' as AiMode,
          agentSpecialty: form.agentSpecialty,
          agentPrompt: form.agentPrompt ?? '',
          agentScope: form.agentScope ?? '',
          agentDisclaimers: form.agentDisclaimers ?? '',
        }, { headers: getAuthHeaders() })

      localStorage.setItem(FRONTEND_LOCK_KEY, 'agente')
      setLockedBy('agente')
      close()
    } finally {
      setSaving(false)
    }
  }

  /* =================== UI PREMIUM =================== */

  const lockBanner = useMemo(() => {
    let text = null
    if (lockedBy === 'agente') text = 'Entrenamiento bloqueado por Agente.'
    if (lockedBy === 'estetica') text = 'Entrenamiento bloqueado por Estética.'
    if (lockedBy === 'ecommerce') text = 'Entrenamiento bloqueado por Tienda.' // 👇 Texto nuevo

    if (!text) return null
    return (
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-lg">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/20 text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-amber-200">Modo Restringido</p>
                <p className="text-xs text-amber-200/70">{text}</p>
            </div>
        </div>
        <button
          type="button"
          onClick={reiniciarEntrenamiento}
          className="whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all"
          disabled={saving}
        >
          {saving ? '...' : 'Reiniciar Todo'}
        </button>
      </div>
    )
  }, [lockedBy, saving])

  // Barra Estética (Si está activa)
  const activeModuleBar = useMemo(() => {
    if (esteticaConfigured) {
       return (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-lg">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
             <div>
                <p className="text-sm font-semibold text-emerald-200">Estética Activa</p>
                <p className="text-xs text-emerald-200/70">Módulo de citas funcionando.</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { router.push('/dashboard/settings/estetica'); close() }} className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10">Editar</button>
            <button onClick={resetEsteticaOnly} className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-500 text-white"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>
        </div>
       )
    }
    // 👇 Barra para E-commerce activo
    if (ecommerceConfigured) {
        return (
         <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4 shadow-lg">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-pink-500/20 text-pink-400 shrink-0"><ShoppingBag className="w-5 h-5" /></div>
              <div>
                 <p className="text-sm font-semibold text-pink-200">Tienda Activa</p>
                 <p className="text-xs text-pink-200/70">Catálogo y ventas funcionando.</p>
              </div>
           </div>
           <div className="flex gap-2">
             <button onClick={() => setInternalPanel('ecommerce')} className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10">Editar</button>
             <button onClick={resetEcommerceOnly} className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-pink-600 hover:bg-pink-500 text-white"><RotateCcw className="w-3.5 h-3.5" /></button>
           </div>
         </div>
        )
     }
     return null
  }, [esteticaConfigured, ecommerceConfigured, saving])

  const shouldShowCards = !effectivePanel && panel === undefined

  const Card = ({ icon, title, desc, disabled, onOpen, colorClass }: any) => (
    <button
      type="button"
      onClick={onOpen}
      disabled={!!disabled}
      className={clsx(
        'group relative overflow-hidden rounded-[2rem] border p-6 text-left transition-all duration-300 h-full flex flex-col justify-between',
        disabled ? 'border-white/5 bg-zinc-900/30 opacity-50 cursor-not-allowed' : 'border-white/10 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-indigo-500/30 hover:shadow-2xl hover:-translate-y-1'
      )}
    >
      {!disabled && <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />}
      <div>
        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110 duration-300", colorClass)}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
      </div>
      <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
          Configurar <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
      </div>
    </button>
  )

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={() => {}} className="relative z-[100]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-5xl rounded-[2.5rem]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"><Bot className="w-6 h-6" /></div>
                      <div>
                          <h2 className="text-xl font-bold text-white tracking-tight">Entrenamiento de IA</h2>
                          <p className="text-xs text-zinc-400">Elige el cerebro de tu negocio</p>
                      </div>
                  </div>
                  <button onClick={close} className="p-2 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-indigo-500/5 blur-[100px] pointer-events-none" />

                  <div className="relative z-10">
                      {lockBanner}
                      {activeModuleBar}

                      {/* Cards de Selección (Solo si no hay panel activo) */}
                      {shouldShowCards && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                              {/* 1. Estética */}
                              <Card
                                  icon={<Calendar className="w-6 h-6" />}
                                  title="Clínica / Estética"
                                  desc="Agenda citas, gestiona doctores y procedimientos."
                                  disabled={esteticaConfigured || lockedBy !== null}
                                  colorClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  onOpen={() => {
                                      router.push('/dashboard/settings/estetica')
                                      close()
                                  }}
                              />
                              
                              {/* 2. E-commerce (NUEVO) */}
                              <Card
                                  icon={<ShoppingBag className="w-6 h-6" />}
                                  title="Tienda Virtual"
                                  desc="Vende productos, carrito de compras y envíos."
                                  disabled={ecommerceConfigured || lockedBy !== null}
                                  colorClass="bg-pink-500/10 text-pink-400 border-pink-500/20"
                                  onOpen={() => setInternalPanel('ecommerce')}
                              />

                              {/* 3. Agente Libre */}
                              <Card
                                  icon={<Sparkles className="w-6 h-6" />}
                                  title="Agente Libre"
                                  desc="Asistente general sin funciones específicas."
                                  disabled={lockedBy !== null}
                                  colorClass="bg-violet-500/10 text-violet-400 border-violet-500/20"
                                  onOpen={() => setInternalPanel('agente')}
                              />
                          </div>
                      )}

                      {/* Panel: E-commerce */}
                      {effectivePanel === 'ecommerce' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                              <div className="mb-4">
                                <button onClick={() => !lockedBy && setInternalPanel(null)} className="text-xs text-zinc-500 hover:text-white mb-2 flex items-center gap-1 transition-colors">
                                  ← Volver a selección
                                </button>
                              </div>
                              <EcommerceForm onClose={() => {
                                 setLockedBy('ecommerce') // Bloqueamos UI al guardar con éxito
                                 localStorage.setItem(FRONTEND_LOCK_KEY, 'ecommerce')
                                 setEcommerceConfigured(true)
                                 close()
                              }} />
                          </motion.div>
                      )}

                      {/* Panel: Agente (Existente) */}
                      {effectivePanel === 'agente' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={clsx("rounded-3xl border border-white/5 bg-zinc-900/40 p-6 md:p-8")}>
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
                              <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-white/5">
                                  <button onClick={() => !lockedBy ? setInternalPanel(null) : close()} className="text-sm text-zinc-400 hover:text-white px-4 py-2 transition-colors">Cancelar</button>
                                  <button
                                      onClick={guardarAgente}
                                      disabled={saving}
                                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg transition-all"
                                  >
                                      {saving ? 'Guardando...' : 'Guardar Agente'}
                                  </button>
                              </div>
                          </motion.div>
                      )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}