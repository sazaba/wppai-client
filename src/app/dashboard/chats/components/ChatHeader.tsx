'use client'

import { FiMessageSquare, FiX } from 'react-icons/fi'

interface ChatHeaderProps {
  nombre: string
  estado: string
  onCerrar: () => void
  mostrarBotonCerrar?: boolean
}

export default function ChatHeader({ nombre, estado, onCerrar, mostrarBotonCerrar }: ChatHeaderProps) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#202C33] border-b border-[#2A3942]">
      <div className="flex items-center gap-2 text-white truncate">
        <FiMessageSquare className="text-[#00A884]" />
        <div className="flex flex-col">
          <span className="font-semibold text-sm truncate">{nombre}</span>
          <span className="text-xs text-[#8696a0]">{estado.replace('_', ' ')}</span>
        </div>
      </div>

      {mostrarBotonCerrar && (
        <button
          onClick={onCerrar}
          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full transition"
        >
          Cerrar
        </button>
      )}
    </header>
  )
}
