'use client'

import type { ReactNode } from 'react'
import {
  FiSearch,
  FiLoader,
  FiInbox,
  FiClock,
  FiCheck,
  FiChevronDown,
  FiCalendar,
} from 'react-icons/fi'
import { Menu } from '@headlessui/react'

interface ChatSidebarProps {
  chats: any[]
  loading: boolean
  busqueda: string
  setBusqueda: (value: string) => void
  estadoFiltro: string
  setEstadoFiltro: (value: string) => void
  onSelectChat: (id: number) => void
  activoId: number | null

  // Dejamos las props para compatibilidad, pero este componente
  // ya NO usa estilos/íconos del padre para evitar que lo sobreescriban.
  estadoIconos?: Record<string, ReactNode>
  estadoEstilos?: Record<string, string>
}

/** Estados visibles en el filtro */
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
}: ChatSidebarProps) {
  // ——————————————————————————————
  // Iconos y estilos forzados (sin overrides del padre)
  // ——————————————————————————————
  const icono = (estado: string) => {
    if (estado === 'agendado')
      return <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
    if (estado === 'agendado_consulta')
      return <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
    if (estado === 'pendiente')
      return <FiClock className="inline-block" />
    if (estado === 'cerrado')
      return <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
    if (estado === 'respondido')
      return <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
    if (estado === 'en_proceso')
      return <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
    if (estado === 'requiere_agente')
      return <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
    return <FiInbox className="inline-block" />
  }

  const estilo = (estado: string) => {
    switch (estado) {
      case 'agendado':
        // 🟠 Naranja
        return 'bg-orange-900/30 text-orange-200 border border-orange-700'
      case 'agendado_consulta':
        // 🟢 Verde
        return 'bg-green-900/30 text-green-200 border border-green-700'
      default:
        return 'bg-[#202C33] text-[#cbd5e1]'
    }
  }

  const lista = Array.isArray(chats) ? chats : []

  const chatsFiltrados = lista.filter((chat) =>
    (estadoFiltro === 'todos' || (chat.estado ?? 'pendiente') === estadoFiltro) &&
    String(chat.nombre ?? chat.phone ?? '')
      .toLowerCase()
      .includes((busqueda || '').toLowerCase())
  )

  return (
    <aside className="w-full md:w-[30%] max-w-[400px] flex-shrink-0 bg-[#111B21] text-white flex flex-col h-full overflow-hidden">
      {/* Título */}
      <div className="p-4 flex items-center justify-between">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <FiInbox /> Chats
        </h1>
      </div>

      {/* Filtro */}
      <div className="px-4 py-2 text-sm text-[#8696a0]">
        <label className="mb-1 block">Filtrar por estado</label>
        <Menu as="div" className="relative w-full">
          <Menu.Button className="w-full inline-flex justify-between items-center px-4 py-2 bg-[#202C33] text-sm text-white rounded-md hover:bg-[#2a3942]">
            {estadoFiltro === 'todos'
              ? 'Todos'
              : estadoFiltro.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            <FiChevronDown className="w-4 h-4 ml-2" />
          </Menu.Button>

          <Menu.Items className="absolute z-10 mt-2 w-full bg-[#202C33] border border-[#2a3942] rounded-md shadow-lg max-h-60 overflow-auto text-sm text-white">
            {estados.map((estado) => {
              const label =
                estado === 'todos'
                  ? 'Todos'
                  : estado.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

              const count =
                estado === 'todos'
                  ? lista.length
                  : lista.filter((c) => (c.estado ?? 'pendiente') === estado).length

              const selected = estadoFiltro === estado

              return (
                <Menu.Item key={estado}>
                  {({ active }) => (
                    <button
                      onClick={() => setEstadoFiltro(estado)}
                      className={`w-full px-4 py-2 flex justify-between items-center ${active ? 'bg-[#2A3942]' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        {icono(estado)} {label} ({count})
                      </span>
                      {selected && <FiCheck className="w-4 h-4 text-green-400" />}
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </Menu.Items>
        </Menu>
      </div>

      {/* Buscador */}
      <div className="relative px-4 py-2">
        <FiSearch className="absolute left-6 top-[1.3rem] text-[#8696a0]" />
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-[#202C33] text-white rounded-md border-none focus:outline-none focus:ring-2 focus:ring-[#00A884] text-sm placeholder:text-[#8696a0]"
        />
      </div>

      {/* Lista */}
      <ul className="flex-1 overflow-y-auto px-2 pb-4 space-y-2 scrollbar-thin scrollbar-thumb-[#374045] scrollbar-track-transparent">
        {loading ? (
          <p className="text-[#8696a0] text-sm px-4 flex items-center gap-2">
            <FiLoader className="animate-spin" /> Cargando conversaciones...
          </p>
        ) : chatsFiltrados.length === 0 ? (
          <p className="text-[#8696a0] text-sm px-4 flex items-center gap-2">
            <FiInbox /> No hay coincidencias
          </p>
        ) : (
          chatsFiltrados.map((chat) => (
            <li
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-3 rounded-md cursor-pointer transition-all ${
                chat.id === activoId ? 'bg-[#2A3942]' : 'hover:bg-[#202C33]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold truncate max-w-[160px]">
                  {chat.nombre ?? chat.phone}
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${estilo(
                    chat.estado ?? 'pendiente'
                  )}`}
                >
                  {icono(chat.estado ?? 'pendiente')}{' '}
                  {(chat.estado ?? 'pendiente').replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-[#8696a0] truncate">{chat.mensaje}</p>
              <p className="text-[10px] text-[#5b6b75] flex items-center gap-1">
                <FiClock className="inline-block" />
                {chat.fecha
                  ? new Date(chat.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </li>
          ))
        )}
      </ul>
    </aside>
  )
}
