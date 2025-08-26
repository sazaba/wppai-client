'use client'

import { memo, useEffect, useState } from 'react'
import type { Producto, ImagenProducto } from './types'
import { Check, Loader2, PencilLine, Trash2, Upload, XCircle } from 'lucide-react'
import ImgAlways from './ImgAlways'

const MAX_SIZE_MB = 5

type Props = {
  producto: Producto
  idx: number
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void

  onSave?: (patch: Partial<Producto>) => Promise<void> | void
  onCancel?: () => void

  onUpload?: (file: File) => Promise<void> | void
  onRemoveImage?: (imageId: number) => void

  uploading?: boolean
  saving?: boolean
}

function listFromText(text?: string) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function ProductCardBase({
  producto,
  idx,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onUpload,
  onRemoveImage,
  uploading,
  saving,
}: Props) {
  const [draft, setDraft] = useState<Producto>(producto)
  const [pendingImages, setPendingImages] = useState<Array<{ id: string; file: File; preview: string }>>([])
  const hasPendings = pendingImages.length > 0
  const [savingAll, setSavingAll] = useState(false)

  useEffect(() => {
    if (isEditing) setDraft(producto)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, producto.id])

  useEffect(() => {
    return () => pendingImages.forEach((p) => URL.revokeObjectURL(p.preview))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateFile = (file: File) => {
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_SIZE_MB) {
      alert(`El archivo "${file.name}" pesa ${sizeMB.toFixed(1)} MB. Máximo permitido: ${MAX_SIZE_MB} MB.`)
      return false
    }
    return true
  }

  const handleSelectFile = async (file: File | undefined | null) => {
    if (!file) return
    if (!validateFile(file)) return
    const url = URL.createObjectURL(file)
    const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setPendingImages((prev) => [...prev, { id, file, preview: url }])
  }

  const clearPendings = () => {
    pendingImages.forEach((p) => URL.revokeObjectURL(p.preview))
    setPendingImages([])
  }

  const handleSaveAll = async () => {
    try {
      setSavingAll(true)
      if (onUpload && pendingImages.length > 0) {
        for (const p of pendingImages) await onUpload(p.file)
      }
      await onSave?.(draft)
      clearPendings()
    } finally {
      setSavingAll(false)
    }
  }

  const handleCancel = () => {
    clearPendings()
    onCancel?.()
  }

  return (
    <div className={`rounded-2xl border border-slate-700 bg-slate-800/60 p-3 ${isEditing ? 'ring-1 ring-blue-500/40' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">
            {producto.nombre}{' '}
            {producto.id && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">id #{producto.id}</span>
            )}
          </div>
          {producto.precioDesde != null && (
            <div className="text-xs text-slate-400">Desde: {producto.precioDesde}</div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveAll}
                disabled={!!saving || savingAll}
                className="p-1.5 rounded-lg hover:bg-emerald-700/30 disabled:opacity-60"
                title="Guardar cambios"
                type="button"
              >
                {saving || savingAll ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={handleCancel}
                disabled={!!saving || savingAll}
                className="p-1.5 rounded-lg hover:bg-red-700/30 disabled:opacity-60"
                title="Cancelar edición"
                type="button"
              >
                <XCircle className="w-4 h-4 text-red-300" />
              </button>
            </>
          ) : (
            <>
              {producto.id && (
                <>
                  <input
                    id={`upload-card-${idx}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      await handleSelectFile(file)
                      if (e.currentTarget) e.currentTarget.value = ''
                    }}
                  />
                  <button
                    onClick={() => document.getElementById(`upload-card-${idx}`)?.click()}
                    disabled={uploading}
                    className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-60"
                    title="Agregar imagen"
                    type="button"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin text-slate-200" /> : <Upload className="w-4 h-4 text-slate-200" />}
                  </button>
                </>
              )}
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-700" title="Editar" type="button">
                <PencilLine className="w-4 h-4 text-slate-200" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-slate-700" title="Eliminar" type="button">
                <Trash2 className="w-4 h-4 text-slate-200" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      {!isEditing ? (
        <>
          {!!producto.descripcion && <div className="mt-2 text-xs text-slate-300 whitespace-pre-line">{producto.descripcion}</div>}

          {!!producto.beneficios && (
            <div className="mt-2">
              <div className="text-xs text-slate-400 mb-1">Beneficios:</div>
              <ul className="list-disc pl-5 text-xs text-slate-300">
                {listFromText(producto.beneficios).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {!!producto.caracteristicas && (
            <div className="mt-2">
              <div className="text-xs text-slate-400 mb-1">Características:</div>
              <ul className="list-disc pl-5 text-xs text-slate-300">
                {listFromText(producto.caracteristicas).map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-2 grid grid-cols-3 gap-2">
            {producto.imagenes?.map((img: ImagenProducto) => (
              <div key={img.id ?? img.url} className="relative group">
                {/* la URL ya viene con la variante desde el backend */}
                <ImgAlways
                  src={img.url}
                  alt={img.alt || ''}
                  className="w-full h-16 object-cover rounded-lg border border-slate-700"
                />
                {img.id && (
                  <button
                    onClick={() => img.id && onRemoveImage?.(img.id)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition"
                    title="Eliminar imagen"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            ))}

            {pendingImages.map((p) => (
              <div key={p.id} className="relative">
                <img src={p.preview} alt="pendiente" className="w-full h-16 object-cover rounded-lg border border-slate-700 opacity-80" />
                <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-black">Pendiente</span>
              </div>
            ))}

            {!hasPendings && (!producto.imagenes || producto.imagenes.length === 0) && (
              <div className="col-span-3 h-16 rounded-lg border border-slate-700 flex items-center justify-center text-[11px] text-slate-400">
                Sin imágenes
              </div>
            )}
          </div>
        </>
      ) : (
        // Edición
        <div className="mt-3 space-y-2">
          <input
            value={draft.nombre || ''}
            onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
            placeholder="Nombre"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              value={draft.precioDesde ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, precioDesde: e.target.value ? Number(e.target.value) : null }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
              placeholder="Precio desde"
            />
            <input
              value={draft.descripcion || ''}
              onChange={(e) => setDraft((d) => ({ ...d, descripcion: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
              placeholder="Descripción corta"
            />
          </div>
          <textarea
            rows={3}
            value={draft.beneficios || ''}
            onChange={(e) => setDraft((d) => ({ ...d, beneficios: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
            placeholder="Beneficios (uno por línea)"
          />
          <textarea
            rows={3}
            value={draft.caracteristicas || ''}
            onChange={(e) => setDraft((d) => ({ ...d, caracteristicas: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
            placeholder="Características (una por línea)"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Imágenes {hasPendings && <span className="ml-1 text-amber-400">(pendientes: {pendingImages.length})</span>}
              </div>
              {producto.id && (
                <>
                  <input
                    id={`upload-edit-${idx}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const sizeMB = file.size / (1024 * 1024)
                      if (sizeMB > MAX_SIZE_MB) {
                        alert(`El archivo "${file.name}" pesa ${sizeMB.toFixed(1)} MB. Máximo permitido: ${MAX_SIZE_MB} MB.`)
                        return
                      }
                      const url = URL.createObjectURL(file)
                      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`
                      setPendingImages((prev) => [...prev, { id, file, preview: url }])
                      if (e.currentTarget) e.currentTarget.value = ''
                    }}
                  />
                  <button
                    onClick={() => document.getElementById(`upload-edit-${idx}`)?.click()}
                    disabled={uploading || savingAll}
                    className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs inline-flex items-center gap-1 disabled:opacity-60"
                    type="button"
                  >
                    {uploading || savingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Subir <Upload className="w-3.5 h-3.5" /></>}
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {producto.imagenes?.map((img: ImagenProducto) => (
                <div key={img.id ?? img.url} className="relative">
                  {/* la URL ya viene con la variante desde el backend */}
                  <ImgAlways
                    src={img.url}
                    alt={img.alt || ''}
                    className="w-full h-16 object-cover rounded-lg border border-slate-700"
                  
                  />
                  {img.id && (
                    <button
                      onClick={() => img.id && onRemoveImage?.(img.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900 border border-slate-700"
                      title="Quitar imagen"
                      type="button"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {pendingImages.map((p) => (
                <div key={p.id} className="relative">
                  <img src={p.preview} alt="pendiente" className="w-full h-16 object-cover rounded-lg border border-slate-700 opacity-80" />
                  <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-black">Pendiente</span>
                </div>
              ))}

              {!hasPendings && (!producto.imagenes || producto.imagenes.length === 0) && (
                <div className="col-span-3 h-14 rounded-lg border border-dashed border-slate-700 text-[11px] text-slate-400 flex items-center justify-center">
                  Sin imágenes
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ProductCard = memo(ProductCardBase)
export default ProductCard
