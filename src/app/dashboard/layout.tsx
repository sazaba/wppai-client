"use client"

import Link from "next/link"
import {
  BrainCircuit,
  MessageSquareText,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Calendar,
  CreditCard,
  LogOut
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"
import { useAuth } from "../context/AuthContext"
import Script from "next/script"
import axios from "axios"
import { motion } from "framer-motion"

// 👇 Importamos el componente y el tipo desde el archivo dedicado
import { ExpiryBanner, BillingStatus } from "../dashboard/ExpiryBanner"

/* ===================== Configuración ===================== */

const API_URL = process.env.NEXT_PUBLIC_API_URL as string

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

/* ===================== Layout Dashboard ===================== */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Guardar preferencia de sidebar en localStorage si quisieras, por ahora local state
  const [sidebarOpen, setSidebarOpen] = useState(true) 
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Estado del billing usando el tipo importado
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)

  const OPEN_DASH_ROUTES = [
    "/dashboard/callback",
    "/dashboard/callback-manual",
    "/dashboard/wa-embedded",
  ]
  const isOpenRoute = OPEN_DASH_ROUTES.some((p) => pathname?.startsWith(p))
  
  // Vistas "Full Screen" donde ocultamos el padding/banner del contenedor principal
  // (El banner se renderiza, pero quizás quieras manejarlo diferente en chats)
  const isChatRoute = pathname?.startsWith("/dashboard/chats")
  const isOrdersRoute = pathname?.startsWith("/dashboard/orders")
  const isAppointmentsRoute = pathname?.startsWith("/dashboard/appointments")

  // 🔐 Protección de rutas
  useEffect(() => {
    if (!isAuthenticated && !isOpenRoute) router.replace("/")
  }, [isAuthenticated, isOpenRoute, router])

  // 💳 Cargar estado de facturación para el banner
  useEffect(() => {
    if (!isAuthenticated || isOpenRoute) return

    const fetchStatus = async () => {
      try {
        const res = await axios.get<BillingStatus>(`${API_URL}/api/billing/status`, {
          headers: getAuthHeaders(),
        })
        setBillingStatus(res.data)
      } catch (err) {
        console.error("Error cargando billing status", err)
      }
    }

    fetchStatus()
  }, [isAuthenticated, isOpenRoute])

  // Definición de rutas para el menú (Para renderizar con map y detectar activo)
  const menuItems = useMemo(() => [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/dashboard", icon: BrainCircuit, label: "Resumen" },
    { href: "/dashboard/chats", icon: MessageSquareText, label: "Conversaciones" },
    { href: "/dashboard/appointments", icon: Calendar, label: "Citas" },
    { href: "/dashboard/billing", icon: CreditCard, label: "Facturación" },
    { href: "/dashboard/templates", icon: FileText, label: "Plantillas" },
    { href: "/dashboard/settings", icon: Settings2, label: "Configuración" },
  ], [])

  if (!isAuthenticated && !isOpenRoute) return null

  if (isOpenRoute) {
    return <main className="min-h-screen bg-zinc-950 text-zinc-100">{children}</main>
  }

  return (
    <>
      <Script src="https://cdn.wompi.co/v1/sdk.js" strategy="afterInteractive" />

      {/* Contenedor Global - Grid Layout */}
      <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 grid grid-cols-[auto_1fr] relative">
        
        {/* 🔮 Fondo ambiental (Global para todo el dashboard) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
        </div>

        {/* === SIDEBAR GLASSMORPHISM === */}
        <aside
          className={clsx(
            "h-full relative z-40 flex flex-col justify-between transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
            "bg-zinc-900/60 backdrop-blur-xl border-r border-white/5 shadow-2xl",
            sidebarOpen ? "w-64" : "w-[88px]" // Un poco más ancho cerrado para que los iconos respiren
          )}
        >
          {/* Logo / Header Sidebar */}
          <div className={clsx("flex items-center h-20 border-b border-white/5", sidebarOpen ? "px-6" : "justify-center px-2")}>
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                {/* Logo Icon */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-indigo-500/20">
                    W
                </div>
                
                {/* Texto Logo (Animado) */}
                <div className={clsx("transition-opacity duration-300", sidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden")}>
                    <span className="font-bold text-lg tracking-tight text-white">Wasaaa</span>
                </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto scrollbar-hide">
             {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                
                return (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        title={!sidebarOpen ? item.label : ""}
                        className={clsx(
                            "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                            isActive 
                                ? "bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                        )}
                    >
                        {/* Barra lateral activa */}
                        {isActive && (
                            <motion.div 
                                layoutId="activeNav"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"
                            />
                        )}

                        <item.icon 
                            className={clsx(
                                "w-5 h-5 shrink-0 transition-colors",
                                isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                            )} 
                        />
                        
                        <span className={clsx(
                            "text-sm font-medium whitespace-nowrap transition-all duration-300",
                            sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                        )}>
                            {item.label}
                        </span>
                    </Link>
                )
             })}
          </nav>

          {/* Footer Sidebar / Toggle */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
            >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main
          className={clsx(
            "h-full w-full relative z-10 overflow-hidden flex flex-col",
            // Transición suave al cambiar tamaño
            "transition-all duration-500"
          )}
        >
          {/* 🔔 Banner Inteligente Importado (Sticky top) */}
          {!isChatRoute && !isOrdersRoute && !isAppointmentsRoute && billingStatus && (
             <div className="shrink-0">
                <ExpiryBanner status={billingStatus} />
             </div>
          )}

          {/* Área de contenido scrolleable */}
          <div
            className={clsx(
              "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent",
              // Si es chat, quitamos el padding para que ocupe todo. Si no, padding normal.
              isChatRoute || isOrdersRoute || isAppointmentsRoute ? "p-0" : "p-4 sm:p-8"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </>
  )
}