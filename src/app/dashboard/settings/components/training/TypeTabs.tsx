'use client'

import { memo } from 'react'
import type { BusinessType } from './types'   // ⬅️ importa desde el archivo único

type Props = {
  value: BusinessType
  onChange: (next: BusinessType) => void
  loading?: boolean
}

function TypeTabsBase({ value, onChange, loading }: Props) {
  const isServicios = value === 'servicios'
  const isProductos = value === 'productos'

  const base =
    'rounded-xl px-3 py-2 text-sm border transition disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
      <button
        type="button"
        className={
          base +
          ' ' +
          (isServicios
            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800/70')
        }
        onClick={() => onChange('servicios')}
        disabled={loading || isServicios}
        aria-pressed={isServicios}
      >
        Servicios
      </button>

      <button
        type="button"
        className={
          base +
          ' ' +
          (isProductos
            ? 'bg-blue-600/20 border-blue-500 text-blue-200'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800/70')
        }
        onClick={() => onChange('productos')}
        disabled={loading || isProductos}
        aria-pressed={isProductos}
      >
        Productos
      </button>
    </div>
  )
}

const TypeTabs = memo(TypeTabsBase)
export default TypeTabs
