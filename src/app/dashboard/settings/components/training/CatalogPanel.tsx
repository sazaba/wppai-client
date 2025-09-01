'use client'

import { Plus, RefreshCw } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import type { Producto, ImagenProducto } from './types'
import ProductCard from './ProductCard'

type Props = {
  productos: Producto[]
  nuevoProd: Producto
  reloading: boolean
  onReload: () => void
  onChangeNuevo: (patch: Partial<Producto>) => void
  onCrear: () => void

  isEditing: (idx: number) => boolean
  onEdit: (idx: number) => void
  onDelete: (idx: number) => void
  onSave: (idx: number, patch: Partial<Producto>) => void
  /** ⬅️ Se mantiene SIN índice para no romper el padre */
  onCancel: () => void

  /** Devuelve la imagen creada si está disponible (para pintar optimista) */
  onUpload: (idx: number, file: File) => Promise<ImagenProducto | void> | ImagenProducto | void
  onRemoveImage: (idx: number, imageId: number) => Promise<void> | void

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
  // ===== Estado local sincronizado con productos =====
  const [items, setItems] = useState<Producto[]>(productos)

  useEffect(() => {
    setItems(productos)
  }, [productos])

  const patchProductAt = (idx: number, patch: Partial<Producto>) => {
    setItems((prev) => {
      const next = prev.slice()
      next[idx] = { ...next[idx], ...patch }
      return next
    })
  }

  const pushImageAt = (idx: number, img: ImagenProducto) => {
    setItems((prev) => {
      const next = prev.slice()
      const prod = next[idx]
      const imgs = (prod.imagenes || []).slice()
      imgs.push(img)
      next[idx] = { ...prod, imagenes: imgs }
      return next
    })
  }

  const removeImageAt = (idx: number, imageId: number) => {
    setItems((prev) => {
      const next = prev.slice()
      const prod = next[idx]
      const imgs = (prod.imagenes || []).filter((i) => i.id !== imageId)
      next[idx] = { ...prod, imagenes: imgs }
      return next
    })
  }

  // ===== Handlers envoltorio (optimistas) =====
  const handleUpload = async (idx: number, file: File) => {
    const created = (await onUpload(idx, file)) as ImagenProducto | void
    if (created && created.id && created.url) {
      pushImageAt(idx, created)
    }
  }

  const handleRemoveImage = async (idx: number, imageId: number) => {
    const prev = items[idx]
    const prevImgs = prev?.imagenes || []
    removeImageAt(idx, imageId)
    try {
      await onRemoveImage(idx, imageId)
    } catch (e) {
      // revert si falla
      setItems((cur) => {
        const copy = cur.slice()
        copy[idx] = { ...prev, imagenes: prevImgs }
        return copy
      })
      console.error('[CatalogPanel] remove image failed:', e)
    }
  }

  return (
    <div className="space-y-5">
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

      {/* Crear nuevo producto */}
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

      {!!items.length && (
        <div className="space-y-2">
          <h3 className="text-sm text-slate-300">Productos ({items.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((p, idx) => (
              <ProductCard
                key={`${p.id ?? 'nuevo'}-${idx}`}
                producto={p}
                idx={idx}
                isEditing={isEditing(idx)}
                onEdit={() => onEdit(idx)}
                onDelete={() => onDelete(idx)}
                onSave={(patch) => onSave(idx, patch)}
                onCancel={() => onCancel()}
                // Subidas/eliminaciones con actualización optimista local
                onUpload={(file) => handleUpload(idx, file)}
                onRemoveImage={(imageId) => handleRemoveImage(idx, imageId)}
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
