// ChatHeader.tsx
'use client'
import { FiMessageSquare } from 'react-icons/fi'

interface ChatHeaderProps {
  nombre: string
  estado?: string
  onCerrar: () => void
  onReabrir?: () => void
  mostrarBotonCerrar?: boolean
}

export default function ChatHeader({
  nombre,
  estado,
  onCerrar,
  onReabrir,
  mostrarBotonCerrar = true,
}: ChatHeaderProps) {
  const est = estado ?? ''
  const estaCerrado = est === 'cerrado'

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#202C33] border-b border-[#2A3942]">
      <div className="flex items-center gap-2 text-white truncate">
        <FiMessageSquare className="text-[#00A884]" />
        <div className="flex flex-col">
          <span className="font-semibold text-sm truncate">{nombre}</span>
          <span className="text-xs text-[#8696a0]">{est.replaceAll('_', ' ')}</span>
        </div>
      </div>

      {estaCerrado ? (
        onReabrir && (
          <button
            onClick={onReabrir}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-full transition"
            aria-label="Reabrir conversación"
          >
            Reabrir
          </button>
        )
      ) : (
        mostrarBotonCerrar && (
          <button
            onClick={onCerrar}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full transition"
            aria-label="Cerrar conversación"
          >
            Cerrar
          </button>
        )
      )}
    </header>
  )
}
