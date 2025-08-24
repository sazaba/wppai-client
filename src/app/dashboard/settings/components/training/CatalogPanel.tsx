'use client'

import { Plus, RefreshCw } from 'lucide-react'
import { memo } from 'react'
import type { Producto } from './types'
import ProductCard from './ProductCard'

type Props = {
  productos: Producto[]
  nuevoProd: Producto
  reloading: boolean
  onReload: () => void
  onChangeNuevo: (patch: Partial<Producto>) => void
  onCrear: () => void

  // por producto (indexado)
  isEditing: (idx: number) => boolean
  onEdit: (idx: number) => void
  onDelete: (idx: number) => void
  onSave: (idx: number, patch: Partial<Producto>) => void   // <-- cambiado
  onCancel: (idx: number) => void
  onUpload: (idx: number, file: File) => Promise<void> | void
  onRemoveImage: (idx: number, imageId: number) => void

  // opcionales de UI (por índice)
  uploadingIndex?: number | null
  savingIndex?: number | null
}

function CatalogPanelBase({
  productos,
  nuevoProd,
  reloading,
  onReload,
  onChangeNuevo,
  onCrear,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onUpload,
  onRemoveImage,
  uploadingIndex,
  savingIndex,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Catálogo (crear / editar)</h2>
        <button
          onClick={onReload}
          disabled={reloading}
          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-60"
          type="button"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {reloading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {/* Crear nuevo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <input
          placeholder="Nombre del producto *"
          value={nuevoProd.nombre}
          onChange={(e) => onChangeNuevo({ nombre: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Precio desde (opcional)"
          value={nuevoProd.precioDesde ?? ''}
          onChange={(e) =>
            onChangeNuevo({
              precioDesde: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
        />
        <input
          placeholder="Descripción corta"
          value={nuevoProd.descripcion}
          onChange={(e) => onChangeNuevo({ descripcion: e.target.value })}
          className="md:col-span-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          rows={3}
          placeholder="Beneficios (uno por línea)"
          value={nuevoProd.beneficios}
          onChange={(e) => onChangeNuevo({ beneficios: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          rows={3}
          placeholder="Características (una por línea)"
          value={nuevoProd.caracteristicas}
          onChange={(e) => onChangeNuevo({ caracteristicas: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
        />

        <div className="md:col-span-2">
          <button
            onClick={onCrear}
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Crear producto
          </button>
        </div>
      </div>

      {/* Listado */}
      {!!productos.length && (
        <div className="space-y-2">
          <h3 className="text-sm text-slate-300">Productos ({productos.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productos.map((p, idx) => (
              <ProductCard
                key={`${p.id ?? 'nuevo'}-${idx}`}
                producto={p}
                idx={idx}
                isEditing={isEditing(idx)}
                onEdit={() => onEdit(idx)}
                onDelete={() => onDelete(idx)}
                onSave={(patch) => onSave(idx, patch)}           {/* <-- cambiado */}
                onCancel={() => onCancel(idx)}
                onUpload={(file) => onUpload(idx, file)}
                onRemoveImage={(imageId) => onRemoveImage(idx, imageId)}
                uploading={uploadingIndex === idx}
                saving={savingIndex === idx}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const CatalogPanel = memo(CatalogPanelBase)
export default CatalogPanel
