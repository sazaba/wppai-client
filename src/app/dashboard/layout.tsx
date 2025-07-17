'use client'

import Link from "next/link"
import {
  BrainCircuit,
  MessageSquareText,
  Settings2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import clsx from "clsx"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-900 text-zinc-100 grid grid-cols-[auto_1fr]">
      {/* Botón hamburguesa (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "h-screen bg-slate-800 border-r border-slate-700 shadow-md z-40 transition-all duration-300 ease-in-out flex flex-col justify-between",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Contenido del sidebar */}
        <div className={clsx("flex flex-col", sidebarOpen ? "p-4 gap-6 items-start" : "pt-6 gap-4 items-center")}>
          {sidebarOpen && (
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              🚀 Mi Panel
            </h2>
          )}

          <nav className={clsx("flex flex-col w-full", sidebarOpen ? "gap-4" : "gap-6 items-center")}>
            <Link
              href="/dashboard"
              className={clsx(
                "flex items-center rounded-md hover:bg-slate-700 transition-colors px-3 py-2 w-full",
                sidebarOpen ? "gap-3 justify-start" : "justify-center"
              )}
              title={!sidebarOpen ? "Resumen" : ""}
            >
              <BrainCircuit className={clsx("transition-all", sidebarOpen ? "w-5 h-5" : "w-6 h-6")} />
              {sidebarOpen && <span>Resumen</span>}
            </Link>

            <Link
              href="/dashboard/chats"
              className={clsx(
                "flex items-center rounded-md hover:bg-slate-700 transition-colors px-3 py-2 w-full",
                sidebarOpen ? "gap-3 justify-start" : "justify-center"
              )}
              title={!sidebarOpen ? "Conversaciones" : ""}
            >
              <MessageSquareText className={clsx("transition-all", sidebarOpen ? "w-5 h-5" : "w-6 h-6")} />
              {sidebarOpen && <span>Conversaciones</span>}
            </Link>

            <Link
              href="/dashboard/settings"
              className={clsx(
                "flex items-center rounded-md hover:bg-slate-700 transition-colors px-3 py-2 w-full",
                sidebarOpen ? "gap-3 justify-start" : "justify-center"
              )}
              title={!sidebarOpen ? "Configuración" : ""}
            >
              <Settings2 className={clsx("transition-all", sidebarOpen ? "w-5 h-5" : "w-6 h-6")} />
              {sidebarOpen && <span>Configuración</span>}
            </Link>
          </nav>
        </div>

        {/* Botón para plegar/desplegar (desktop) */}
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

      {/* Contenido principal */}
      <main className="p-4 transition-all duration-300 w-full overflow-auto">
        {children}
      </main>
    </div>
  )
}
