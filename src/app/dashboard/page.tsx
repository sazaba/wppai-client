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
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

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

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Fetch error')
  return r.json()
})

export default function DashboardPage() {
  const { empresa, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login')
  }, [loading, isAuthenticated, router])

  const empresaId = empresa?.id
  const { data, isLoading, error } = useSWR<SummaryResponse>(
    isAuthenticated && empresaId ? `/api/dashboard/summary?empresaId=${empresaId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  if (loading || isLoading) return <SkeletonDashboard />
  if (!isAuthenticated) return null
  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0f14] p-6 text-red-300">
        Error cargando el panel. Verifica que el backend esté sirviendo <code>/api/dashboard/summary</code>.
      </div>
    )
  }

  const k = data?.kpis ?? {
    chatsActivos: 0, respIaSegsAvg: null, citasHoy: 0, ingresosMes: 0,
    convAgendadoPct: 0, noShowMesPct: 0, escaladosAgentePct: 0, agentesConectados: 0
  }
  const seriesMensajes = data?.series.messages7d ?? []
  const estadosBar = data?.series.conversationsByStatus?.map(s => ({ name: s.status, count: s.count })) ?? []
  const topProcedures = data?.series.topProcedures ?? []

  const PIE_COLORS = ['#818CF8','#22D3EE','#C084FC','#34D399','#F472B6']

  const Badge = ({ ok, label }: { ok: boolean, label: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ok ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30'}`}>
      {label}
    </span>
  )

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur">
      {children}
    </div>
  )

  const Kpi = ({
    icon: Icon,
    label,
    value,
    suffix,
  }: { icon: any, label: string, value: string | number, suffix?: string }) => (
    <Card>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-800/60 ring-1 ring-slate-700/60">
          <Icon className="w-5 h-5 text-slate-200" />
        </div>
        <div className="flex-1">
          <p className="text-slate-400 text-xs">{label}</p>
          <p className="text-slate-100 text-2xl font-semibold tabular-nums">
            {value}{suffix ? <span className="text-slate-400 text-base ml-1">{suffix}</span> : null}
          </p>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-[#0b0f14] p-4 sm:p-6 space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-teal-600/20"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white">
              ¡Hola {empresa?.nombre || 'Equipo'}! 👋
            </h1>
            <p className="text-slate-300 mt-1">
              Resumen de actividad y salud del sistema.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge ok={!!data?.health?.whatsapp?.ok} label={`WhatsApp: ${data?.health?.whatsapp?.ok ? 'Conectado' : 'Falla'}`} />
              <Badge ok={(data?.health?.templates?.pending || 0) === 0} label={`Plantillas pendientes: ${data?.health?.templates?.pending ?? 0}`} />
              <Badge ok={(data?.health?.webhookErrors24h || 0) === 0} label={`Errores 24h: ${data?.health?.webhookErrors24h ?? 0}`} />
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <a href="/dashboard/chats" className="px-3 py-2 rounded-lg ring-1 ring-slate-700 text-slate-200 hover:bg-slate-800/60">Ver chats</a>
            <a href="/dashboard/schedule" className="px-3 py-2 rounded-lg ring-1 ring-slate-700 text-slate-200 hover:bg-slate-800/60">Calendario</a>
            <a href="/dashboard/templates" className="px-3 py-2 rounded-lg ring-1 ring-slate-700 text-slate-200 hover:bg-slate-800/60">Plantillas WA</a>
          </div>
        </div>
      </motion.div>

      {/* KPIs fila 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi icon={MessageSquare} label="Chats activos" value={k.chatsActivos ?? 0} />
        <Kpi icon={Clock} label="Resp. IA (prom)" value={k.respIaSegsAvg ?? '—'} suffix={k.respIaSegsAvg ? 's' : ''} />
        <Kpi icon={CalendarDays} label="Citas hoy" value={k.citasHoy ?? 0} />
        <Kpi
          icon={DollarSign}
          label="Ingresos mes"
          value={(k.ingresosMes ?? 0).toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 })}
        />
      </div>

      {/* KPIs fila 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi icon={CheckCircle2} label="Conversión a agendado" value={`${k.convAgendadoPct ?? 0}%`} />
        <Kpi icon={AlertTriangle} label="No-show (mes)" value={`${k.noShowMesPct ?? 0}%`} />
        <Kpi icon={Bot} label="Escalados a agente" value={`${k.escaladosAgentePct ?? 0}%`} />
        <Kpi icon={PhoneCall} label="Agentes conectados" value={k.agentesConectados ?? 0} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-200 font-semibold">Mensajes últimos 7 días</h3>
            <span className="text-slate-400 text-xs">
              Total: {seriesMensajes.reduce((a, b) => a + (b.count || 0), 0)}
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seriesMensajes}>
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="count" fill="#6366f1" fillOpacity={0.25} stroke="#818cf8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-200 font-semibold">Conversaciones por estado</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={estadosBar}>
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <div className="mb-3">
            <h3 className="text-slate-200 font-semibold">Top procedimientos (solicitados)</h3>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topProcedures} dataKey="count" nameKey="name" outerRadius={100} innerRadius={50}>
                  {topProcedures.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-3">
            <h3 className="text-slate-200 font-semibold">Incidencias (últimas 24h)</h3>
          </div>
          <div className="max-h-64 overflow-auto pr-2">
            {(data?.incidents || []).length === 0 ? (
              <p className="text-slate-400 text-sm">Sin incidencias recientes 🎉</p>
            ) : (
              <ul className="space-y-2">
                {data!.incidents.map((it, i) => (
                  <li key={i} className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                    <p className="text-slate-200 text-sm">{it.message}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(it.ts).toLocaleString()}
                    </p>
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
    <div className="min-h-screen bg-[#0b0f14] p-4 sm:p-6 space-y-6">
      <div className="h-28 rounded-2xl bg-slate-800/30 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-800/30 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="h-72 rounded-2xl bg-slate-800/30 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="h-72 rounded-2xl bg-slate-800/30 animate-pulse" />)}
      </div>
    </div>
  )
}
