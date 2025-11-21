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
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"
import { useAuth } from "../context/AuthContext"
import Script from "next/script" // 👈 PASO 1: importar Script

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const OPEN_DASH_ROUTES = [
    "/dashboard/callback",
    "/dashboard/callback-manual",
    "/dashboard/wa-embedded",
  ]
  const isOpenRoute = OPEN_DASH_ROUTES.some((p) => pathname?.startsWith(p))
  const isChatRoute = pathname?.startsWith("/dashboard/chats")
  const isOrdersRoute = pathname?.startsWith("/dashboard/orders")
  const isAppointmentsRoute = pathname?.startsWith("/dashboard/appointments")

  useEffect(() => {
    if (!isAuthenticated && !isOpenRoute) router.replace("/")
  }, [isAuthenticated, isOpenRoute, router])

  if (!isAuthenticated && !isOpenRoute) return null

  if (isOpenRoute) {
    return <main className="min-h-screen bg-gray-900 text-zinc-100">{children}</main>
  }

  return (
    <>
      {/* PASO 1: Cargar SDK de Wompi en el navegador */}
      <Script
        src="https://cdn.wompi.co/v1/sdk.js"
        strategy="afterInteractive"
      />

      <div className="h-screen w-screen overflow-hidden bg-gray-900 text-zinc-100 grid grid-cols-[auto_1fr]">
        {/* Sidebar fijo */}
        <aside
          className={clsx(
            "h-full bg-slate-800 border-r border-slate-700 shadow-md z-40 transition-all duration-300 ease-in-out flex flex-col justify-between sticky top-0",
            sidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div
            className={clsx(
              "flex flex-col",
              sidebarOpen ? "p-4 gap-6 items-start" : "pt-6 gap-4 items-center"
            )}
          >
            {sidebarOpen && (
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                🚀 Mi Panel
              </h2>
            )}
            <nav
              className={clsx(
                "flex flex-col w-full",
                sidebarOpen ? "gap-4" : "gap-6 items-center"
              )}
            >
              <Link
                href="/"
                className={navCls(sidebarOpen)}
                title={!sidebarOpen ? "Inicio" : ""}
              >
                <Home className={icoCls(sidebarOpen)} />
                {sidebarOpen && <span>Inicio</span>}
              </Link>
              <Link
                href="/dashboard"
                className={navCls(sidebarOpen)}
                title={!sidebarOpen ? "Resumen" : ""}
              >
                <BrainCircuit className={icoCls(sidebarOpen)} />
                {sidebarOpen && <span>Resumen</span>}
              </Link>
              <Link
                href="/dashboard/chats"
                className={navCls(sidebarOpen)}
                title={!sidebarOpen ? "Conversaciones" : ""}
              >
                <MessageSquareText className={icoCls(sidebarOpen)} />
                {sidebarOpen && <span>Conversaciones</span>}
              </Link>

              {/* Citas */}
              <Link
                href="/dashboard/appointments"
                className={navCls(sidebarOpen)}
                title={!sidebarOpen ? "Citas" : ""}
              >
                <Calendar className={icoCls(sidebarOpen)} />
                {sidebarOpen && <span>Citas</span>}
              </Link>

              {/* Billing / Facturación */}
              <Link
                href="/dashboard/billing"
                className={navCls(sidebarOpen)}
                title={!sidebarOpen ? "Facturación" : ""}
              >
                <CreditCard className={icoCls(sidebarOpen)} />
                {sidebarOpen && <span>Facturación</span>}
              </Link>

              <Link
                href="/dashboard/settings"
                className={navCls(sidebarOpen)}
                title={!sidebarOpen ? "Configuración" : ""}
              >
                <Settings2 className={icoCls(sidebarOpen)} />
                {sidebarOpen && <span>Configuración</span>}
              </Link>
              <Link
                href="/dashboard/templates"
                className={navCls(sidebarOpen)}
                title={!sidebarOpen ? "Plantillas" : ""}
              >
                <FileText className={icoCls(sidebarOpen)} />
                {sidebarOpen && <span>Plantillas</span>}
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex justify-end p-2 border-t border-slate-700">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex justify-center items-center py-2 hover:bg-slate-700 rounded transition"
              title={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <main
          className={clsx(
            "h-full w-full transition-all duration-300",
            isChatRoute || isOrdersRoute || isAppointmentsRoute
              ? "overflow-hidden"
              : "overflow-y-auto scrollbar pr-1 hover:scrollbar-thumb-[#2A3942] scrollbar-thumb-rounded-full"
          )}
        >
          <div
            className={clsx(
              isChatRoute || isOrdersRoute || isAppointmentsRoute ? "h-full" : "p-6"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </>
  )
}

function navCls(open: boolean) {
  return clsx(
    "flex items-center rounded-md hover:bg-slate-700 transition-colors px-3 py-2 w-full",
    open ? "gap-3 justify-start text-sm" : "justify-center"
  )
}
function icoCls(open: boolean) {
  return clsx("transition-all", open ? "w-5 h-5" : "w-6 h-6")
}
