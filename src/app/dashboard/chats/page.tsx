'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock, Search } from 'lucide-react'
import { responderConIA } from '@/lib/chatService'
import socket from '@/lib/socket'
import axios from 'axios'


import { FiClock, FiSearch, FiSend, FiInbox, FiLoader, FiCheckCircle, FiPlay, FiAlertCircle, FiMessageSquare, FiFilter, FiChevronDown, FiCheck, FiArrowDown } from 'react-icons/fi';

import { Menu } from '@headlessui/react'



const estadoIconos = {
  pendiente: <FiLoader className="inline mr-1" />,
  respondido: <FiCheckCircle className="inline mr-1" />,
  en_proceso: <FiPlay className="inline mr-1" />,
  requiere_agente: <FiAlertCircle className="inline mr-1" />,
  cerrado: <FiInbox className="inline mr-1" />,
};
const estados = ['todos', 'pendiente', 'en_proceso', 'respondido', 'requiere_agente', 'cerrado'];

const estadoEstilos = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  respondido: 'bg-green-100 text-green-700',
  en_proceso: 'bg-blue-100 text-blue-700',
  requiere_agente: 'bg-red-100 text-red-700',
  cerrado: 'bg-gray-100 text-gray-600'
};



export default function ChatsPage() {
  const [chats, setChats] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [activoId, setActivoId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [mensajes, setMensajes] = useState<any[]>([])
  const [respuesta, setRespuesta] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [mostrarModalCerrar, setMostrarModalCerrar] = useState(false)


  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats`)
        const data = await res.json()
        setChats(data)
      } catch (error) {
        console.error('Error al cargar conversaciones:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [])

    useEffect(() => {
      const handleNuevoMensaje = (msg: any) => {
        const nuevo = {
          from: msg.from,
          contenido: msg.contenido,
          timestamp: msg.timestamp
        }
      
        // ✅ Si el chat está abierto, actualiza el historial en pantalla
        if (msg.conversationId === activoId) {
          setMensajes((prev) => ordenarMensajes([...prev, nuevo]))
        }
      
        // ✅ Siempre actualiza la card izquierda (cliente o bot)
        setChats((prev) => {
          const existe = prev.find((c) => c.id === msg.conversationId)
      
          if (existe) {
            return prev.map((chat) =>
              chat.id === msg.conversationId
                ? {
                    ...chat,
                    mensaje: msg.contenido,
                    estado: msg.estado ?? chat.estado,
                    fecha: msg.timestamp
                  }
                : chat
            )
          } else {
            return [
              {
                id: msg.conversationId,
                nombre: msg.nombre ?? msg.conversationId,
                estado: msg.estado ?? 'pendiente',
                mensaje: msg.contenido,
                fecha: msg.timestamp
              },
              ...prev
            ]
          }
        })
      }
      
    
      socket.on('nuevo_mensaje', handleNuevoMensaje)
      socket.on('chat_actualizado', (data) => {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === data.id ? { ...chat, estado: data.estado } : chat
          )
        )
      })
      
    
      return () => {
        socket.off('nuevo_mensaje', handleNuevoMensaje)
        socket.off('chat_actualizado')

      }
    }, [activoId])
  
  
    const handleSelectChat = async (chatId: number) => {
      setActivoId(chatId)
      setMensajes([])
      setPage(1)
    
      try {
        const chatActual = chats.find((c) => c.id === chatId)
    
        // ✅ Solo cambiar a "en_proceso" si estaba en "pendiente"
        if (chatActual?.estado === 'pendiente') {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/${chatId}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'en_proceso' })
          })
        }
    
        // Cargar mensajes
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/${chatId}/messages?page=1&limit=20`)
        const data = await res.json()
    
        setMensajes(ordenarMensajes(data.messages))
        setHasMore(data.pagination.hasMore)
      } catch (err) {
        console.error('Error al cargar mensajes o actualizar estado:', err)
      }
    }
    
    
  

  const handleLoadMore = async () => {
    if (!activoId) return
    const nextPage = page + 1
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/${activoId}/messages?page=${nextPage}&limit=20`)
      const data = await res.json()
  
      setMensajes((prev) => ordenarMensajes([...data.messages, ...prev]))
      setPage(nextPage)
      setHasMore(data.pagination.hasMore)
    } catch (err) {
      console.error('Error al cargar más mensajes:', err)
    }
  }
  

  const handleSendMessage = async () => {
    if (!respuesta.trim() || !activoId) return;
  
    const chatActual = chats.find((c) => c.id === activoId);
    const timestamp = new Date().toISOString();
    setRespuesta('');
  
    if (chatActual?.estado !== 'cerrado') {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${activoId}/responder-manual`,
          { contenido: respuesta }
        );
  
        // ❌ Ya no agregamos el mensaje manualmente
        // Esperamos que llegue por WebSocket
  
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activoId ? { ...chat, estado: 'requiere_agente' } : chat
          )
        );
      } catch (err) {
        console.error('❌ Error al responder manualmente:', err);
      }
      return;
    }
  
    const nuevoMensaje = {
      from: 'client',
      contenido: respuesta,
      timestamp,
    };
  
    // ✅ Este sí lo mostramos manualmente porque no viene por WebSocket
    setMensajes((prev) => ordenarMensajes([...prev, nuevoMensaje]));
  
    try {
      const res = await responderConIA({
        chatId: activoId,
        mensaje: respuesta,
        intentosFallidos: 0,
      });
  
      if (res.estado === 'requiere_agente') {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activoId ? { ...chat, estado: 'requiere_agente' } : chat
          )
        );
  
        if (audioRef.current) audioRef.current.play();
        if (navigator.vibrate) navigator.vibrate(200);
        return;
      }
  
      const respuestaIA = {
        from: 'bot',
        contenido: res.mensaje,
        timestamp: new Date().toISOString(),
      };
  
      setMensajes((prev) => ordenarMensajes([...prev, respuestaIA]));
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activoId ? { ...chat, estado: 'respondido' } : chat
        )
      );
    } catch (err) {
      console.error('Error al responder con IA:', err);
    }
  };
  
  
  

  const chatsFiltrados = chats.filter((chat) =>
    (estadoFiltro === 'todos' || chat.estado === estadoFiltro) &&
    chat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const requiereAgenteCount = chats.filter(c => c.estado === 'requiere_agente').length

  const ordenarMensajes = (mensajes: any[]) => {
    return [...mensajes].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      if (timeA === timeB) {
        return a.id - b.id
      }
      return timeA - timeB
    })
  }
  
  const handleCerrarConversacion = async () => {
    if (!activoId) return
  
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chats/${activoId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cerrado' })
      })
  
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activoId ? { ...chat, estado: 'cerrado' } : chat
        )
      )
  
      // Si estamos filtrando por otro estado, ocultar chat cerrado
      if (estadoFiltro !== 'todos') {
        setActivoId(null)
        setMensajes([])
      }
    } catch (err) {
      console.error('Error al cerrar conversación:', err)
    }
  }


  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  
  // Scroll al último mensaje cuando llegan nuevos
  useEffect(() => {
    if (isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajes])
  
  // Detectar si el usuario está abajo del todo
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsAtBottom(isBottom)
  }
  
  // Forzar scroll manual
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  

  
  
  return (
    <div className="flex flex-col md:flex-row h-[95%] max-h-screen bg-white text-gray-800 overflow-hidden rounded-2xl">
    
  
      {/* Sidebar */}
      <aside className="w-full md:w-[30%] max-w-[400px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-[95%] overflow-hidden">

        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-gray-800 font-bold text-xl flex items-center gap-2">
            <FiMessageSquare /> Chats
          </h1>
        </div>
  
        <div className="px-4 py-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Filtrar por estado
  </label>

  <Menu as="div" className="relative inline-block w-full text-left">
    <Menu.Button className="w-full inline-flex justify-between items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
      {estadoFiltro === 'todos'
        ? 'Todos'
        : estadoFiltro.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      <FiChevronDown className="w-4 h-4 ml-2" />
    </Menu.Button>

    <Menu.Items className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
      {estados.map((estado) => {
        const label =
          estado === 'todos'
            ? 'Todos'
            : estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

        const count =
          estado === 'todos'
            ? chats.length
            : chats.filter((c) => c.estado === estado).length

        const selected = estadoFiltro === estado

        return (
          <Menu.Item key={estado}>
            {({ active }) => (
              <button
                onClick={() => setEstadoFiltro(estado)}
                className={`w-full px-4 py-2 text-sm text-left flex justify-between items-center ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  {estadoIconos[estado as keyof typeof estadoIconos]}
                  {label} ({count})
                </span>
                {selected && <FiCheck className="w-4 h-4 text-indigo-600" />}
              </button>
            )}
          </Menu.Item>
        )
      })}
    </Menu.Items>
  </Menu>
</div>


  
        <div className="relative px-4 py-2">
          <FiSearch className="absolute left-6 top-[1.3rem] text-gray-400" />
          <input
            type="text"
            placeholder="Buscar nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-100 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
  
        <ul className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {loading ? (
            <p className="text-gray-500 text-sm px-2 flex items-center gap-1"><FiLoader className="animate-spin" /> Cargando conversaciones...</p>
          ) : chatsFiltrados.length === 0 ? (
            <p className="text-gray-400 text-sm px-2 flex items-center gap-1"><FiInbox /> No hay coincidencias</p>
          ) : (
            chatsFiltrados.map((chat) => (
              <li
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-3 rounded-lg flex flex-col gap-1 border cursor-pointer transition ${
                  chat.id === activoId ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                    {chat.nombre}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    estadoEstilos[chat.estado as keyof typeof estadoEstilos]
                  }`}>
                    {estadoIconos[chat.estado as keyof typeof estadoIconos]}{chat.estado.replace('_', ' ')}

                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.mensaje}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1"><FiClock /> {new Date(chat.fecha).toLocaleTimeString()}</p>
              </li>
            ))
          )}
        </ul>
      </aside>
  
      {/* Panel derecho */}
      <section className="flex-1 h-[95%] flex flex-col bg-gray-50 overflow-hidden">
  {activoId ? (
    <>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h2 className="text-gray-800 font-bold truncate flex items-center gap-2">
          <FiMessageSquare /> {chats.find((c) => c.id === activoId)?.nombre}
        </h2>
        {chats.find((c) => c.id === activoId)?.estado !== 'cerrado' && (
          <button
            onClick={() => setMostrarModalCerrar(true)}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-full"
          >
            Cerrar
          </button>
        )}
      </header>

     {/* Área de mensajes */}
<div
  className="flex-1 overflow-y-auto px-4 pt-2 pb-4 flex flex-col gap-1 relative"
  onScroll={handleScroll}
>
  {hasMore && (
    <button
      onClick={handleLoadMore}
      className="text-xs text-indigo-500 hover:underline self-center"
    >
      Ver anteriores
    </button>
  )}

  {mensajes.map((msg, index) => (
    <div
      key={index}
      className={`max-w-[80%] px-4 py-2 rounded-xl text-sm break-words whitespace-pre-wrap shadow-sm ${
        msg.from === 'client'
          ? 'bg-gray-200 text-gray-800 self-start'
          : 'bg-indigo-600 text-white self-end ml-auto'
      }`}
    >
      {msg.contenido}
      <div className="text-[10px] text-gray-800 mt-1 text-right flex items-center gap-1 justify-end">
        <FiClock />{' '}
        {new Date(msg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  ))}

  {/* Ancla al fondo para scroll automático */}
  <div ref={bottomRef} />

  {/* Botón flotante para bajar al final */}
  {!isAtBottom && (
    <button
      onClick={scrollToBottom}
      className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700 transition"
    >
      <FiArrowDown className="w-4 h-4" />
    </button>
  )}
</div>


      {/* Footer */}
      <footer className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            placeholder="Escribe un mensaje..."
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            disabled={chats.find((c) => c.id === activoId)?.estado === 'cerrado'}
            className="flex-1 resize-none bg-gray-100 text-gray-800 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={chats.find((c) => c.id === activoId)?.estado === 'cerrado'}
            className="px-4 py-2 rounded-md text-sm font-semibold text-white transition disabled:bg-gray-400 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            <FiSend className="text-white" /> Enviar
          </button>
        </div>
      </footer>
    </>
  ) : (
    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
      <FiClock className="w-5 h-5 mr-2" /> Selecciona una conversación para comenzar
    </div>
  )}
</section>

  
      {/* Modal */}
      {mostrarModalCerrar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-2">¿Cerrar conversación?</h2>
            <p className="text-gray-500 text-sm mb-4">
              No se podrán enviar más mensajes una vez cerrada.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMostrarModalCerrar(false)}
                className="px-4 py-2 text-sm rounded-md text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleCerrarConversacion()
                  setMostrarModalCerrar(false)
                }}
                className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar cierre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
  
  
  
  
}
