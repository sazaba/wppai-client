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
        // colors (sin glass)
        tab === id
          ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/30'
          : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700',
      ].join(' ')}
    >
      {children}
      {tab === id && (
        <span className="pointer-events-none absolute -bottom-1 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-violet-300/90" />
      )}
    </button>
  )

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header sticky (sin glass), fondo sólido */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-4 bg-slate-950/95 border-b border-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Estética</h1>
            <p className="text-[12px] text-slate-400">
              Configura tu agenda, servicios y equipo.
            </p>
          </div>

          {/* Tabs: segmented control, scrollable en móvil */}
          <div
            role="tablist"
            aria-label="Pestañas de configuración"
            className="w-full lg:w-auto overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="inline-flex gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-1 shadow-sm">
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-md">
            <ProceduresPanel />
          </div>
        )}

        {tab === 'staff' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-md">
            <StaffPanel />
          </div>
        )}

        {tab === 'exceptions' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-md">
            <ExceptionsPanel />
          </div>
        )}
      </div>

      {/* Footer sutil */}
      <div className="pt-2 pb-8 text-[11px] text-slate-500">
        Tip: puedes cambiar de pestañas sin perder datos no guardados dentro del panel activo.
      </div>
    </div>
  )
}
