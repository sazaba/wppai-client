'use client'

import { useState, useEffect } from 'react'
import { Sparkles, RotateCw, Calendar, Bot } from 'lucide-react'
import axios from 'axios'
import ModalEntrenamiento from './components/training/ModalEntrenamiento'
import WhatsappConfig from './components/WhatsappConfig'

import type {
  ConfigForm,
  BusinessType,
  BackendBusinessConfig, // Partial<ConfigForm>
} from './components/training/types'
import ActivatePhoneCard from './ActivatePhoneCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL as string

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Defaults acotados (compat backend)
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
    pagoNotas: d.pagoNotas ?? '',
  }
}

export default function SettingsPage() {
  const [form, setForm] = useState<ConfigForm>(DEFAULTS)
  const [configGuardada, setConfigGuardada] = useState<ConfigForm | null>(null)
  const [trainingActive, setTrainingActive] = useState(false)
  const [initialTrainingPanel, setInitialTrainingPanel] = useState<'agente' | 'citas' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/config`, { headers: getAuthHeaders() })
        const safe = materializeConfig(data as BackendBusinessConfig)
        setConfigGuardada(Object.keys(data || {}).length ? safe : null)
        setForm(safe)
      } catch (err) {
        console.error('Error al cargar configuración existente:', err)
        setForm(DEFAULTS)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const reiniciarEntrenamiento = async () => {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar todo?\n\nSe eliminará la configuración actual del negocio y se limpiará la agenda.'
        )
        if (!ok) return
      }

      await axios.post(
        `${API_URL}/api/config/reset`,
        null,
        {
          params: { withCatalog: true },
          headers: getAuthHeaders()
        }
      )

      setConfigGuardada(null)
      setForm(DEFAULTS)
      setInitialTrainingPanel(null)
      setTrainingActive(true)
    } catch (e: any) {
      console.error('[reiniciarEntrenamiento] error:', e?.response?.data || e?.message || e)
      alert('Error al reiniciar configuración')
    }
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

  return (
    <div className="h-full overflow-y-auto max-h-screen px-4 sm:px-6 py-8 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Entrenamiento de tu IA</h1>
        </div>

        {/* Cards (reemplazan dropdown + botón) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            icon={<Calendar className="w-5 h-5 text-emerald-300" />}
            title="Configurar Citas"
            desc="Define horarios, políticas, recordatorios y servicios."
            onClick={() => {
              setInitialTrainingPanel('citas')
              setTrainingActive(true)
            }}
          />
          <Card
            icon={<Bot className="w-5 h-5 text-violet-300" />}
            title="Configurar Agente"
            desc="Define el modo, especialidad y prompts del agente."
            onClick={() => {
              setInitialTrainingPanel('agente')
              setTrainingActive(true)
            }}
          />
        </div>

        {configGuardada && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl text-white space-y-4">
            <h2 className="text-xl font-bold">⚙️ Acciones de configuración</h2>
            <p className="text-sm text-slate-300">
              Tu IA ya está configurada. Puedes actualizar los parámetros o reiniciar todo cuando lo necesites.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setInitialTrainingPanel(null)
                  setTrainingActive(true)
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
              >
                <Sparkles className="w-4 h-4" />
                Actualizar entrenamiento
              </button>

              <button
                onClick={reiniciarEntrenamiento}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow"
              >
                <RotateCw className="w-4 h-4" />
                Reiniciar todo
              </button>
            </div>
          </div>
        )}

        {/* Modal de entrenamiento */}
        <ModalEntrenamiento
  trainingActive={trainingActive}
  initialConfig={form}
  onClose={async () => {
    setTrainingActive(false)
    try {
      const { data } = await axios.get(`${API_URL}/api/config`, { headers: getAuthHeaders() })
      const safe = materializeConfig(data as BackendBusinessConfig)
      setConfigGuardada(Object.keys(data || {}).length ? safe : null)
      setForm(safe)
    } catch {
      /* noop */
    }
  }}
/>


        <WhatsappConfig />
        <ActivatePhoneCard />
      </div>
    </div>
  )
}
