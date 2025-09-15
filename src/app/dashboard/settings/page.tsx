'use client'

import { useState, useEffect } from 'react'
import { Sparkles, RotateCw } from 'lucide-react'
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

// Defaults acotados (dejamos el resto por compatibilidad con backend)
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

function emptyHoursForReset() {
  const days: Array<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'> = ['mon','tue','wed','thu','fri','sat','sun']
  return days.map((d) => ({
    day: d,
    isOpen: false,
    start1: null,
    end1: null,
    start2: null,
    end2: null,
  }))
}

export default function SettingsPage() {
  const [form, setForm] = useState<ConfigForm>(DEFAULTS)
  const [configGuardada, setConfigGuardada] = useState<ConfigForm | null>(null)
  const [trainingActive, setTrainingActive] = useState(false)
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

  // 🔁 Reset total: borra BusinessConfig (y catálogo si existiera) + limpia Appointment Hours
  const reiniciarEntrenamiento = async () => {
    try {
      if (typeof window !== 'undefined') {
        const ok = window.confirm(
          '¿Reiniciar todo?\n\nSe eliminará la configuración actual del negocio y se limpiará la agenda (todos los días cerrados).'
        )
        if (!ok) return
      }

      // 1) Reset de config (y catálogo)
      await axios.post(
        `${API_URL}/api/config/reset`,
        null,
        { params: { withCatalog: true }, headers: getAuthHeaders() }
      )

      // 2) Reset de agenda: apagar + 7 días cerrados
      await axios.post(
        `${API_URL}/api/appointments/config`,
        {
          appointment: {
            enabled: false,
            vertical: 'none',
            timezone: 'America/Bogota',
            bufferMin: 10,
            policies: '',
            reminders: true,
          },
          hours: emptyHoursForReset(),
          provider: null,
        },
        { headers: getAuthHeaders() }
      )

      setConfigGuardada(null)
      setForm(DEFAULTS)
      setTrainingActive(true)
    } catch (e: any) {
      console.error('[reiniciarEntrenamiento] error:', e?.response?.data || e?.message || e)
      alert('Error al reiniciar configuración')
    }
  }

  if (loading) return <p className="p-8 text-slate-300">Cargando configuración...</p>

  return (
    <div className="h-full overflow-y-auto max-h-screen px-4 sm:px-6 py-8 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white text-center">Entrenamiento de tu IA</h1>

          {/* Tipo de negocio (lo dejamos por compatibilidad; no afecta tabs) */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Tipo de negocio</label>
            <select
              value={form.businessType}
              onChange={async (e) => {
                const newType = e.target.value as BusinessType
                const next = { ...form, businessType: newType }
                setForm(next)
                try {
                  const { data } = await axios.put(
                    `${API_URL}/api/config`,
                    next,
                    { headers: getAuthHeaders() }
                  )
                  const safe = materializeConfig(data as BackendBusinessConfig)
                  setConfigGuardada(safe)
                  setForm(safe)
                } catch (err) {
                  console.error('No se pudo actualizar businessType:', err)
                }
              }}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2"
            >
              <option value="servicios">Servicios</option>
              <option value="productos">Productos</option>
            </select>
          </div>

          {!configGuardada && (
            <button
              onClick={() => setTrainingActive(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Comenzar entrenamiento
            </button>
          )}
        </div>

        {/* Resumen breve */}
        {configGuardada && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl text-white space-y-4">
            <h2 className="text-xl font-bold">📦 Resumen de la configuración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm break-words">
              <div><strong>Nombre:</strong> {configGuardada.nombre}</div>
              <div><strong>Descripción:</strong> {configGuardada.descripcion}</div>
              <div className="md:col-span-2"><strong>FAQ:</strong> {configGuardada.faq}</div>
              <div><strong>Horarios:</strong> {configGuardada.horarios}</div>
              <div><strong>Tipo de negocio:</strong> {configGuardada.businessType}</div>
              {configGuardada.disclaimers && (
                <div className="md:col-span-2">
                  <strong>Disclaimers:</strong> {configGuardada.disclaimers}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setTrainingActive(true)}
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
            } catch {/* noop */}
          }}
        />

        {/* Config WhatsApp / Conexión */}
        <WhatsappConfig />
        <ActivatePhoneCard />
      </div>
    </div>
  )
}
