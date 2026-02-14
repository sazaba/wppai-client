'use client'

import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { 
  Loader2, Calendar, RefreshCw, Users, 
  Clock, CheckCircle2, TrendingUp 
} from 'lucide-react'
import clsx from 'clsx'
import DemoTable from './DemoTable'

// Definimos la interfaz aquí o la importamos si la tienes centralizada
interface DemoBooking {
  id: number
  name: string
  email: string
  phone: string
  scheduledAt: string
  status: string 
  createdAt?: string
}

export default function DemosPage() {
  const [data, setData] = useState<DemoBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Función de carga de datos
  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/demo-booking`)
      console.log("DATOS RECIBIDOS:", res.data)
      setData(res.data)
    } catch (error) {
      console.error("Error cargando demos:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Carga inicial
  useEffect(() => {
    fetchData()
  }, [])

  // --- CÁLCULO DE MÉTRICAS (KPIs) ---
  const metrics = useMemo(() => {
    const total = data.length
    const pending = data.filter(d => d.status === 'pending').length
    const closed = data.filter(d => d.status === 'closed' || d.status === 'contacted').length
    // Tasa de cierre simple (Contactados/Cerrados sobre total)
    const rate = total > 0 ? Math.round((closed / total) * 100) : 0

    return { total, pending, closed, rate }
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium animate-pulse">Sincronizando agenda...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 relative overflow-hidden">
        
      {/* --- LUCES AMBIENTALES DE FONDO --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-lg shadow-indigo-900/20">
                        <Calendar className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Leads & Demos</h1>
                </div>
                <p className="text-zinc-400 text-sm pl-1">
                  Gestión de auditorías agendadas desde la Landing Page.
                </p>
            </div>

            {/* Botón de Recarga Manual */}
            <button 
                onClick={fetchData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-all active:scale-95 disabled:opacity-50"
            >
                <RefreshCw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
                <span className="text-xs font-bold uppercase tracking-wider">Actualizar</span>
            </button>
        </div>

        {/* --- KPIs (Métricas Rápidas) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {/* Card 1: Total */}
             <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors group">
                 <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                 </div>
                 <div>
                     <p className="text-2xl font-bold text-white">{metrics.total}</p>
                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Leads</p>
                 </div>
             </div>

             {/* Card 2: Pendientes */}
             <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors group">
                 <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                 </div>
                 <div>
                     <p className="text-2xl font-bold text-white">{metrics.pending}</p>
                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Por Gestionar</p>
                 </div>
             </div>

             {/* Card 3: Efectividad */}
             <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors group">
                 <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                 </div>
                 <div>
                     <p className="text-2xl font-bold text-white">{metrics.closed}</p>
                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Gestionados</p>
                 </div>
             </div>
        </div>

        {/* --- TABLA DE DATOS --- */}
        <DemoTable initialData={data} />
        
      </div>
    </div>
  )
}