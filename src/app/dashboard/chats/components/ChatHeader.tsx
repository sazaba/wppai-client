'use client'

import React, { useEffect, useRef, useState, Fragment } from 'react'
import axios from '@/lib/axios'
import Swal from 'sweetalert2'
import { Menu, Transition } from '@headlessui/react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../../context/AuthContext'
import { FiMessageSquare, FiChevronDown, FiCheck, FiMoreVertical, FiTrash2, FiRefreshCw, FiXCircle } from 'react-icons/fi'
import clsx from 'clsx'

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
    setCoords({ top: r.bottom + 8, left: r.left, width: r.width, height: r.height })
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
        background: '#09090b',
        color: '#e5e7eb',
        customClass: { popup: 'border border-white/10 rounded-2xl' }
      })

      onEstadoCambiado?.(nuevo)
      setOpen(false)
    } catch (err) {
      console.error('Error actualizando estado:', err)
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: 'Intenta de nuevo en unos segundos.',
        background: '#09090b',
        color: '#e5e7eb',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  // Generar iniciales
  const iniciales = (nombre || '?').substring(0, 2).toUpperCase()

  return (
    // CAMBIO: Estilo Glassmorphism Premium
    <header className="relative z-30 flex-shrink-0 flex items-center justify-between px-6 py-4 bg-zinc-900/60 backdrop-blur-xl border-b border-white/5">
      
      {/* Lado Izquierdo: Info del Usuario */}
      <div className="flex items-center gap-4 text-white min-w-0">
        
        {/* Avatar Grande con Gradiente */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 shrink-0">
            {iniciales}
        </div>

        <div className="flex flex-col min-w-0">
          <h2 className="font-bold text-lg text-white truncate leading-tight tracking-tight">
            {nombre}
          </h2>

          <div className="flex items-center gap-3 mt-1">
            {/* Badge de Estado con Dot Brillante */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-xs text-zinc-300">
                <span className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    estaCerrado ? "bg-zinc-500" : "bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)] animate-pulse"
                )} />
                <span className="capitalize">{est.replaceAll('_', ' ')}</span>
            </div>

            {!estaCerrado && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button
                  ref={btnRef}
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-zinc-500 hover:text-indigo-400 transition-colors focus:outline-none"
                >
                  Cambiar
                  <FiChevronDown className="w-3 h-3" />
                </Menu.Button>

                {/* Portal del menú para escapar de overflows - Estilo Premium */}
                {open &&
                  createPortal(
                    <Transition
                      show={true}
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                        <div
                        className="fixed z-[9999] min-w-[12rem] bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/50"
                        style={{ top: coords.top, left: coords.left }}
                        >
                        <div className="p-1">
                            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5 mb-1">
                                Seleccionar Estado
                            </div>
                            {ESTADOS_MANUALES.map((opt) => {
                                const active = est === opt
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleCambiarEstado(opt)}
                                        className={clsx(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors",
                                        active ? "bg-indigo-500/10 text-indigo-300" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                        )}
                                    >
                                        <span className="capitalize">{opt.replace(/_/g, ' ')}</span>
                                        {active && <FiCheck className="w-4 h-4 text-indigo-400" />}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="p-1 border-t border-white/5 bg-black/20">
                            <button
                            onClick={() => setOpen(false)}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-white/5 transition-colors"
                            >
                            Cancelar
                            </button>
                        </div>
                        </div>
                    </Transition>,
                    document.body
                  )}
              </Menu>
            )}
          </div>
        </div>
      </div>

      {/* Lado Derecho: Acciones Rápidas */}
      <div className="flex items-center gap-2">
        {estaCerrado ? (
          <>
            {onReabrir && (
              <button
                onClick={onReabrir}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs font-bold uppercase tracking-wide"
                title="Reabrir conversación"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Reabrir</span>
              </button>
            )}
            {onEliminar && (
              <button
                onClick={onEliminar}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Eliminar conversación"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            )}
          </>
        ) : (
          mostrarBotonCerrar && (
            <button
              onClick={onCerrar}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all text-xs font-bold uppercase tracking-wide shadow-lg shadow-rose-900/10"
              title="Cerrar conversación"
            >
              <FiXCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Chat</span>
            </button>
          )
        )}
      </div>
    </header>
  )
}