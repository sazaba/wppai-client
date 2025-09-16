'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios, { AxiosError } from 'axios'
import { X } from 'lucide-react'

import AgentForm from './AgentForm'

import type {
  ModalEntrenamientoProps,
  ConfigForm,
  AiMode,
  AgentSpecialty,
} from './types'

/* ================= Constantes / helpers ================= */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function noCacheHeaders() {
  return { ...getAuthHeaders(), 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
}

function prettyAxiosError(e: unknown, fallback = 'Ocurrió un error') {
  const ax = e as AxiosError<any>
  if (ax?.message === 'Network Error') {
    return 'No se pudo conectar con el backend (Network Error). Revisa NEXT_PUBLIC_API_URL, CORS y que el servidor esté en línea.'
  }
  return ax?.response?.data?.error || fallback
}

/* =================== Tipado del formulario =================== */
type FormState = Pick<
  ConfigForm,
  'aiMode' | 'agentSpecialty' | 'agentPrompt' | 'agentScope' | 'agentDisclaimers'
>

/* =================== Componente principal =================== */
export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
}: ModalEntrenamientoProps) {
  const [open, setOpen] = useState<boolean>(trainingActive)
  useEffect(() => setOpen(trainingActive), [trainingActive])

  const [saving, setSaving] = useState(false)
  const [reloading, setReloading] = useState(false)

  const [form, setForm] = useState<FormState>(() => ({
    aiMode: (initialConfig?.aiMode as AiMode) || 'agente',
    agentSpecialty: (initialConfig?.agentSpecialty as AgentSpecialty) || 'generico',
    agentPrompt: initialConfig?.agentPrompt || '',
    agentScope: initialConfig?.agentScope || '',
    agentDisclaimers: initialConfig?.agentDisclaimers || '',
  }))

  const close = () => {
    setOpen(false)
    onClose?.()
  }

  /* ============ Carga inicial: solo configuración de agente ============ */
  async function loadAgentConfig() {
    setReloading(true)
    try {
      const r = await axios
        .get(`${API_URL}/api/config`, { headers: noCacheHeaders(), params: { t: Date.now() } })
        .catch(() => null)

      const agentPromptDb = (r?.data?.agentPrompt ?? '') as string
      const agentScopeDb = (r?.data?.agentScope ?? '') as string
      const agentDiscDb = (r?.data?.agentDisclaimers ?? '') as string
      const agentSpecDb = (r?.data?.agentSpecialty ?? 'generico') as AgentSpecialty

      setForm((f) => ({
        ...f,
        agentSpecialty: agentSpecDb,
        agentPrompt: agentPromptDb,
        agentScope: agentScopeDb,
        agentDisclaimers: agentDiscDb,
        aiMode: 'agente',
      }))
    } catch (e) {
      // Solo log: no mostrar banner rojo
      console.error('[settings] loadAgentConfig:', prettyAxiosError(e))
    } finally {
      setReloading(false)
    }
  }

  useEffect(() => {
    if (open) loadAgentConfig()
  }, [open])

  /* ================= Acciones ================= */
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
      ).catch(() => {})

      close()
    } finally {
      setSaving(false)
    }
  }

  /* =================== UI (sin banners ni cards) =================== */
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

              {/* ÚNICAMENTE el formulario de Agente */}
              <AgentForm
                value={{
                  aiMode: form.aiMode,
                  agentSpecialty: form.agentSpecialty,
                  agentPrompt: form.agentPrompt,
                  agentScope: form.agentScope,
                  agentDisclaimers: form.agentDisclaimers,
                }}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              />

              {/* Botón Guardar */}
              <div className="mt-6 flex items-center justify-end">
                <button
                  onClick={guardarAgente}
                  disabled={saving || reloading}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm disabled:opacity-60"
                  type="button"
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
