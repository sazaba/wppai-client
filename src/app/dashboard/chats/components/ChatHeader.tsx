// ChatHeader.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import axios from '@/lib/axios'
import Swal from 'sweetalert2'
import { Menu } from '@headlessui/react'
import { createPortal } from 'react-dom'
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
  onEstadoCambiado?: (nuevo: string) => void
}

// Estados manuales visibles (post-agenda + control humano)
const ESTADOS_MANUALES = [
  // 'pendiente',
  // 'en_proceso',
  'respondido',
  'requiere_agente',
  'agendado',
  // 'agendado_consulta',
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

  // —— Medimos el botón para posicionar el menú en un portal (evita overflow clipping)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  })

  const measure = () => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setCoords({ top: r.bottom + 6, left: r.left, width: r.width, height: r.height })
  }

  useEffect(() => {
    if (!open) return
    measure()
    const onScroll = () => measure()
    const onResize = () => measure()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleCambiarEstado = async (nuevo: string) => {
    try {
      await axios.put(
        `/api/chats/${chatId}/estado`,
        { estado: nuevo },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      await Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `Nuevo estado: ${nuevo.replace(/_/g, ' ')}`,
        timer: 1300,
        showConfirmButton: false,
        background: '#0B141A',
        color: '#e5e7eb',
      })

      onEstadoCambiado?.(nuevo)
      setOpen(false)
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

  // ——— UI
  return (
    <header className="relative z-30 flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#202C33] border-b border-[#2A3942]">
      <div className="flex items-center gap-3 text-white truncate">
        <FiMessageSquare className="text-[#00A884]" />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm truncate">{nombre}</span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8696a0] truncate">{est.replaceAll('_', ' ')}</span>

            {!estaCerrado && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button
                  ref={btnRef}
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-1 text-xs bg-[#2A3942] px-2 py-1 rounded-md hover:bg-[#3B4A54] focus:outline-none"
                >
                  Cambiar estado
                  <FiChevronDown className="w-3 h-3" />
                </Menu.Button>

                {/* Portal del menú para escapar de overflows */}
                {open &&
                  createPortal(
                    <div
                      className="fixed z-[1000] min-w-[11rem] bg-[#2A3942] border border-[#3B4A54] rounded-md shadow-xl text-sm text-white overflow-hidden"
                      style={{ top: coords.top, left: coords.left }}
                    >
                      <div className="py-1">
                        {ESTADOS_MANUALES.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleCambiarEstado(opt)}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#3B4A54]"
                          >
                            {opt.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                      <div className="py-1 border-t border-[#3B4A54]">
                        <button
                          onClick={() => setOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-[#cbd5e1] hover:bg-[#3B4A54]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>,
                    document.body
                  )}
              </Menu>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
