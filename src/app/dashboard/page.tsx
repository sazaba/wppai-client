'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // 👈 Importante para navegación SPA
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  MessageSquare,
  CalendarDays,
  CheckCircle2,
  Bot,
  Activity,
  Zap,
  CreditCard,
  AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid
} from 'recharts'

// ⬇️ BASE del backend
const API = process.env.NEXT_PUBLIC_API_URL || ''

// Tipos de respuesta
type SummaryResponse = {
  kpis: {
    chatsActivos: number
    respIaSegsAvg: number | null
    citasHoy: number
    ingresosMes: number
    convAgendadoPct: number
    noShowMesPct: number
    escaladosAgentePct: number
    agentesConectados: number
  }
  series: {
    messages7d: { day: string; count: number }[]
    conversationsByStatus: { status: string; count: number }[]
    topProcedures: { id: number; name: string; count: number }[]
  }
  health: {
    whatsapp: { ok: boolean }
    templates: { pending: number }
    webhookErrors24h: number
  }
}

type BillingResponse = {
  empresaPlan: string
  usage: {
    used: number
    limit: number
  }
  subscription?: {
    status: string
    currentPeriodEnd: string
  }
}

const fetcher = async (url: string) => {
  const r = await fetch(url, { credentials: 'include' })
  if (!r.ok) throw new Error('Fetch error')
  return r.json()
}

export default function DashboardPage() {
  const { empresa, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login')
  }, [loading, isAuthenticated, router])

  const empresaId = empresa?.id
  
  // 1. Cargar Resumen Operativo
  const endpointSummary = isAuthenticated && empresaId ? `${API}/api/dashboard/summary?empresaId=${empresaId}` : null
  const { data, isLoading, error } = useSWR<SummaryResponse>(endpointSummary, fetcher, { revalidateOnFocus: false })

  // 2. Cargar Datos de Facturación (Para mostrar créditos y plan)
  const endpointBilling = isAuthenticated ? `${API}/api/billing/status` : null
  const { data: billingData, isLoading: loadingBilling } = useSWR<BillingResponse>(endpointBilling, fetcher)

  if (loading || isLoading || loadingBilling) return <SkeletonDashboard />
  if (!isAuthenticated) return null
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 flex items-center justify-center text-red-400 font-mono">
        Error cargando datos. Verifica la conexión con el backend.
      </div>
    )
  }

  const k = data?.kpis ?? {
    chatsActivos: 0, respIaSegsAvg: null, citasHoy: 0, ingresosMes: 0,
    convAgendadoPct: 0, noShowMesPct: 0, escaladosAgentePct: 0, agentesConectados: 0
  }
  
  const seriesMensajes = data?.series.messages7d ?? []
  const estadosBar = data?.series.conversationsByStatus?.map(s => ({ name: s.status, count: s.count })) ?? []
  const yMaxEstados = Math.max(5, ...(estadosBar.map(e => e.count ?? 0))) * 1.2

  const topProcedures = data?.series.topProcedures ?? []

  // Datos Billing
  const used = billingData?.usage?.used || 0
  const limit = billingData?.usage?.limit || 300
  const percent = Math.min(100, Math.round((used / limit) * 100))
  const isLimitNear = percent >= 80
  const planName = billingData?.empresaPlan || 'gratis'

  // Paleta
  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
  
  const tooltipStyle = {
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#e4e4e7',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    fontSize: '12px',
    padding: '8px 12px'
  }

  const Badge = ({ ok, label }: { ok: boolean, label: string }) => (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
      {label}
    </span>
  )

  const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )

  const Kpi = ({ icon: Icon, label, value, suffix, color = 'indigo' }: { icon: any, label: string, value: string | number, suffix?: string, color?: string }) => {
    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-500/10 text-indigo-400',
        emerald: 'bg-emerald-500/10 text-emerald-400',
        amber: 'bg-amber-500/10 text-amber-400',
        rose: 'bg-rose-500/10 text-rose-400',
        cyan: 'bg-cyan-500/10 text-cyan-400',
        purple: 'bg-purple-500/10 text-purple-400',
    }

    return (
        <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.indigo}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div>
                <p className="text-zinc-400 text-sm font-medium">{label}</p>
                <p className="text-white text-3xl font-bold tracking-tight mt-1">
                    {value}{suffix && <span className="text-zinc-500 text-lg ml-1 font-normal">{suffix}</span>}
                </p>
            </div>
        </Card>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-8 space-y-8 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 border border-white/10 bg-zinc-900/60 backdrop-blur-md shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-400 tracking-wider uppercase">Sistema Operativo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{empresa?.nombre || 'Admin'}</span>
            </h1>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge ok={!!data?.health?.whatsapp?.ok} label={`WhatsApp API`} />
              {isLimitNear && <Badge ok={false} label="Créditos Bajos" />}
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/chats" className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Chats
            </Link>
            <Link href="/dashboard/appointments" className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors border border-zinc-700 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Calendario
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs Principales + Billing Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Operativos */}
        <Kpi icon={MessageSquare} label="Chats Activos Hoy" value={k.chatsActivos ?? 0} color="indigo" />
        <Kpi icon={CalendarDays} label="Citas Agendadas Hoy" value={k.citasHoy ?? 0} color="emerald" />
        
        {/* Información de Plan (Estilo KPI) */}
        <Card className="flex flex-col justify-between border-indigo-500/30 bg-indigo-900/10">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300">
                    <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg">
                    {planName}
                </span>
            </div>
            <div>
                <p className="text-indigo-200/70 text-sm font-medium">Plan Actual</p>
                <p className="text-white text-xl font-bold tracking-tight mt-1 capitalize">
                    {planName === 'basic' ? 'Premium' : planName}
                </p>
            </div>
        </Card>

        {/* Información de Créditos (Barra de progreso) */}
        <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${isLimitNear ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    <Zap className="w-6 h-6" />
                </div>
                {isLimitNear && <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />}
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-zinc-400 text-sm font-medium">Créditos Restantes</p>
                    <p className="text-white font-bold">{limit - used}</p>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isLimitNear ? 'bg-amber-500' : 'bg-cyan-500'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <p className="text-xs text-zinc-500 mt-2 text-right">{used} / {limit} usados</p>
            </div>
        </Card>
      </div>

      {/* Fila 2: Métricas Secundarias (Opcionales pero útiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         <Kpi icon={CheckCircle2} label="Tasa de Cierre (Citas)" value={`${k.convAgendadoPct ?? 0}%`} color="purple" />
         <Kpi icon={Bot} label="Escalados a Humano" value={`${k.escaladosAgentePct ?? 0}%`} color="rose" />
      </div>

      {/* Sección Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Gráfico de Área (Volumen de Mensajes) */}
        <Card className="min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Tráfico de Mensajes
                </h3>
                <p className="text-zinc-500 text-sm">Última semana</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-white">{seriesMensajes.reduce((a, b) => a + (b.count || 0), 0)}</p>
                <p className="text-xs text-zinc-500">Total</p>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seriesMensajes}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                    dataKey="day" 
                    stroke="#52525b" 
                    tick={{ fill: '#71717a', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                />
                <YAxis 
                    stroke="#52525b" 
                    tick={{ fill: '#71717a', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#818cf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Procedimientos (Usuario dijo "si sirve dejala") */}
        {topProcedures.length > 0 && (
            <Card>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Intereses de Clientes</h3>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded">IA detectado</span>
            </div>
            <div className="h-[250px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={topProcedures}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={65}
                    paddingAngle={5}
                    stroke="none"
                    >
                    {topProcedures.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-white">{topProcedures.reduce((a,b)=>a+b.count,0)}</span>
                        <span className="text-xs text-zinc-500">Consultas</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                {topProcedures.slice(0,4).map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="truncate">{p.name}</span>
                        <span className="text-white font-bold ml-auto">{p.count}</span>
                    </div>
                ))}
            </div>
            </Card>
        )}
      </div>
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8 space-y-8 animate-pulse">
      <div className="h-40 rounded-[2rem] bg-zinc-900/50 border border-white/5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-3xl bg-zinc-900/50 border border-white/5" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-96 rounded-3xl bg-zinc-900/50 border border-white/5" />)}
      </div>
    </div>
  )
}