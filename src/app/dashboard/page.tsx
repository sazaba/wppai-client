'use client'

import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  MessageSquare,
  CalendarDays,
  Activity,
  Zap,
  CreditCard,
  AlertTriangle,
  TrendingUp, // Icono para mostrar crecimiento
  CheckCircle2
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts'
import clsx from 'clsx'

// ⬇️ BASE del backend
const API = process.env.NEXT_PUBLIC_API_URL || ''

// --- Tipos de Respuesta ---

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

type SummaryResponse = {
  series: {
    messages7d: { day: string; count: number }[]
    conversationsByStatus: { status: string; count: number }[]
  }
  health: {
    whatsapp: { ok: boolean }
  }
}

// Fetcher genérico con credenciales
const fetcher = async (url: string) => {
  const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1")
  const token = localStorage.getItem('token')
  
  const res = await fetch(cleanUrl, { 
    headers: token ? { Authorization: `Bearer ${token}` } : {} 
  })
  
  if (!res.ok) throw new Error('Fetch error')
  return res.json()
}

export default function DashboardPage() {
  const { empresa, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // 🔐 Protección de ruta
  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login')
  }, [loading, isAuthenticated, router])

  const empresaId = empresa?.id
  
  // ===========================================================================
  // 📡 DATA FETCHING (Estrategia Multi-Endpoint)
  // ===========================================================================

  // 1. Estado de Facturación
  const { data: billingData, isLoading: loadBilling } = useSWR<BillingResponse>(
    isAuthenticated ? `${API}/api/billing/status` : null,
    fetcher
  )

  // 2. Gráficos Históricos
  const { data: summaryData, isLoading: loadSummary } = useSWR<SummaryResponse>(
    isAuthenticated && empresaId ? `${API}/api/dashboard/summary?empresaId=${empresaId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // 3. Chats Activos
  const { data: chatsData, isLoading: loadChats } = useSWR<any[]>(
    isAuthenticated ? `${API}/api/chats` : null,
    fetcher,
    { refreshInterval: 10000 }
  )

  // 4. Citas del MES ACTUAL (Corrección solicitada)
  // Calculamos inicio y fin del mes corriente
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  const appointmentsQuery = isAuthenticated && empresaId 
    ? `${API}/api/appointments?empresaId=${empresaId}&from=${monthStart.toISOString()}&to=${monthEnd.toISOString()}`
    : null

  const { data: appointmentsData, isLoading: loadAppts } = useSWR<any[]>(
    appointmentsQuery,
    fetcher,
    { refreshInterval: 30000 }
  )

  // ===========================================================================
  // 🧮 CÁLCULOS Y LÓGICA
  // ===========================================================================

  const isLoading = loading || loadBilling || loadSummary || loadChats || loadAppts

  // --- Billing Logic ---
  const used = billingData?.usage?.used || 0
  const limit = billingData?.usage?.limit || 300
  const remaining = Math.max(0, limit - used)
  const percent = Math.min(100, Math.round((used / limit) * 100))
  const isLimitNear = percent >= 80
  const planName = billingData?.empresaPlan || 'gratis'

  // --- Operations Logic ---
  const activeChatsCount = useMemo(() => {
    if (!Array.isArray(chatsData)) return 0
    return chatsData.filter(c => c.estado !== 'cerrado').length
  }, [chatsData])

  // Contamos total de citas en el mes (confirmadas o pendientes)
  const monthApptsCount = useMemo(() => {
    if (!Array.isArray(appointmentsData)) return 0
    return appointmentsData.length
  }, [appointmentsData])

  // --- Charts Logic ---
  const seriesMensajes = summaryData?.series.messages7d ?? []
  const estadosBar = summaryData?.series.conversationsByStatus?.map(s => ({ name: s.status.replace('_', ' '), count: s.count })) ?? []
  
  // Colores de gráficos
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

  // Skeleton Loader
  if (isLoading) return <SkeletonDashboard />
  if (!isAuthenticated) return null

  // UI Components Helpers
  const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-8 space-y-8 relative overflow-hidden">
      
      {/* Luces Ambientales */}
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
            <p className="text-zinc-400 mt-2 text-base">
              Resumen de rendimiento y consumo en tiempo real.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/chats" className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Ir a Chats
            </Link>
            <Link href="/dashboard/appointments" className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors border border-zinc-700 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Calendario
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Grid Principal (Billing + Operativo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Tarjeta de Plan */}
        <Card className="flex flex-col justify-between border-indigo-500/30 bg-indigo-900/10">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300">
                    <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg">
                    Activo
                </span>
            </div>
            <div>
                <p className="text-indigo-200/70 text-sm font-medium">Tu Plan</p>
                <p className="text-white text-2xl font-bold tracking-tight mt-1 capitalize">
                    {planName === 'basic' ? 'Premium' : planName}
                </p>
                <Link href="/dashboard/billing" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block underline">
                    Administrar suscripción →
                </Link>
            </div>
        </Card>

        {/* 2. Tarjeta de Créditos */}
        <Card className="flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${isLimitNear ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    <Zap className="w-6 h-6" />
                </div>
                {isLimitNear && <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />}
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-zinc-400 text-sm font-medium">Créditos IA Restantes</p>
                    <p className="text-white font-bold text-xl">{remaining}</p>
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

        {/* 3. Chats Activos (En Vivo) */}
        <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <Activity className="w-3 h-3" /> En vivo
                </div>
            </div>
            <div>
                <p className="text-zinc-400 text-sm font-medium">Chats Abiertos</p>
                <p className="text-white text-3xl font-bold tracking-tight mt-1">
                    {activeChatsCount}
                </p>
            </div>
        </Card>

        {/* 4. Citas del Mes (KPI Corregido) */}
        <Card className="flex flex-col justify-between border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                    <CalendarDays className="w-6 h-6" />
                </div>
                <div className="text-xs font-medium text-purple-400 flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3" /> Mes Actual
                </div>
            </div>
            <div>
                <p className="text-zinc-400 text-sm font-medium">Citas Agendadas</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-white text-3xl font-bold tracking-tight mt-1">
                        {monthApptsCount}
                    </p>
                    {/* Indicador visual sutil */}
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Este mes</span>
                </div>
            </div>
        </Card>
      </div>

      {/* Gráficos de Analítica */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Gráfico: Volumen de Mensajes */}
        <Card className="min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Tráfico de Mensajes
                </h3>
                <p className="text-zinc-500 text-sm">Últimos 7 días</p>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
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

        {/* Gráfico: Funnel de Estados */}
        <Card className="min-h-[350px]">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-1">Conversaciones por Estado</h3>
            <p className="text-zinc-500 text-sm">Distribución actual de tus clientes</p>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={estadosBar}
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                barCategoryGap="30%"
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
        {[...Array(2)].map((_, i) => <div key={i} className="h-80 rounded-3xl bg-zinc-900/50 border border-white/5" />)}
      </div>
    </div>
  )
}