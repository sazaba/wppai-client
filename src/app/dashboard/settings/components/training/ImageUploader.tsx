'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react'

type Props = {
  currentCount: number
  maxCount?: number
  maxSizeMB?: number
  acceptMimes?: string[]
  onUpload: (files: File[]) => Promise<void> | void
  disabled?: boolean
}

/** Hook: crea y revoca object URLs para un array de Files */
function useObjectURLs(files: File[]) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => {
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [urls])
  return urls
}

export default function ImageUploader({
  currentCount,
  maxCount = 5,
  maxSizeMB = 5,
  acceptMimes = ['image/jpeg', 'image/png', 'image/webp'],
  onUpload,
  disabled = false,
}: Props) {
  const [pending, setPending] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const previews = useObjectURLs(pending)

  const left = Math.max(0, maxCount - currentCount)
  const acceptAttr = acceptMimes.join(',')

  const reset = () => {
    setPending([])
    setError(null)
    setSubmitting(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const validateFiles = (files: File[]) => {
    if (!files.length) return { ok: false, msg: 'No seleccionaste archivos.' }
    if (files.length > left) {
      return {
        ok: false,
        msg: `Puedes subir máximo ${left} imagen(es) más (límite total: ${maxCount}).`,
      }
    }
    for (const f of files) {
      if (!acceptMimes.includes(f.type)) {
        return {
          ok: false,
          msg: `Formato no permitido: ${f.type || f.name}. Usa: ${acceptMimes.join(', ')}`,
        }
      }
      const sizeMB = f.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        return { ok: false, msg: `“${f.name}” pesa ${sizeMB.toFixed(1)}MB (máx ${maxSizeMB}MB).` }
      }
    }
    return { ok: true, msg: '' }
  }

  const handleFiles = useCallback(
    (filesList: FileList | null) => {
      setError(null)
      if (!filesList || !filesList.length) return
      const files = Array.from(filesList)
      const res = validateFiles(files)
      if (!res.ok) {
        setError(res.msg)
        return
      }
      setPending(files)
    },
    [left, maxCount, maxSizeMB, acceptMimes]
  )

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled || submitting) return
    handleFiles(e.dataTransfer.files)
  }

  const onClickUpload = async () => {
    if (!pending.length) {
      setError('No hay archivos para subir.')
      return
    }
    try {
      setSubmitting(true)
      setError(null)
      await onUpload(pending)
      reset()
    } catch (e: any) {
      setError(e?.message || 'No se pudo subir la(s) imagen(es).')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Zona de drop/select */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`rounded-xl border border-dashed ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        } border-slate-700 bg-slate-800/50 p-3 flex items-center justify-between gap-3`}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        aria-disabled={disabled}
        title={disabled ? 'Cargando...' : `Arrastra aquí o haz clic para seleccionar (restan ${left})`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-slate-300" />
          </div>
          <div className="text-xs text-slate-300">
            <div className="font-medium">Subir imágenes</div>
            <div className="text-slate-400">
              Restantes: {left} &middot; Máx {maxSizeMB}MB &middot; {acceptMimes.join(', ')}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
            disabled={disabled || submitting}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-xs"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Elegir
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Previews seleccionados */}
      {!!pending.length && (
        <div className="space-y-2">
          <div className="text-xs text-slate-400">
            Seleccionadas: {pending.length}{' '}
            <button
              className="ml-2 text-slate-300 underline decoration-dotted"
              onClick={reset}
              type="button"
            >
              limpiar
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {pending.map((file, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[i]}
                  alt={file.name}
                  className="w-full h-20 object-cover rounded-lg border border-slate-700"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900 border border-slate-700"
                  onClick={() => setPending((arr) => arr.filter((_, idx) => idx !== i))}
                  title="Quitar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClickUpload}
              disabled={submitting || disabled}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm disabled:opacity-60"
              type="button"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Subiendo…
                </>
              ) : (
                'Subir seleccionadas'
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
    </div>
  )
}
