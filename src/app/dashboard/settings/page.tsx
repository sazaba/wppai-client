'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCw, Calendar, Bot } from 'lucide-react'
import axios from 'axios'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import ModalEntrenamiento from './components/training/ModalEntrenamiento'
import WhatsappConfig from './components/WhatsappConfig'
import ActivatePhoneCard from './ActivatePhoneCard'

import type {
  ConfigForm,
  BusinessType,
  BackendBusinessConfig,
} from './components/training/types'

import { getApptConfig, getAppointmentHours } from '@/services/estetica.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL as string

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const DEFAULTS: ConfigForm = {
  nombre: '',
  descripcion: '',
  servicios: '',
  faq: '',
  horarios: '',
  disclaimers: '',
  businessType: 'servicios',
  aiMode: 'agente',
  agentSpecialty: 'generico',
  agentPrompt: '',
  agentScope: '',
  agentDisclaimers: '',
  enviosInfo: '',
  metodosPago: '',
  tiendaFisica: false,
  direccionTienda: '',
  politicasDevolucion: '',
  politicasGarantia: '',
  promocionesInfo: '',
  canalesAtencion: '',
  extras: '',
  palabrasClaveNegocio: '',
  envioTipo: '',
  envioEntregaEstimado: '',
  envioCostoFijo: '',
  envioGratisDesde: '',
  pagoLinkGenerico: '',
  pagoLinkProductoBase: '',
  pagoNotas: '',
  bancoNombre: '',
  bancoTitular: '',
  bancoTipoCuenta: '',
  bancoNumeroCuenta: '',
  bancoDocumento: '',
  transferenciaQRUrl: '',
  facturaElectronicaInfo: '',
  soporteDevolucionesInfo: '',
  escalarSiNoConfia: true,
  escalarPalabrasClave: '',
  escalarPorReintentos: 0,
}

function materializeConfig(data?: BackendBusinessConfig | null): ConfigForm {
  const d = data ?? {}
  return {
    ...DEFAULTS,
    ...d,
    businessType: (d.businessType as BusinessType) ?? DEFAULTS.businessType,
    envioCostoFijo: (d as any)?.envioCostoFijo ?? '',
    envioGratisDesde: (d as any)?.envioGratisDesde ?? '',
    pagoNotas: d?.pagoNotas ?? '',
  }
}

function isAgentConfigured(cfg: ConfigForm | null): boolean {
  if (!cfg) return false
  const hasText =
    (cfg.agentPrompt && cfg.agentPrompt.trim().length > 0) ||
    (cfg.agentScope && cfg.agentScope.trim().length > 0) ||
    (cfg.agentDisclaimers && cfg.agentDisclaimers.trim().length > 0)
  const specialtySet = cfg.agentSpecialty && cfg.agentSpecialty !== 'generico'
  return Boolean(hasText || specialtySet)
}

async function fetchAppointmentsConfigured(): Promise<boolean> {
  try {
    const [cfg, hours] = await Promise.all([getApptConfig(), getAppointmentHours()])
    const enabled = !!cfg?.appointmentEnabled
    const hasTz = typeof cfg?.appointmentTimezone === 'string' && cfg.appointmentTimezone.trim() !== ''
    const hasVert = typeof cfg?.appointmentVertical === 'string' && cfg.appointmentVertical.trim() !== ''
    const hasServ = typeof (cfg as any)?.servicesText === 'string' && (cfg as any).servicesText.trim() !== ''
    const anyOpen = Array.isArray(hours) && hours.some((h: any) => !!h?.isOpen)
    return Boolean(enabled || hasTz || hasVert || hasServ || anyOpen)
  } catch {
    return false
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [form, setForm] = useState<ConfigForm>(DEFAULTS)
  const [configGuardada, setConfigGuardada] = useState<ConfigForm | null>(null)
  const [agentConfigured, setAgentConfigured] = useState(false)
  const [appointmentsConfigured, setAppointmentsConfigured] = useState(false)
  const [trainingActive, setTrainingActive] = useState(false)
  const [initialTrainingPanel, setInitialTrainingPanel] = useState<'agente' | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  async function refreshAll() {
    try {
      const { data } = await axios.get(`${API_URL}/api/config`, { headers: getAuthHeaders() })
      const safe = materializeConfig(data as BackendBusinessConfig)
      setConfigGuardada(Object.keys(data || {}).length ? safe : null)
      setForm(safe)
      setAgentConfigured(isAgentConfigured(safe))
      const apptOk = await fetchAppointmentsConfigured()
      setAppointmentsConfigured(apptOk)
    } catch (err) {
      console.error('Error al cargar configuración existente:', err)
      setForm(DEFAULTS)
      setConfigGuardada(null)
      setAgentConfigured(false)
      setAppointmentsConfigured(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const reiniciarEntrenamiento = async () => {
    const confirm = await Swal.fire({
      title: '¿Reiniciar entrenamiento?',
      html: `
        <div class="text-slate-300">
          Se <b>eliminará</b> la configuración actual del negocio y se limpiará la agenda
          (config de estética, horarios, staff, procedimientos y excepciones).
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar',
      background: '#0f172a',
      color: '#e2e8f0',
      iconColor: '#f59e0b',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
        title: 'text-slate-100',
        htmlContainer: 'text-slate-300',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl',
      },
    })
    if (!confirm.isConfirmed) return

    setResetting(true)
    await Swal.fire({
      title: 'Reiniciando…',
      html: '<div class="text-slate-300">Aplicando cambios y limpiando datos…</div>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      background: '#0f172a',
      color: '#e2e8f0',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
        title: 'text-slate-100',
        htmlContainer: 'text-slate-300',
      },
    })

    try {
      let esteticaPurged = false
      try {
        await axios.delete(`${API_URL}/api/estetica/purge`, {
          headers: getAuthHeaders(),
          params: { t: Date.now() },
        })
        esteticaPurged = true
      } catch (err) {
        console.warn('[reiniciar] DELETE /api/estetica/purge falló, intentaré legacy:', err)
      }

      if (!esteticaPurged) {
        let apptWiped = false
        try {
          await axios.delete(`${API_URL}/api/estetica/config`, {
            headers: getAuthHeaders(),
            params: { purgeHours: 1, t: Date.now() },
          })
          apptWiped = true
        } catch (err) {
          console.warn('[reiniciar] DELETE /api/estetica/config?purgeHours=1 falló, probaré /reset:', err)
        }

        if (!apptWiped) {
          try {
            await axios.post(`${API_URL}/api/estetica/config/reset`, null, {
              headers: getAuthHeaders(),
              params: { t: Date.now() },
            })
          } catch (err) {
            console.warn('[reiniciar] POST /api/estetica/config/reset también falló:', err)
          }
        }
      }

      try {
        await axios.post(`${API_URL}/api/config/reset`, null, {
          params: { withCatalog: true, t: Date.now() },
          headers: getAuthHeaders(),
        })
      } catch (e) {
        console.warn('[reiniciar] /api/config/reset falló (se ignora):', e)
      }

      setConfigGuardada(null)
      setForm(DEFAULTS)
      setAgentConfigured(false)
      setAppointmentsConfigured(false)
      setInitialTrainingPanel(null)
      setTrainingActive(false)

      await Swal.fire({
        title: '¡Reinicio completado!',
        text: 'La configuración fue limpiada correctamente.',
        icon: 'success',
        confirmButtonText: 'Listo',
        background: '#0f172a',
        color: '#e2e8f0',
        iconColor: '#22c55e',
        confirmButtonColor: '#7c3aed',
        customClass: {
          popup: 'rounded-2xl border border-white/10',
          title: 'text-slate-100',
          htmlContainer: 'text-slate-300',
          confirmButton: 'rounded-xl',
        },
      })
    } catch (e: any) {
      console.error('[reiniciarEntrenamiento] error:', e?.response?.data || e?.message || e)
      await Swal.fire({
        title: 'Error al reiniciar',
        text: e?.message || 'No fue posible completar el reinicio.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        background: '#0f172a',
        color: '#e2e8f0',
        iconColor: '#ef4444',
        confirmButtonColor: '#7c3aed',
        customClass: {
          popup: 'rounded-2xl border border-white/10',
          title: 'text-slate-100',
          htmlContainer: 'text-slate-300',
          confirmButton: 'rounded-xl',
        },
      })
    } finally {
      setResetting(false)
    }
  }

  const openTraining = (panel: 'estetica' | 'agente' | null) => {
    if (panel === 'estetica') {
      router.push('/dashboard/settings/estetica')
      return
    }
    setInitialTrainingPanel(panel === 'agente' ? 'agente' : null)
    setTrainingActive(true)
  }

  if (loading) return <p className="p-8 text-slate-300">Cargando configuración...</p>

  const Card = ({
    icon,
    title,
    desc,
    onClick,
  }: {
    icon: React.ReactNode
    title: string
    desc: string
    onClick: () => void
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 p-5 text-left transition"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-slate-700/30 border border-slate-700">
          {icon}
        </div>
        <div className="text-lg font-medium text-white">{title}</div>
      </div>
      <p className="text-sm text-slate-300">{desc}</p>
    </button>
  )

  const hideTopCards = agentConfigured || appointmentsConfigured
  const showActions = agentConfigured || appointmentsConfigured

  return (
    <div className="min-h-screen overflow-y-auto px-4 sm:px-6 py-8 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Entrenamiento de tu IA</h1>
        </div>

        {!hideTopCards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              icon={<Calendar className="w-5 h-5 text-emerald-300" />}
              title="Configurar Estética"
              desc="Define horarios, políticas, recordatorios y servicios."
              onClick={() => openTraining('estetica')}
            />
            <Card
              icon={<Bot className="w-5 h-5 text-violet-300" />}
              title="Configurar Agente"
              desc="Define el modo, especialidad y prompts del agente."
              onClick={() => openTraining('agente')}
            />
          </div>
        )}

        {showActions && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl text-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">⚙️ Acciones de configuración</h2>
              <div className="flex gap-2 text-xs">
                <span
                  className={[
                    'rounded-full px-3 py-1 border',
                    agentConfigured
                      ? 'bg-emerald-900/30 border-emerald-700 text-emerald-200'
                      : 'bg-slate-700/40 border-slate-600 text-slate-300',
                  ].join(' ')}
                >
                  Agente: {agentConfigured ? 'Configurado' : 'No configurado'}
                </span>
                <span
                  className={[
                    'rounded-full px-3 py-1 border',
                    appointmentsConfigured
                      ? 'bg-emerald-900/30 border-emerald-700 text-emerald-200'
                      : 'bg-slate-700/40 border-slate-600 text-slate-300',
                  ].join(' ')}
                >
                  Estética: {appointmentsConfigured ? 'Configuradas' : 'No configuradas'}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Puedes actualizar los parámetros o reiniciar todo cuando lo necesites.
            </p>

            <div className="flex flex-wrap gap-3">
              {appointmentsConfigured && (
                <button
                  onClick={() => openTraining('estetica')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow"
                >
                  <Calendar className="w-4 h-4" />
                  Editar Estética
                </button>
              )}

              {agentConfigured && (
                <button
                  onClick={() => openTraining('agente')}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg shadow"
                >
                  <Bot className="w-4 h-4" />
                  Editar Agente
                </button>
              )}

              <button
                onClick={reiniciarEntrenamiento}
                disabled={resetting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow"
              >
                <RotateCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
                {resetting ? 'Reiniciando…' : 'Reiniciar entrenamiento'}
              </button>
            </div>
          </div>
        )}

        <ModalEntrenamiento
          key={`modal-${initialTrainingPanel ?? 'cards'}`}
          trainingActive={trainingActive}
          initialConfig={form}
          initialPanel={initialTrainingPanel}
          onClose={async () => {
            setTrainingActive(false)
            await refreshAll()
          }}
        />

        <WhatsappConfig />
        <ActivatePhoneCard />
      </div>
    </div>
  )
}
