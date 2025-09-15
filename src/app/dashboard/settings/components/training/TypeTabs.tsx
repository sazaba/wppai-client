'use client'

import { memo } from 'react'

// ⚠️ Tipo de tabs para la UI (independiente de la BD)
export type EditorTab = 'servicios' | 'productos' | 'citas' | 'agente'

type Props = {
  value: EditorTab
  onChange: (next: EditorTab) => void
  loading?: boolean
}

function TypeTabsBase({ value, onChange, loading }: Props) {
  const base =
    'rounded-xl px-3 py-2 text-sm border transition disabled:opacity-60 disabled:cursor-not-allowed'

  // misma util que ya usabas, solo reutilizamos con distintos colores
  const btn = (active: boolean, color: 'emerald' | 'blue' | 'rose' | 'violet') =>
    active
      ? `bg-${color}-600/20 border-${color}-500 text-${color}-200`
      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800/70'

  return (
    <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
      <button
        type="button"
        className={`${base} ${btn(value === 'servicios', 'emerald')}`}
        onClick={() => onChange('servicios')}
        disabled={loading || value === 'servicios'}
        aria-pressed={value === 'servicios'}
      >
        Servicios
      </button>

      <button
        type="button"
        className={`${base} ${btn(value === 'productos', 'blue')}`}
        onClick={() => onChange('productos')}
        disabled={loading || value === 'productos'}
        aria-pressed={value === 'productos'}
      >
        Productos
      </button>

      <button
        type="button"
        className={`${base} ${btn(value === 'citas', 'rose')}`}
        onClick={() => onChange('citas')}
        disabled={loading || value === 'citas'}
        aria-pressed={value === 'citas'}
      >
        Citas
      </button>

      <button
        type="button"
        className={`${base} ${btn(value === 'agente', 'violet')}`}
        onClick={() => onChange('agente')}
        disabled={loading || value === 'agente'}
        aria-pressed={value === 'agente'}
      >
        Agente
      </button>
    </div>
  )
}

const TypeTabs = memo(TypeTabsBase)
export default TypeTabs
