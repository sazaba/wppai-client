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

  const TabBtn = ({ id, children }: { id: Tab; children: React.ReactNode }) => {
    const active = tab === id
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        aria-current={active ? 'page' : undefined}
        className={[
          'relative px-3.5 py-2 rounded-xl text-sm font-medium transition',
          'outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60',
          active
            ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/30'
            : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700',
        ].join(' ')}
      >
        {children}
        {active && (
          <span className="pointer-events-none absolute -bottom-1 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-violet-300" />
        )}
      </button>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Barra de pestañas compacta (sin títulos para no duplicar con el formulario de Configuración) */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-slate-950/95 border-b border-slate-800">
        <div
          role="tablist"
          aria-label="Navegación de Estética"
          className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="inline-flex gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-1 shadow-sm">
            <TabBtn id="config">Configuración</TabBtn>
            <TabBtn id="procedures">Servicios</TabBtn>
            <TabBtn id="staff">Staff</TabBtn>
            <TabBtn id="exceptions">Fechas bloqueadas</TabBtn>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-6">
        {/* Configuración: sin wrapper adicional para no chocar con el header propio del formulario */}
        {tab === 'config' && <EsteticaFormSmart />}

        {/* El resto de paneles llevan contenedor consistente y premium */}
        {tab === 'procedures' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-md">
            <ProceduresPanel />
          </section>
        )}
        {tab === 'staff' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-md">
            <StaffPanel />
          </section>
        )}
        {tab === 'exceptions' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-md">
            <ExceptionsPanel />
          </section>
        )}
      </div>
    </div>
  )
}
