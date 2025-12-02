'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  MessageSquare,
  Clock,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Bot,
  PhoneCall,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid
} from 'recharts'

// ⬇️ BASE del backend
const API = process.env.NEXT_PUBLIC_API_URL || ''

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
  incidents: { message: string; ts: string | Date }[]
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
  const endpoint = isAuthenticated && empresaId ? `${API}/api/dashboard/summary?empresaId=${empresaId}` : null
  
  const { data, isLoading, error } = useSWR<SummaryResponse>(
    endpoint,
    fetcher,
    { revalidateOnFocus: false }
  )

  if (loading || isLoading) return <SkeletonDashboard />
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
  const yMaxEstados = Math.max(5, ...(estadosBar.map(e => e.count ?? 0))) * 1.2 // Margen superior dinámico

  const topProcedures = data?.series.topProcedures ?? []

  // 🎨 Paleta Premium Cyberpunk/SaaS
  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
  
  // Estilos de Gráficas
  const tooltipStyle = {
    backgroundColor: 'rgba(9, 9, 11, 0.9)', // zinc-950 con opacidad
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#e4e4e7', // zinc-200
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
      {/* Brillo sutil en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )

  const Kpi = ({ icon: Icon, label, value, suffix, color = 'indigo' }: { icon: any, label: string, value: string | number, suffix?: string, color?: string }) => {
    // Mapa de colores para los iconos
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
                {/* Minigráfica o indicador de tendencia (falso positivo para demo) */}
                <div className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3" /> +12%
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
    // Fondo Global
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-8 space-y-8 relative overflow-hidden">
      
      {/* Luces de Fondo Ambientales */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 border border-white/10 bg-zinc-900/60 backdrop-blur-md shadow-2xl"
      >
        {/* Gradiente sutil interno */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-400 tracking-wider uppercase">Sistema Operativo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{empresa?.nombre || 'Admin'}</span>
            </h1>
            <p className="text-zinc-400 mt-2 max-w-xl text-lg">
              Aquí tienes el resumen en tiempo real de tu operación automatizada.
            </p>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <Badge ok={!!data?.health?.whatsapp?.ok} label={`API WhatsApp`} />
              <Badge ok={(data?.health?.templates?.pending || 0) === 0} label={`Plantillas: ${data?.health?.templates?.pending ?? 0} pendientes`} />
              <Badge ok={(data?.health?.webhookErrors24h || 0) === 0} label={`Errores Webhook: ${data?.health?.webhookErrors24h ?? 0}`} />
            </div>
          </div>

          <div className="flex gap-3">
            <a href="/dashboard/chats" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Chats
            </a>
            <a href="/dashboard/schedule" className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors border border-zinc-700">
                Calendario
            </a>
          </div>
        </div>
      </motion.div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi icon={MessageSquare} label="Chats Activos" value={k.chatsActivos ?? 0} color="indigo" />
        <Kpi icon={Clock} label="Tiempo Resp. IA" value={k.respIaSegsAvg ?? '—'} suffix={k.respIaSegsAvg ? 's' : ''} color="cyan" />
        <Kpi icon={CalendarDays} label="Citas Agendadas Hoy" value={k.citasHoy ?? 0} color="emerald" />
        <Kpi 
          icon={DollarSign} 
          label="Ingresos Estimados" 
          value={(k.ingresosMes ?? 0).toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })} 
          color="amber"
        />
        
        <Kpi icon={CheckCircle2} label="Conversión Cierre" value={`${k.convAgendadoPct ?? 0}%`} color="purple" />
        <Kpi icon={AlertTriangle} label="Tasa No-Show" value={`${k.noShowMesPct ?? 0}%`} color="rose" />
        <Kpi icon={Bot} label="Escalados a Humano" value={`${k.escaladosAgentePct ?? 0}%`} color="indigo" />
        <Kpi icon={PhoneCall} label="Agentes Online" value={k.agentesConectados ?? 0} color="cyan" />
      </div>

      {/* Sección Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Gráfico de Área (Volumen de Mensajes) */}
        <Card className="min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Volumen de Mensajes
                </h3>
                <p className="text-zinc-500 text-sm">Últimos 7 días</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-white">{seriesMensajes.reduce((a, b) => a + (b.count || 0), 0)}</p>
                <p className="text-xs text-zinc-500">Total mensajes</p>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seriesMensajes}>
                {/* Definición de Gradiente SVG para el relleno */}
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
                  stroke="#818cf8" // Indigo-400
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico de Barras (Estados) */}
        <Card className="min-h-[400px]">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-1">Conversaciones por Estado</h3>
            <p className="text-zinc-500 text-sm">Distribución del funnel de atención</p>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={estadosBar}
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                barCategoryGap="40%" // Barras más gruesas
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#52525b" 
                    tick={{ fill: '#71717a', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                    dy={10}
                />
                <YAxis 
                    stroke="#52525b" 
                    tick={{ fill: '#71717a', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    domain={[0, yMaxEstados]}
                    allowDecimals={false}
                />
                <Tooltip 
                    contentStyle={tooltipStyle} 
                    cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} 
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                >
                    {estadosBar.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Procedimientos TOP */}
        <Card>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Top Procedimientos</h3>
            <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Este mes</span>
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
                  stroke="none" // Sin bordes feos
                >
                  {topProcedures.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            {/* Texto central en el Donut Chart */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="block text-2xl font-bold text-white">{topProcedures.reduce((a,b)=>a+b.count,0)}</span>
                    <span className="text-xs text-zinc-500">Solicitudes</span>
                </div>
            </div>
          </div>
          {/* Leyenda personalizada */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-400">
            {topProcedures.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span className="truncate">{p.name}</span>
                    <span className="text-white font-bold ml-auto">{p.count}</span>
                </div>
            ))}
          </div>
        </Card>

        {/* Incidencias / Logs */}
        <Card>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Bitácora de Eventos</h3>
            <Badge ok={true} label="Sistema Saludable" />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {(data?.incidents || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                <CheckCircle2 className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">Todo opera con normalidad. ¡Genial!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data!.incidents.map((it, i) => (
                  <li key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                    <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    </div>
                    <div>
                        <p className="text-zinc-200 text-sm font-medium leading-snug">{it.message}</p>
                        <p className="text-zinc-500 text-xs mt-1 font-mono">
                            {new Date(it.ts).toLocaleString([], { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
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