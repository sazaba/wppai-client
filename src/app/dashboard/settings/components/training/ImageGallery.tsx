'use client'

import type { ImagenProducto } from './types'
import ImgAlways from './ImgAlways'
import { Trash2 } from 'lucide-react'

type Props = {
  imagenes: ImagenProducto[]
  onRemove?: (id: number) => void
}

export default function ImageGallery({ imagenes, onRemove }: Props) {
  if (!imagenes?.length) {
    return (
      <div className="h-16 rounded-lg border border-slate-700 flex items-center justify-center text-[11px] text-slate-400">
        Sin imágenes
      </div>
    )
  }

  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {imagenes.map((img) => (
        <div key={img.id ?? img.url} className="relative group">
          <ImgAlways
            src={img.url}
            alt={img.alt || ''}
            className="w-full h-16 object-cover rounded-lg border border-slate-700"
          />
          {img.id && onRemove && (
            <button
              onClick={() => onRemove(img.id!)}
              className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition"
              title="Eliminar imagen"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
