// client/src/app/dashboard/settings/estetica/page.tsx
'use client'

import { useState } from 'react'
import EsteticaFormSmart from '@/app/dashboard/settings/estetica/EsteticaForm'
import ProceduresPanel from '@/app/dashboard/settings/estetica/ProceduresPanel'
import StaffPanel from '@/app/dashboard/settings/estetica/StaffPanel'
import ExceptionsPanel from '@/app/dashboard/settings/estetica/ExceptionsPanel'

type Tab = 'config' | 'procedures' | 'staff' | 'exceptions'

export default function Page() {
  const [tab, setTab] = useState<Tab>('config')

  const TabBtn = ({ id, children }: { id: Tab; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={[
        // base
        'relative px-3.5 py-2 rounded-xl text-sm font-medium transition',
        'outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60',
        // colors
        tab === id
          ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-900/30'
          : 'text-slate-300 hover:text-white bg-white/[.04] hover:bg-white/[.08] border border-white/10',
      ].join(' ')}
    >
      {children}
      {/* glow underline when active */}
      {tab === id && (
        <span className="pointer-events-none absolute -bottom-1 left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-violet-300/90" />
      )}
    </button>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header sticky con glass y gradiente sutil */}
      <div className="sticky top-0 z-10 -mx-6 px-6 pt-2 pb-4 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-transparent backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Estética</h1>
            <p className="text-[12px] text-slate-400">Configura tu agenda, servicios y equipo.</p>
          </div>

          {/* Tabs: segmented control, scrollable en móvil */}
          <div
            role="tablist"
            aria-label="Pestañas de configuración"
            className="w-full sm:w-auto overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="inline-flex gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-1 shadow-[0_8px_30px_-12px_rgba(0,0,0,.5)]">
              <TabBtn id="config">Configuración</TabBtn>
              <TabBtn id="procedures">Servicios</TabBtn>
              <TabBtn id="staff">Staff</TabBtn>
              <TabBtn id="exceptions">Fechas bloqueadas</TabBtn>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-6">
        {tab === 'config' && <EsteticaFormSmart />}
        {tab === 'procedures' && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl p-4 sm:p-6">
            <ProceduresPanel />
          </div>
        )}
        {tab === 'staff' && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl p-4 sm:p-6">
            <StaffPanel />
          </div>
        )}
        {tab === 'exceptions' && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl p-4 sm:p-6">
            <ExceptionsPanel />
          </div>
        )}
      </div>
    </div>
  )
}
