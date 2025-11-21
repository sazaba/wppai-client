

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCw, Calendar, Bot, MessageCircle, ChevronDown } from 'lucide-react'
import axios from 'axios'
import Swal from 'sweetalert2'


import ModalEntrenamiento from './components/training/ModalEntrenamiento'
import WhatsappConfig from './components/WhatsappConfig'
import ActivatePhoneCard from './ActivatePhoneCard'

import type {
  ConfigForm,
  BusinessType,
  BackendBusinessConfig,
} from './components/training/types'

// 👇 Servicios para detectar configuración de citas
import { getApptConfig, getAppointmentHours } from '@/services/estetica.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL as string

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

/* ================= Defaults (compat backend) ================= */
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

/* ================= Helpers de detección ================= */
function isAgentConfigured(cfg: ConfigForm | null): boolean {
  if (!cfg) return false
  const hasText =
    (cfg.agentPrompt && cfg.agentPrompt.trim().length > 0) ||
    (cfg.agentScope && cfg.agentScope.trim().length > 0) ||
    (cfg.agentDisclaimers && cfg.agentDisclaimers.trim().length > 0)
  const specialtySet = cfg.agentSpecialty && cfg.agentSpecialty !== 'generico'
  return Boolean(hasText || specialtySet)
}

// Usa servicios para detectar si hay configuración de agenda
async function fetchAppointmentsConfigured(): Promise<boolean> {
  try {
    const [cfg, hours] = await Promise.all([getApptConfig(), getAppointmentHours()])

    const enabled = !!cfg?.appointmentEnabled
    const hasTz =
      typeof cfg?.appointmentTimezone === 'string' &&
      cfg.appointmentTimezone.trim() !== ''
    const hasVert =
      typeof cfg?.appointmentVertical === 'string' &&
      cfg.appointmentVertical.trim() !== ''
    const hasServ =
      typeof (cfg as any)?.servicesText === 'string' &&
      (cfg as any).servicesText.trim() !== ''
    const anyOpen = Array.isArray(hours) && hours.some((h: any) => !!h?.isOpen)

    return Boolean(enabled || hasTz || hasVert || hasServ || anyOpen)
  } catch {
    return false
  }
}

/* =================== Componente =================== */
export default function SettingsPage(): React.ReactElement {
  const router = useRouter()

  const [form, setForm] = useState<ConfigForm>(DEFAULTS)
  const [configGuardada, setConfigGuardada] = useState<ConfigForm | null>(null)

  const [agentConfigured, setAgentConfigured] = useState<boolean>(false)
  const [appointmentsConfigured, setAppointmentsConfigured] = useState<boolean>(false)

  // Modal (solo Agente)
  const [trainingActive, setTrainingActive] = useState<boolean>(false)
  const [initialTrainingPanel, setInitialTrainingPanel] = useState<'agente' | null>(null)

  const [loading, setLoading] = useState<boolean>(true)

    // Modo de sección WhatsApp (OAuth vs Activar número)
    const [whatsMode, setWhatsMode] = useState<'oauth' | 'activar'>('oauth')
    const [whatsMenuOpen, setWhatsMenuOpen] = useState(false)
  

  async function refreshAll(): Promise<void> {
    try {
      const { data } = await axios.get<BackendBusinessConfig | Record<string, never>>(
        `${API_URL}/api/config`,
        { headers: getAuthHeaders() }
      )

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
    void refreshAll()
  }, [])

  // ============= Reinicio con SweetAlert (confirm + loader) =============
  const reiniciarEntrenamiento = async (): Promise<void> => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Reiniciar entrenamiento?',
      html:
        '<div class="text-slate-300 text-sm">Se eliminará la configuración actual del negocio y se limpiará la agenda (estética, horarios, staff, procedimientos y excepciones).</div>',
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

    if (!isConfirmed) return

    // Abre loader NO bloqueante (sin await)
    Swal.fire({
      title: 'Reiniciando…',
      html: '<div class="text-slate-300 text-sm">Aplicando cambios y limpiando datos…</div>',
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

    // Helper de requests con tipado y timeout
    const req = <T = unknown>(
      method: 'get' | 'post' | 'delete',
      url: string,
      data?: unknown,
      params?: Record<string, unknown>
    ) =>
      axios.request<T>({
        method,
        url: `${API_URL}${url}`,
        data,
        params: { t: Date.now(), ...(params || {}) },
        headers: getAuthHeaders(),
        timeout: 15000,
        validateStatus: (s) => s >= 200 && s < 500,
      })

    try {
      // 1) PURGE total de Estética (si existe)
      let purged = false
      try {
        const r = await req('delete', '/api/estetica/purge')
        purged = r.status >= 200 && r.status < 300
      } catch {
        purged = false
      }

      // 2) Fallbacks
      if (!purged) {
        let wiped = false
        try {
          const r = await req('delete', '/api/estetica/config', null, { purgeHours: 1 })
          wiped = r.status >= 200 && r.status < 300
        } catch {
          wiped = false
        }
        if (!wiped) {
          try {
            await req('post', '/api/estetica/config/reset')
          } catch {
            /* ignore */
          }
        }
      }

      // 3) Reset del agente (catálogo)
      try {
        await req('post', '/api/config/reset', null, { withCatalog: true })
      } catch {
        /* ignore */
      }

      // 4) Estado local y recarga
      setConfigGuardada(null)
      setForm(DEFAULTS)
      setAgentConfigured(false)
      setAppointmentsConfigured(false)
      setInitialTrainingPanel(null)
      setTrainingActive(false)
      await refreshAll()

      Swal.close()
      await Swal.fire({
        title: 'Listo',
        text: 'Reinicio completado.',
        icon: 'success',
        confirmButtonText: 'OK',
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
      Swal.close()
      await Swal.fire({
        title: 'Error',
        text: 'No fue posible reiniciar. Intenta nuevamente.',
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
    }
  }

  // Abrir entrenamiento:
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

        {/* Cards (trigger) */}
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

        {/* Acciones */}
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
                onClick={() => void reiniciarEntrenamiento()}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
              >
                <RotateCw className="w-4 h-4" />
                Reiniciar entrenamiento
              </button>
            </div>
          </div>
        )}

        {/* Modal (solo AGENTE) */}
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

                {/* ⬇️ Sección de configuración de WhatsApp con dropdown premium */}
                <section className="mt-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/40">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Conexión de tu número de WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Solicita la asistencia para la integración de tu número de WhatsApp y elige cómo conectarlo.
              </p>
            </div>
          </div>

                    {/* Botón para solicitar asistencia vía WhatsApp */}
                    <a
            href="https://wa.link/6ir48v"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow border border-emerald-500/40 transition"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            Solicitar asistencia por WhatsApp
          </a>


          {/* Dropdown modo dark premium */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setWhatsMenuOpen((open) => !open)}
                className="inline-flex items-center justify-between gap-2 w-64 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </span>
                  {whatsMode === 'oauth'
                    ? 'Conectar WhatsApp por OAuth'
                    : 'Activar número manualmente (WABA ID)'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    whatsMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {whatsMenuOpen && (
                <div className="absolute z-20 mt-2 w-64 origin-top-right rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-sm">
                  <div className="py-1 text-sm text-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsMode('oauth')
                        setWhatsMenuOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-slate-800/80 ${
                        whatsMode === 'oauth' ? 'bg-slate-800/80 text-emerald-300' : ''
                      }`}
                    >
                      Conectar WhatsApp por OAuth
                      <p className="text-[11px] text-slate-400">
                        Flujo asistido, seleccionas negocio y número desde Meta.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsMode('activar')
                        setWhatsMenuOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-slate-800/80 border-t border-slate-800 ${
                        whatsMode === 'activar' ? 'bg-slate-800/80 text-emerald-300' : ''
                      }`}
                    >
                      Activar número por WABA ID
                      <p className="text-[11px] text-slate-400">
                        Usa el WABA ID, PIN y selecciona el número manualmente.
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Si necesitas ayuda en la integración, comparte esta pantalla y el estado actual con soporte
              para que te acompañemos paso a paso.
            </p>
          </div>

          {/* Contenido dinámico según la opción seleccionada */}
          <div className="mt-4">
            {whatsMode === 'oauth' ? (
              <WhatsappConfig />
            ) : (
              <ActivatePhoneCard />
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
