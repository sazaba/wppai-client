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
      onClick={() => setTab(id)}
      className={[
        'px-3 py-2 rounded-lg text-sm border transition',
        tab === id
          ? 'bg-slate-800 border-slate-700 text-white'
          : 'bg-transparent border-slate-800 text-slate-300 hover:bg-slate-800/40',
      ].join(' ')}
      type="button"
    >
      {children}
    </button>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Estética</h1>
        <div className="flex gap-2">
          <TabBtn id="config">Configuración</TabBtn>
          <TabBtn id="procedures">Servicios</TabBtn>
          <TabBtn id="staff">Staff</TabBtn>
          <TabBtn id="exceptions">Fechas bloqueadas</TabBtn>
        </div>
      </div>

      {tab === 'config' && <EsteticaFormSmart />}
      {tab === 'procedures' && <ProceduresPanel />}
      {tab === 'staff' && <StaffPanel />}
      {tab === 'exceptions' && <ExceptionsPanel />}
    </div>
  )
}
