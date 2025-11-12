'use client'

import { useState } from 'react'
import EsteticaFormSmart from '@/app/dashboard/settings/estetica/EsteticaForm'
import ProceduresPanel from '@/app/dashboard/settings/estetica/ProceduresPanel'
import StaffPanel from '@/app/dashboard/settings/estetica/StaffPanel'
import ExceptionsPanel from '@/app/dashboard/settings/estetica/ExceptionsPanel'

type Tab = 'config' | 'staff' | 'procedures' | 'exceptions'

export default function Page() {
  const [tab, setTab] = useState<Tab>('config')

  const TabBtn = ({ id, children }: { id: Tab; children: React.ReactNode }) => {
    const active = tab === id
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        aria-current={active ? 'page' : undefined}
        className={[
          'relative px-4 py-2 rounded-full text-sm font-medium transition',
          'outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60',
          active
            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-900/30'
            : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10',
        ].join(' ')}
      >
        {children}
        {active && (
          <span className="pointer-events-none absolute -bottom-1 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-violet-300 shadow" />
        )}
      </button>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Barra de pestañas */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 backdrop-blur-md bg-slate-950/50 border-b border-white/10 rounded-b-2xl">
        <div
          role="tablist"
          aria-label="Navegación de Estética"
          className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="inline-flex gap-2 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-1 shadow-md">
            <TabBtn id="config">Configuración</TabBtn>
            <TabBtn id="staff">Staff</TabBtn>
            <TabBtn id="procedures">Servicios</TabBtn>
            <TabBtn id="exceptions">Fechas bloqueadas</TabBtn>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-6">
        {tab === 'config' && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-4 sm:p-6 shadow">
            <EsteticaFormSmart />
          </section>
        )}

        {tab === 'staff' && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-4 sm:p-6 shadow">
            <StaffPanel />
          </section>
        )}

        {tab === 'procedures' && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-4 sm:p-6 shadow">
            <ProceduresPanel />
          </section>
        )}

        {tab === 'exceptions' && (
          <section className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-4 sm:p-6 shadow">
            <ExceptionsPanel />
          </section>
        )}
      </div>
    </div>
  )
}
