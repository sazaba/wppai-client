'use client'

import { memo, useEffect, useMemo, useState } from 'react'
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

  // acciones de edición
  onSave?: (patch: Partial<Producto>) => Promise<void> | void
  onCancel?: () => void

  // imágenes
  onUpload?: (file: File) => Promise<void> | void
  onRemoveImage?: (imageId: number) => void

  // estados opcionales para UI
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

  // --- NUEVO: cola local de imágenes pendientes (no se suben aún) ---
  const [pendingImages, setPendingImages] = useState<Array<{ id: string; file: File; preview: string }>>([])
  const hasPendings = pendingImages.length > 0

  // control de subida al presionar check
  const [savingAll, setSavingAll] = useState(false)

  // compat: preview antiguo durante “subida inmediata” (ya no se usa para subir)
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null)
  const hasPreview = !!tempPreviewUrl // se mantiene para no romper nada visual si lo usabas

  useEffect(() => {
    if (isEditing) setDraft(producto)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, producto.id])

  useEffect(() => {
    return () => {
      // liberar URLs locales
      pendingImages.forEach((p) => URL.revokeObjectURL(p.preview))
      if (tempPreviewUrl) URL.revokeObjectURL(tempPreviewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateFile = (file: File) => {
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_SIZE_MB) {
      alert(
        `El archivo "${file.name}" pesa ${sizeMB.toFixed(1)} MB. Máximo permitido: ${MAX_SIZE_MB} MB.`
      )
      return false
    }
    return true
  }

  // --- NUEVO: seleccionar archivo -> SOLO agregar a pendientes y mostrar preview local ---
  const handleSelectFile = async (file: File | undefined | null) => {
    if (!file) return
    if (!validateFile(file)) return
    const url = URL.createObjectURL(file)
    const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setPendingImages((prev) => [...prev, { id, file, preview: url }])
  }

  // --- NUEVO: limpiar pendientes (por ejemplo al cancelar) ---
  const clearPendings = () => {
    pendingImages.forEach((p) => URL.revokeObjectURL(p.preview))
    setPendingImages([])
  }

  // --- NUEVO: guardar (check verde) -> sube pendientes y guarda patch del producto ---
  const handleSaveAll = async () => {
    try {
      setSavingAll(true)
      // 1) Subir imágenes pendientes (si hay)
      if (onUpload && pendingImages.length > 0) {
        for (const p of pendingImages) {
          // subida secuencial para simplificar estados/errores
          await onUpload(p.file)
        }
      }
      // 2) Guardar cambios del producto
      await onSave?.(draft)
      // 3) Limpiar cola local
      clearPendings()
    } finally {
      setSavingAll(false)
    }
  }

  // cancelar edición: limpia pendientes y deja que el padre maneje el resto
  const handleCancel = () => {
    clearPendings()
    onCancel?.()
  }

  return (
    <div
      className={`rounded-2xl border border-slate-700 bg-slate-800/60 p-3 ${
        isEditing ? 'ring-1 ring-blue-500/40' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">
            {producto.nombre}{' '}
            {producto.id && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">
                id #{producto.id}
              </span>
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
                aria-label="Guardar cambios"
                type="button"
              >
                {saving || savingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={!!saving || savingAll}
                className="p-1.5 rounded-lg hover:bg-red-700/30 disabled:opacity-60"
                title="Cancelar edición"
                aria-label="Cancelar edición"
                type="button"
              >
                <XCircle className="w-4 h-4 text-red-300" />
              </button>
            </>
          ) : (
            <>
              {/* Subida rápida (ahora SOLO agrega a pendientes; no sube a BD) */}
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
                    onClick={() =>
                      document.getElementById(`upload-card-${idx}`)?.click()
                    }
                    disabled={uploading}
                    className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-60"
                    title="Agregar imagen (pendiente)"
                    aria-label="Agregar imagen (pendiente)"
                    type="button"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                    ) : (
                      <Upload className="w-4 h-4 text-slate-200" />
                    )}
                  </button>
                </>
              )}
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-slate-700"
                title="Editar"
                aria-label="Editar"
                type="button"
              >
                <PencilLine className="w-4 h-4 text-slate-200" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-slate-700"
                title="Eliminar"
                aria-label="Eliminar"
                type="button"
              >
                <Trash2 className="w-4 h-4 text-slate-200" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      {!isEditing ? (
        <>
          {producto.descripcion && (
            <div className="mt-2 text-xs text-slate-300 whitespace-pre-line">
              {producto.descripcion}
            </div>
          )}

          {producto.beneficios && (
            <div className="mt-2">
              <div className="text-xs text-slate-400 mb-1">Beneficios:</div>
              <ul className="list-disc pl-5 text-xs text-slate-300">
                {listFromText(producto.beneficios).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {producto.caracteristicas && (
            <div className="mt-2">
              <div className="text-xs text-slate-400 mb-1">Características:</div>
              <ul className="list-disc pl-5 text-xs text-slate-300">
                {listFromText(producto.caracteristicas).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2 grid grid-cols-3 gap-2">
            {/* imágenes reales */}
            {producto.imagenes?.map((img) => (
              <div key={img.id ?? img.url} className="relative group">
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
                    aria-label="Eliminar imagen"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            ))}

            {/* NUEVO: previews locales pendientes (cuando no estás editando también se pueden ver) */}
            {pendingImages.map((p) => (
              <div key={p.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.preview}
                  alt="pendiente"
                  className="w-full h-16 object-cover rounded-lg border border-slate-700 opacity-80"
                />
                <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-black">
                  Pendiente
                </span>
              </div>
            ))}

            {/* si no hay nada */}
            {!hasPreview &&
              !hasPendings &&
              (!producto.imagenes || producto.imagenes.length === 0) && (
                <div className="col-span-3 h-16 rounded-lg border border-slate-700 flex items-center justify-center text-[11px] text-slate-400">
                  Sin imágenes
                </div>
              )}
          </div>
        </>
      ) : (
        // EDICIÓN
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
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  precioDesde: e.target.value ? Number(e.target.value) : null,
                }))
              }
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

          {/* Imágenes en edición */}
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
                      await handleSelectFile(file)
                      if (e.currentTarget) e.currentTarget.value = ''
                    }}
                  />
                  <button
                    onClick={() => document.getElementById(`upload-edit-${idx}`)?.click()}
                    disabled={uploading || savingAll}
                    className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs inline-flex items-center gap-1 disabled:opacity-60"
                    type="button"
                  >
                    {uploading || savingAll ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        Subir
                        <Upload className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Imágenes persistidas */}
              {producto.imagenes?.map((img: ImagenProducto) => (
                <div key={img.id ?? img.url} className="relative">
                  <ImgAlways
                    src={img.url}
                    alt={img.alt || ''}
                    className="w-full h-16 object-cover rounded-lg border border-slate-700"
                    disableBust
                  />
                  {img.id && (
                    <button
                      onClick={() => img.id && onRemoveImage?.(img.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900 border border-slate-700"
                      title="Quitar imagen"
                      aria-label="Quitar imagen"
                      type="button"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {/* NUEVO: previews de pendientes (solo locales, NO en BD) */}
              {pendingImages.map((p) => (
                <div key={p.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.preview}
                    alt="pendiente"
                    className="w-full h-16 object-cover rounded-lg border border-slate-700 opacity-80"
                  />
                  <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-black">
                    Pendiente
                  </span>
                  {/* botón para quitar de pendientes antes de guardar */}
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(p.preview)
                      setPendingImages((prev) => prev.filter((x) => x.id !== p.id))
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900 border border-slate-700"
                    title="Quitar de pendientes"
                    aria-label="Quitar de pendientes"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* estado vacío */}
              {!hasPreview &&
                !hasPendings &&
                (!producto.imagenes || producto.imagenes.length === 0) && (
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
