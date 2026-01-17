'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  RotateCw, Calendar, Bot, MessageCircle, ChevronDown, Settings, 
  ExternalLink, Sparkles, CheckCircle2, XCircle, ShoppingBag // 1. Icono nuevo
} from 'lucide-react'
import axios from 'axios'
import Swal from 'sweetalert2'
import clsx from 'clsx'

import ModalEntrenamiento from './components/training/ModalEntrenamiento'
import WhatsappConfig from './components/WhatsappConfig'
import ActivatePhoneCard from './ActivatePhoneCard'

import type { ConfigForm, BusinessType, BackendBusinessConfig } from './components/training/types'

// Servicios
import { getApptConfig, getAppointmentHours } from '@/services/estetica.service'
import { getEcommerceConfig } from '@/services/ecommerce.service' // 2. Importamos servicio

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

/* ================= Defaults ================= */
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

// 3. Helper para detectar Ecommerce
async function fetchEcommerceConfigured(): Promise<boolean> {
  try {
    const cfg = await getEcommerceConfig()
    return !!cfg?.isActive
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
  // 4. Estado local para ecommerce
  const [ecommerceConfigured, setEcommerceConfigured] = useState<boolean>(false)

  // Modal
  const [trainingActive, setTrainingActive] = useState<boolean>(false)
  // 5. Tipo actualizado para panel inicial
  const [initialTrainingPanel, setInitialTrainingPanel] = useState<'agente' | 'ecommerce' | null>(null)

  const [loading, setLoading] = useState<boolean>(true)
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
      
      // Detección paralela de ambos módulos
      const [apptOk, ecomOk] = await Promise.all([
        fetchAppointmentsConfigured(),
        fetchEcommerceConfigured()
      ])
      
      setAppointmentsConfigured(apptOk)
      setEcommerceConfigured(ecomOk)

    } catch (err) {
      console.error('Error al cargar configuración existente:', err)
      setForm(DEFAULTS)
      setConfigGuardada(null)
      setAgentConfigured(false)
      setAppointmentsConfigured(false)
      setEcommerceConfigured(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshAll()
  }, [])

  // ============= Reinicio =============
  const reiniciarEntrenamiento = async (): Promise<void> => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Reiniciar todo?',
      html: '<div class="text-slate-300 text-sm">Se borrará la configuración de Agente, Estética y Tienda Virtual.</div>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar',
      background: '#09090b',
      color: '#e4e4e7',
      iconColor: '#f59e0b',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
    })

    if (!isConfirmed) return

    Swal.fire({
      title: 'Reiniciando…',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      background: '#09090b',
      color: '#e4e4e7',
    })

    try {
        // Reset calls...
        try { await axios.delete(`${API_URL}/api/estetica/config`, { params: { purgeHours: 1 }, headers: getAuthHeaders() }) } catch {}
        try { await axios.post(`${API_URL}/api/estetica/config/reset`, null, { headers: getAuthHeaders() }) } catch {}
        try { await axios.post(`${API_URL}/api/config/reset`, null, { params: { withCatalog: true }, headers: getAuthHeaders() }) } catch {}
        // Reset Ecommerce (Desactivar)
        try { await axios.post(`${API_URL}/api/ecommerce/config`, { isActive: false }, { headers: getAuthHeaders() }) } catch {}

        setConfigGuardada(null)
        setForm(DEFAULTS)
        setAgentConfigured(false)
        setAppointmentsConfigured(false)
        setEcommerceConfigured(false)
        setInitialTrainingPanel(null)
        setTrainingActive(false)
        await refreshAll()

        Swal.close()
        await Swal.fire({ title: 'Listo', icon: 'success', background: '#09090b', color: '#fff' })
    } catch (e) {
        Swal.close()
        Swal.fire({ title: 'Error', text: 'Intenta nuevamente.', icon: 'error', background: '#09090b', color: '#fff' })
    }
  }

  // 6. Función de abrir actualizada
  const openTraining = (panel: 'estetica' | 'agente' | 'ecommerce' | null) => {
    if (panel === 'estetica') {
      router.push('/dashboard/settings/estetica')
      return
    }
    // Para ecommerce y agente usamos el modal con el panel correcto
    setInitialTrainingPanel(panel === 'agente' || panel === 'ecommerce' ? panel : null)
    setTrainingActive(true)
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-zinc-950 p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="h-12 w-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                <p className="text-zinc-500 text-sm font-medium">Cargando...</p>
            </div>
        </div>
    )
  }

  const Card = ({ icon, title, desc, onClick, colorClass }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden rounded-[2rem] border p-6 text-left transition-all duration-300",
        "border-white/10 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="flex items-start gap-4 relative z-10">
        <div className={clsx("p-3 rounded-2xl shrink-0 border transition-transform group-hover:scale-110 duration-300", colorClass)}>
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors relative z-10 pl-[60px]">
         Configurar <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
      </div>
    </button>
  )

  const hideTopCards = agentConfigured || appointmentsConfigured || ecommerceConfigured
  const showActions = agentConfigured || appointmentsConfigured || ecommerceConfigured

  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-8 py-10 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent relative">
      
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                <Settings className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Configuración & IA</h1>
                <p className="text-zinc-400 text-sm mt-1">Gestiona el comportamiento de tu asistente y conexiones.</p>
            </div>
        </div>

        {/* Cards Principales (Selector inicial) */}
        {!hideTopCards && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Estética */}
            <Card
              icon={<Calendar className="w-6 h-6" />}
              title="Clínica / Estética"
              desc="Agenda citas, gestiona doctores, servicios y recordatorios."
              onClick={() => openTraining('estetica')}
              colorClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            />
            {/* 2. E-commerce (NUEVA CARD) */}
            <Card
              icon={<ShoppingBag className="w-6 h-6" />}
              title="Configurar Tienda"
              desc="Catálogo de productos, carrito de compras, envíos y pagos."
              onClick={() => openTraining('ecommerce')}
              colorClass="bg-pink-500/10 text-pink-400 border-pink-500/20"
            />
            {/* 3. Agente */}
            <Card
              icon={<Bot className="w-6 h-6" />}
              title="Configurar Agente"
              desc="Asistente personalizado con tus propias instrucciones."
              onClick={() => openTraining('agente')}
              colorClass="bg-violet-500/10 text-violet-400 border-violet-500/20"
            />
          </div>
        )}

        {/* Panel de Acciones (Estado activo) */}
        {showActions && (
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Estado del Asistente
                 </h2>
                 <p className="text-sm text-zinc-400 mt-1">Tu configuración actual está activa.</p>
              </div>
              
              <div className="flex gap-3">
                {/* Badge Agente */}
                <span className={clsx("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", agentConfigured ? "bg-violet-500/10 text-violet-400 border-violet-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700")}>
                  {agentConfigured ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Agente
                </span>
                {/* Badge Estética */}
                <span className={clsx("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", appointmentsConfigured ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700")}>
                   {appointmentsConfigured ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Estética
                </span>
                {/* Badge Tienda (NUEVO) */}
                <span className={clsx("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", ecommerceConfigured ? "bg-pink-500/10 text-pink-400 border-pink-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700")}>
                   {ecommerceConfigured ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} Tienda
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
              {appointmentsConfigured && (
                <button onClick={() => openTraining('estetica')} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white px-5 py-2.5 rounded-xl shadow transition-all text-sm font-medium">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Editar Estética
                </button>
              )}
              {/* Botón Editar Tienda (NUEVO) */}
              {ecommerceConfigured && (
                <button onClick={() => openTraining('ecommerce')} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white px-5 py-2.5 rounded-xl shadow transition-all text-sm font-medium">
                  <ShoppingBag className="w-4 h-4 text-pink-400" /> Editar Tienda
                </button>
              )}
              {agentConfigured && (
                <button onClick={() => openTraining('agente')} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white px-5 py-2.5 rounded-xl shadow transition-all text-sm font-medium">
                  <Bot className="w-4 h-4 text-violet-400" /> Editar Agente
                </button>
              )}

              <button onClick={() => void reiniciarEntrenamiento()} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-5 py-2.5 rounded-xl shadow transition-all text-sm font-medium ml-auto">
                <RotateCw className="w-4 h-4" /> Reiniciar Todo
              </button>
            </div>
          </div>
        )}

        {/* Modal Único */}
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

        {/* SECCIÓN WHATSAPP (Igual) */}
        <section className="mt-16 space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="p-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 shadow-lg shadow-green-500/10">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Conexión de WhatsApp</h2>
                    <p className="text-sm text-zinc-400">Vincula tu número oficial para activar el bot.</p>
                </div>
            </div>

            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"><ExternalLink className="w-5 h-5" /></div>
                    <p className="text-sm text-zinc-300 max-w-md">¿Necesitas ayuda con la integración? Contacta a nuestro soporte técnico especializado.</p>
                </div>
                <a href="https://wa.link/6ir48v" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-zinc-900 text-sm font-bold shadow-lg shadow-green-500/20 transition-all transform hover:scale-[1.02]">
                    <MessageCircle className="w-4 h-4" /> Solicitar Asistencia
                </a>
            </div>

            <div className="flex flex-col gap-6">
                <div className="relative inline-block text-left w-full sm:w-auto">
                    <button type="button" onClick={() => setWhatsMenuOpen((o) => !o)} className="inline-flex items-center justify-between gap-3 w-full sm:w-80 rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-zinc-800 transition-all">
                        <span className="flex items-center gap-3">
                            <span className={clsx("inline-flex h-6 w-6 items-center justify-center rounded-full", whatsMode === 'oauth' ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400")}>
                                {whatsMode === 'oauth' ? <Bot className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                            </span>
                            {whatsMode === 'oauth' ? 'Conectar WhatsApp por OAuth' : 'Activar número manualmente'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${whatsMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {whatsMenuOpen && (
                        <div className="absolute z-20 mt-2 w-full sm:w-80 rounded-xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl p-1 animate-in fade-in slide-in-from-top-2">
                            <button onClick={() => { setWhatsMode('oauth'); setWhatsMenuOpen(false) }} className={clsx("w-full px-4 py-3 text-left rounded-lg transition-colors group", whatsMode === 'oauth' ? "bg-indigo-500/10" : "hover:bg-white/5")}>
                                <div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-semibold text-white">Conectar por OAuth</span>{whatsMode === 'oauth' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}</div>
                                <p className="text-[11px] text-zinc-500">Flujo automático con Facebook Login.</p>
                            </button>
                            <button onClick={() => { setWhatsMode('activar'); setWhatsMenuOpen(false) }} className={clsx("w-full px-4 py-3 text-left rounded-lg transition-colors group mt-1", whatsMode === 'activar' ? "bg-emerald-500/10" : "hover:bg-white/5")}>
                                <div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-semibold text-white">Activar manualmente</span>{whatsMode === 'activar' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}</div>
                                <p className="text-[11px] text-zinc-500">Usar WABA ID y PIN de 2FA.</p>
                            </button>
                        </div>
                    )}
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {whatsMode === 'oauth' ? <WhatsappConfig /> : <ActivatePhoneCard />}
                </div>
            </div>
        </section>

      </div>
    </div>
  )
}