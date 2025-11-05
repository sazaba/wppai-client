// ChatHeader.tsx
'use client'

import React from 'react'
import axios from '@/lib/axios'
import Swal from 'sweetalert2'
import { Menu } from '@headlessui/react'
import { useAuth } from '../../../context/AuthContext'
import { FiMessageSquare, FiChevronDown } from 'react-icons/fi'

interface ChatHeaderProps {
  chatId: number
  nombre: string
  estado?: string
  onCerrar: () => void
  onReabrir?: () => void
  onEliminar?: () => void
  mostrarBotonCerrar?: boolean
  /** Opcional: si quieres actualizar lista/estado en el padre además del socket */
  onEstadoCambiado?: (nuevo: string) => void
}

const ESTADOS_MANUALES = [
  'pendiente',
  'en_proceso',
  'respondido',
  'requiere_agente',
  'agendado',
  'cerrado',
] as const

export default function ChatHeader({
  chatId,
  nombre,
  estado,
  onCerrar,
  onReabrir,
  onEliminar,
  mostrarBotonCerrar = true,
  onEstadoCambiado,
}: ChatHeaderProps) {
  const { token } = useAuth() as any
  const est = estado ?? ''
  const estaCerrado = est === 'cerrado'

  const handleCambiarEstado = async (nuevo: string) => {
    try {
      await axios.put(
        `/api/chats/${chatId}/estado`,
        { estado: nuevo },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Aviso breve
      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `Nuevo estado: ${nuevo.replace(/_/g, ' ')}`,
        timer: 1400,
        showConfirmButton: false,
        background: '#0B141A',
        color: '#e5e7eb',
      })

      onEstadoCambiado?.(nuevo)
      // Si el backend emite `chat_actualizado` por socket, también se reflejará automáticamente.
    } catch (err) {
      console.error('Error actualizando estado:', err)
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: 'Intenta de nuevo en unos segundos.',
        background: '#0B141A',
        color: '#e5e7eb',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#202C33] border-b border-[#2A3942]">
      <div className="flex items-center gap-3 text-white truncate">
        <FiMessageSquare className="text-[#00A884]" />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm truncate">{nombre}</span>

          {/* Etiqueta + menú de cambio de estado */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8696a0] truncate">
              {est.replaceAll('_', ' ')}
            </span>

            {!estaCerrado && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="flex items-center gap-1 text-xs bg-[#2A3942] px-2 py-1 rounded-md hover:bg-[#3B4A54]">
                  Cambiar estado
                  <FiChevronDown className="w-3 h-3" />
                </Menu.Button>
                <Menu.Items className="absolute left-0 mt-2 w-44 origin-top-left bg-[#2A3942] border border-[#3B4A54] rounded-md shadow-lg focus:outline-none text-sm z-20">
                  {ESTADOS_MANUALES.map((opt) => (
                    <Menu.Item key={opt}>
                      {({ active }) => (
                        <button
                          onClick={() => handleCambiarEstado(opt)}
                          className={`w-full text-left px-3 py-1.5 ${
                            active ? 'bg-[#3B4A54]' : ''
                          }`}
                        >
                          {opt.replace(/_/g, ' ')}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Menu>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Si está cerrado, muestra Reabrir + Eliminar; si no, muestra Cerrar */}
        {estaCerrado ? (
          <>
            {onReabrir && (
              <button
                onClick={onReabrir}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-full transition"
                aria-label="Reabrir conversación"
              >
                Reabrir
              </button>
            )}
            {onEliminar && (
              <button
                onClick={onEliminar}
                className="text-xs bg-[#8b0000] hover:bg-[#a40000] text-white px-3 py-1 rounded-full transition"
                aria-label="Eliminar conversación"
              >
                Eliminar
              </button>
            )}
          </>
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
      </div>
    </header>
  )
}
