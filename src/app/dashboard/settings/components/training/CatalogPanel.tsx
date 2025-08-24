'use client'

import { Plus, RefreshCw } from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'
import type { Producto } from './types'
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
  onCancel: (idx: number) => void

  /** Opcional: si lo pasas, se usará en vez del flujo interno presign→PUT→confirm */
  onUpload?: (idx: number, file: File) => Promise<void> | void
  onRemoveImage: (idx: number, imageId: number) => void

  uploadingIndex?: number | null
  savingIndex?: number | null
}

async function getImageMeta(file: File): Promise<{ width?: number; height?: number }> {
  try {
    const bmp = await createImageBitmap(file)
    const meta = { width: bmp.width, height: bmp.height }
    bmp.close()
    return meta
  } catch {
    return {}
  }
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
  const [localUploadingIdx, setLocalUploadingIdx] = useState<number | null>(null)
  const effectiveUploadingIndex = useMemo(
    () => (typeof uploadingIndex === 'number' || uploadingIndex === null ? uploadingIndex : localUploadingIdx),
    [uploadingIndex, localUploadingIdx]
  )

  // Presign → PUT (R2) → Confirm
  const uploadWithPresign = useCallback(
    async (idx: number, file: File) => {
      const product = productos[idx]
      if (!product?.id) throw new Error('Producto sin id')

      setLocalUploadingIdx(idx)
      try {
        // A) presign
        const pres = await fetch(`/api/products/${product.id}/images/presign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type }),
        })
        if (!pres.ok) throw new Error(`No se pudo firmar la URL (${pres.status})`)
        const { url, objectKey } = await pres.json()

        // B) PUT directo a R2 (SIN Authorization)
        const put = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        })
        if (!put.ok) throw new Error(`Fallo el PUT a R2 (${put.status})`)

        // C) confirm (DB)
        const meta = await getImageMeta(file)
        const conf = await fetch(`/api/products/${product.id}/images/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objectKey,
            alt: '',
            isPrimary: false,
            mimeType: file.type,
            sizeBytes: file.size,
            width: meta.width,
            height: meta.height,
          }),
        })
        if (!conf.ok) throw new Error(`No se pudo confirmar la imagen (${conf.status})`)

        onReload()
      } finally {
        setLocalUploadingIdx(null)
      }
    },
    [productos, onReload]
  )

  const handleUpload = useCallback(
    async (idx: number, file: File) => {
      if (onUpload) return onUpload(idx, file) // si el padre lo provee, lo respeta
      return uploadWithPresign(idx, file)      // si no, usa presign interno
    },
    [onUpload, uploadWithPresign]
  )

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
                onSave={(patch) => onSave(idx, patch)}
                onCancel={() => onCancel(idx)}
                onUpload={(file) => handleUpload(idx, file)}
                onRemoveImage={(imageId) => onRemoveImage(idx, imageId)}
                uploading={effectiveUploadingIndex === idx}
                saving={savingIndex === idx ?? false}
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
