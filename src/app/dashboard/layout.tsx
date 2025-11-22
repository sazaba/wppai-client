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
import Script from "next/script" // 👈 SDK Wompi
import axios from "axios" // 👈 para billing status

/* ===================== helpers generales ===================== */

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

type BillingStatus = {
  subscription: {
    currentPeriodEnd: string
    // aquí puedes agregar otros campos si los necesitas
  } | null
}

/* ===================== Layout Dashboard ===================== */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)

  const OPEN_DASH_ROUTES = [
    "/dashboard/callback",
    "/dashboard/callback-manual",
    "/dashboard/wa-embedded",
  ]
  const isOpenRoute = OPEN_DASH_ROUTES.some((p) => pathname?.startsWith(p))
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

  if (!isAuthenticated && !isOpenRoute) return null

  if (isOpenRoute) {
    return <main className="min-h-screen bg-gray-900 text-zinc-100">{children}</main>
  }

  return (
    <>
      {/* SDK de Wompi */}
      <Script src="https://cdn.wompi.co/v1/sdk.js" strategy="afterInteractive" />

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
            {/* 🔔 Banner de membresía próxima a vencerse
                → Solo lo muestro en las vistas "normales" para no dañar el full-screen de chats/citas */}
            {!isChatRoute && !isOrdersRoute && !isAppointmentsRoute && (
              <ExpiryBanner status={billingStatus} />
            )}

            {children}
          </div>
        </main>
      </div>
    </>
  )
}

/* ===================== helpers UI sidebar ===================== */

function navCls(open: boolean) {
  return clsx(
    "flex items-center rounded-md hover:bg-slate-700 transition-colors px-3 py-2 w-full",
    open ? "gap-3 justify-start text-sm" : "justify-center"
  )
}
function icoCls(open: boolean) {
  return clsx("transition-all", open ? "w-5 h-5" : "w-6 h-6")
}

/* ===================== Banner de vencimiento ===================== */

const GRACE_DAYS = 2

type Subscription = {
  currentPeriodEnd: string
}

function useSubscriptionStatus(status: BillingStatus | null) {
  if (!status?.subscription?.currentPeriodEnd) {
    return { daysLeft: null as number | null, isNearExpiry: false, isInGrace: false }
  }

  const end = new Date(status.subscription.currentPeriodEnd).getTime()
  const now = Date.now()

  const diffMs = end - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const graceLimit = end + GRACE_DAYS * 24 * 60 * 60 * 1000
  const diffToGraceEndDays = Math.ceil(
    (graceLimit - now) / (1000 * 60 * 60 * 24)
  )

  const isInGrace = diffDays < 0 && diffToGraceEndDays >= 0
  const isNearExpiry = diffDays <= 3 && diffToGraceEndDays >= 0

  return {
    daysLeft: diffDays,
    isNearExpiry,
    isInGrace,
  }
}

function ExpiryBanner({ status }: { status: BillingStatus | null }) {
  const router = useRouter()
  const { daysLeft, isNearExpiry, isInGrace } = useSubscriptionStatus(status)

  if (!isNearExpiry || daysLeft === null) return null

  let label: string

  if (daysLeft > 0) {
    label = `Tu membresía vence en ${daysLeft} día${daysLeft === 1 ? "" : "s"}.`
  } else if (daysLeft === 0) {
    label = "Tu membresía vence hoy."
  } else if (isInGrace) {
    label = "Tu membresía está en periodo de gracia. Evita la suspensión realizando el pago."
  } else {
    label = "Tu membresía está vencida."
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-xs text-amber-100">
        <p className="font-semibold tracking-tight">
          Membresía próxima a vencerse
        </p>
        <p className="text-amber-200/90">{label}</p>
        <p className="text-[11px] text-amber-300/80 mt-1">
          Al renovar no pierdes los días restantes de tu periodo actual.
        </p>
      </div>
      <button
        onClick={() => router.push("/dashboard/billing")}
        className="text-xs px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium shadow-[0_8px_20px_rgba(16,185,129,0.35)] transition w-full sm:w-auto"
      >
        Renovar ahora
      </button>
    </div>
  )
}
