'use client'

import { Fragment, type ReactNode } from 'react'
import {
  FiSearch,
  FiInbox,
  FiChevronDown,
  FiCheck,
  FiFilter
} from 'react-icons/fi'
import { Menu, Transition } from '@headlessui/react'
import clsx from 'clsx'

interface ChatSidebarProps {
  chats: any[]
  loading: boolean
  busqueda: string
  setBusqueda: (value: string) => void
  estadoFiltro: string
  setEstadoFiltro: (value: string) => void
  onSelectChat: (id: number) => void
  activoId: number | null
  // Recibimos los estilos premium del padre
  estadoIconos?: Record<string, ReactNode>
  estadoEstilos?: Record<string, string>
}

const estados = [
  'todos',
  'pendiente',
  'en_proceso',
  'respondido',
  'requiere_agente',
  'agendado_consulta',
  'agendado',
  'cerrado',
] as const

export default function ChatSidebar({
  chats,
  loading,
  busqueda,
  setBusqueda,
  estadoFiltro,
  setEstadoFiltro,
  onSelectChat,
  activoId,
  estadoIconos,
  estadoEstilos,
}: ChatSidebarProps) {
  
  const lista = Array.isArray(chats) ? chats : []

  const chatsFiltrados = lista.filter((chat) =>
    (estadoFiltro === 'todos' || (chat.estado ?? 'pendiente') === estadoFiltro) &&
    String(chat.nombre ?? chat.phone ?? '')
      .toLowerCase()
      .includes((busqueda || '').toLowerCase())
  )

  return (
    // CAMBIO: Quitamos anchos fijos y bg sólido. Usamos h-full y transparente para heredar el glassmorphism del padre.
    <aside className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      
      {/* --- HEADER SIDEBAR --- */}
      <div className="p-5 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold text-xl text-white flex items-center gap-2 tracking-tight">
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <FiInbox className="w-5 h-5" />
            </span>
            Mensajes
            <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                {chatsFiltrados.length}
            </span>
          </h1>
          
          {/* Menu Filtro Premium */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                <FiFilter className="w-5 h-5" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-[#1a202c] border border-white/10 shadow-2xl focus:outline-none z-50 overflow-hidden ring-1 ring-black/5">
                <div className="p-1">
                    {estados.map((estado) => {
                    const label = estado === 'todos' ? 'Todos' : estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    const selected = estadoFiltro === estado
                    
                    return (
                        <Menu.Item key={estado}>
                        {({ active }) => (
                            <button
                            onClick={() => setEstadoFiltro(estado)}
                            className={clsx(
                                'group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                                active ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-400',
                                selected && 'bg-indigo-500/20 text-indigo-300 font-medium'
                            )}
                            >
                            <span className="flex items-center gap-2">
                                {/* Usamos el icono que viene del padre si existe */}
                                {estadoIconos?.[estado] && <span className="scale-75">{estadoIconos[estado]}</span>}
                                {label}
                            </span>
                            {selected && <FiCheck className="w-4 h-4" />}
                            </button>
                        )}
                        </Menu.Item>
                    )
                    })}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Buscador Estilizado */}
        <div className="relative group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/5 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-zinc-900/80 transition-all"
          />
        </div>
      </div>

      {/* --- LISTA DE CHATS --- */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
             <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
             <p className="text-xs text-zinc-500">Cargando chats...</p>
          </div>
        ) : chatsFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <FiInbox className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">No se encontraron chats</p>
          </div>
        ) : (
          chatsFiltrados.map((chat) => {
            const isActive = chat.id === activoId
            // Generar iniciales
            const iniciales = (chat.nombre || chat.phone || '?').substring(0, 2).toUpperCase()
            
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={clsx(
                  'w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left group relative overflow-hidden',
                  isActive 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-lg shadow-indigo-900/10' 
                    : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                )}
              >
                {/* Indicador activo lateral */}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />}

                {/* Avatar / Iniciales */}
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm transition-colors",
                    isActive ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700"
                )}>
                    {iniciales}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={clsx(
                        "text-sm font-medium truncate",
                        isActive ? "text-white" : "text-zinc-300 group-hover:text-zinc-200"
                    )}>
                      {chat.nombre ?? chat.phone}
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-2 shrink-0">
                      {chat.fecha
                        ? new Date(chat.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>

                  <p className={clsx(
                      "text-xs truncate mb-2",
                      isActive ? "text-indigo-200/70" : "text-zinc-500 group-hover:text-zinc-400"
                  )}>
                    {chat.mensaje || 'Nueva conversación'}
                  </p>

                  {/* Badges de Estado */}
                  <div className="flex items-center gap-2">
                    {/* Badge del estado actual */}
                    <span className={clsx(
                        "text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 w-fit",
                        estadoEstilos?.[chat.estado] || 'bg-zinc-800 text-zinc-400'
                    )}>
                        {estadoIconos?.[chat.estado]}
                        {(chat.estado ?? 'pendiente').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}