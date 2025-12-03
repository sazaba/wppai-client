'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation' 
import axios from 'axios'
import { 
  Search, ShieldAlert, CreditCard, Users, MessageSquare, 
  Calendar, MoreVertical, KeyRound, RefreshCw, 
  CheckCircle2, XCircle, AlertTriangle, ArrowUpRight
} from 'lucide-react'
import Swal from 'sweetalert2'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

// 🔒 CONFIGURACIÓN DE SEGURIDAD MAESTRA
const SUPER_ADMIN_EMAILS = [
    'tu_correo_real@gmail.com', 
    'administrador@gmail.com'
]

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Estilos Dark para SweetAlert
const DarkSwal = Swal.mixin({
  background: '#09090b',
  color: '#e4e4e7',
  iconColor: '#6366f1',
  customClass: {
    popup: 'rounded-2xl border border-white/10 shadow-2xl bg-zinc-900/95 backdrop-blur-xl',
    title: 'text-xl font-bold text-white',
    confirmButton: 'bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold',
    cancelButton: 'bg-zinc-700 text-white px-4 py-2 rounded-lg'
  }
})

type CompanyData = {
  id: number
  nombre: string
  plan: 'gratis' | 'basic' | 'pro'
  estado: 'activo' | 'inactivo' | 'suspendido'
  conversationsUsed: number
  monthlyConversationLimit: number
  totalConversations?: number
  createdAt: string
  adminUser?: {
    id: number
    email: string
  }
  subscription?: {
    status: string
    currentPeriodEnd: string
    planName?: string
  }
}

export default function SuperAdminPage() {
  const { token, usuario, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [loadingData, setLoadingData] = useState(false)
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [search, setSearch] = useState('')

  // 🔒 PROTECCIÓN DE RUTA (CLIENT SIDE)
  useEffect(() => {
    if (authLoading) return 

    // Si no hay usuario o el email no está en la lista blanca -> Echar fuera
    if (!usuario || !SUPER_ADMIN_EMAILS.includes(usuario.email)) {
      router.replace('/dashboard') 
    }
  }, [usuario, authLoading, router])

  // Cargar datos reales del backend
  const refreshData = async () => {
    if (!token) return
    setLoadingData(true)
    try {
      const { data } = await axios.get(`${API_URL}/api/superadmin/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCompanies(data)
    } catch (err) {
      console.error(err)
      DarkSwal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos de SuperAdmin.',
        iconColor: '#ef4444'
      })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    // Solo cargar datos si es el superadmin
    if (usuario && SUPER_ADMIN_EMAILS.includes(usuario.email)) {
        refreshData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, usuario])

  // Filtrado en tiempo real
  const filteredCompanies = useMemo(() => {
    const s = search.toLowerCase()
    return companies.filter(c => 
      c.nombre.toLowerCase().includes(s) ||
      c.adminUser?.email.toLowerCase().includes(s)
    )
  }, [companies, search])

  // 🛠️ Handler para resetear contraseña DIRECTAMENTE
  const handleResetPassword = async (company: CompanyData) => {
    if (!company.adminUser) {
      return DarkSwal.fire({ icon: 'warning', title: 'Sin Admin', text: 'Esta empresa no tiene usuario admin.' })
    }

    const { value: newPass } = await DarkSwal.fire({
      title: 'Cambio Directo de Contraseña',
      html: `
        <div class="text-left text-sm text-zinc-400 mb-4">
          Estás cambiando la contraseña maestra para: <br/>
          <strong class="text-white text-lg">${company.nombre}</strong>
          <div class="mt-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center gap-2 text-indigo-300 font-mono text-xs">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
             ${company.adminUser.email}
          </div>
        </div>
        <label class="block text-xs text-zinc-500 mb-1 text-left uppercase tracking-wide font-bold">Nueva Contraseña</label>
        <input 
            id="swal-input1" 
            type="text" 
            class="w-full bg-black border border-zinc-700 text-white text-center text-lg py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors font-mono" 
            placeholder="Ingresa nueva clave" 
            value="Wasaaa${new Date().getFullYear()}!" 
        />
        <p class="text-[10px] text-zinc-500 mt-2 text-right">El usuario podrá entrar con esta clave inmediatamente.</p>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar Nueva Clave',
      confirmButtonColor: '#ef4444', // Rojo para indicar acción administrativa fuerte
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return (document.getElementById('swal-input1') as HTMLInputElement).value
      }
    })

    if (newPass) {
      try {
        await axios.post(
            `${API_URL}/api/superadmin/reset-password`, 
            { userId: company.adminUser.id, newPassword: newPass },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Confirmación visual con la clave para copiarla
        DarkSwal.fire({
           title: '¡Contraseña Actualizada!', 
           html: `
             <p class="text-zinc-400 text-sm mb-2">Copia y envía esta clave al cliente:</p>
             <div class="bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono text-xl text-white select-all cursor-pointer">
                ${newPass}
             </div>
           `,
           icon: 'success'
        })
      } catch (e) {
        DarkSwal.fire('Error', 'No se pudo actualizar en la base de datos.', 'error')
      }
    }
  }

  // Render de Badges
  const renderPlanBadge = (plan: string) => {
    const styles: Record<string, string> = {
        gratis: "bg-zinc-800 text-zinc-400 border-zinc-700",
        basic: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        pro: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20"
    }
    return (
        <span className={clsx("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border", styles[plan] || styles.gratis)}>
            {plan}
        </span>
    )
  }

  // Métricas calculadas
  const totalRevenue = companies.reduce((acc, curr) => acc + (curr.plan === 'basic' ? 250000 : 0), 0)
  const totalMsgs = companies.reduce((acc, curr) => acc + (curr.totalConversations || 0), 0)

  // 🔒 Bloqueo de renderizado
  if (authLoading || !usuario || !SUPER_ADMIN_EMAILS.includes(usuario.email)) {
    return null 
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 relative overflow-hidden">
        
      {/* Luces de Fondo (Modo Dios: Rojo/Azul) */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 shadow-lg shadow-red-900/20">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Superadmin</h1>
                </div>
                <p className="text-zinc-400 text-sm">Panel de control maestro.</p>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/50 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="relative group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Buscar empresa..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-white pl-9 pr-4 py-2 w-48 sm:w-64 placeholder:text-zinc-600 focus:w-72 transition-all"
                    />
                </div>
                <button 
                    onClick={refreshData}
                    className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    title="Recargar datos"
                >
                    <RefreshCw className={clsx("w-4 h-4", loadingData && "animate-spin")} />
                </button>
            </div>
        </div>

        {/* KPIs Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
                 <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><Users className="w-6 h-6" /></div>
                 <div>
                     <p className="text-2xl font-bold text-white">{companies.length}</p>
                     <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Empresas</p>
                 </div>
             </div>
             <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
                 <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CreditCard className="w-6 h-6" /></div>
                 <div>
                     <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                     <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">MRR Estimado (COP)</p>
                 </div>
             </div>
             <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors">
                 <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"><MessageSquare className="w-6 h-6" /></div>
                 <div>
                     <p className="text-2xl font-bold text-white">{totalMsgs.toLocaleString()}</p>
                     <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Chats Totales</p>
                 </div>
             </div>
        </div>

        {/* Tabla de Empresas */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl min-h-[500px]">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900/50">
                            <th className="p-6">Empresa / Admin</th>
                            <th className="p-6">Estado & Plan</th>
                            <th className="p-6">Créditos (Mes)</th>
                            <th className="p-6">Suscripción</th>
                            <th className="p-6 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {loadingData && companies.length === 0 ? (
                             <tr><td colSpan={5} className="p-12 text-center text-zinc-500">Cargando datos...</td></tr>
                        ) : filteredCompanies.length === 0 ? (
                             <tr><td colSpan={5} className="p-12 text-center text-zinc-500">No se encontraron resultados.</td></tr>
                        ) : (
                            filteredCompanies.map((company) => {
                                const percent = Math.min(100, Math.round((company.conversationsUsed / company.monthlyConversationLimit) * 100))
                                const isLimitBroken = company.conversationsUsed >= company.monthlyConversationLimit
                                const isPastDue = company.subscription?.status === 'past_due'
                                const adminEmail = company.adminUser?.email || 'Sin admin'

                                return (
                                    <tr key={company.id} className="group hover:bg-white/[0.02] transition-colors">
                                        {/* Empresa */}
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-base mb-1">{company.nombre}</span>
                                                <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                                                    ID: {company.id}
                                                    <span className="w-1 h-1 bg-zinc-700 rounded-full mx-1" />
                                                    {new Date(company.createdAt).toLocaleDateString()}
                                                </span>
                                                <div className="mt-2 flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/5 px-2 py-1 rounded-lg w-fit border border-indigo-500/10 cursor-pointer hover:bg-indigo-500/10 transition-colors" title={adminEmail}>
                                                    <Users className="w-3 h-3" />
                                                    <span className="truncate max-w-[140px]">{adminEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Estado */}
                                        <td className="p-6 align-top">
                                            <div className="flex flex-col items-start gap-2">
                                                {renderPlanBadge(company.plan)}
                                                <span className={clsx(
                                                    "text-[10px] px-2 py-0.5 rounded-full font-semibold border uppercase flex items-center gap-1",
                                                    company.estado === 'activo' ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : 
                                                    company.estado === 'suspendido' ? "text-red-400 border-red-500/20 bg-red-500/5" : 
                                                    "text-zinc-400 border-zinc-700 bg-zinc-800"
                                                )}>
                                                    {company.estado === 'activo' && <CheckCircle2 className="w-3 h-3"/>}
                                                    {company.estado === 'suspendido' && <XCircle className="w-3 h-3"/>}
                                                    {company.estado}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Créditos */}
                                        <td className="p-6 align-top min-w-[180px]">
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-zinc-400">Uso mensual</span>
                                                <span className={clsx("font-mono font-bold", isLimitBroken ? "text-red-400" : "text-white")}>
                                                    {company.conversationsUsed} / {company.monthlyConversationLimit}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
                                                <div 
                                                    className={clsx(
                                                        "h-full rounded-full transition-all duration-500",
                                                        isLimitBroken ? "bg-red-500" : percent > 80 ? "bg-amber-500" : "bg-emerald-500"
                                                    )}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            {isLimitBroken && (
                                                <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1 animate-pulse">
                                                    <AlertTriangle className="w-3 h-3" /> Límite excedido
                                                </p>
                                            )}
                                            <p className="text-[10px] text-zinc-600 mt-2">
                                                Total Histórico: {company.totalConversations?.toLocaleString()}
                                            </p>
                                        </td>

                                        {/* Suscripción */}
                                        <td className="p-6 align-top">
                                            {company.subscription ? (
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={clsx("w-1.5 h-1.5 rounded-full", isPastDue ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
                                                        <span className={clsx("text-xs font-bold uppercase", isPastDue ? "text-red-400" : "text-emerald-400")}>
                                                            {company.subscription.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span className="text-zinc-300">
                                                            {new Date(company.subscription.currentPeriodEnd).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-600 italic border border-zinc-800 px-2 py-1 rounded-md">Sin suscripción</span>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td className="p-6 align-middle text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleResetPassword(company)}
                                                    className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/5 transition-colors group relative"
                                                    title="Cambiar Contraseña Maestra"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </button>
                                                
                                                <button 
                                                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-white/5 transition-colors"
                                                    title="Ver Detalles (Próximamente)"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  )
}