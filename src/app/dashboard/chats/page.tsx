'use client'

import { useEffect, useRef, useState } from 'react'
import { FiClock } from 'react-icons/fi'
import { responderConIA } from '@/lib/chatService'
import socket from '@/lib/socket'
import axios from '@/lib/axios' // ← tu instancia personalizada con el token


import ChatSidebar from './components/ChatSidebar'
import ChatHeader from './components/ChatHeader'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import ChatModalCerrar from './components/ChatModalCerrar'

const estadoIconos = {
  pendiente: <FiClock className="inline mr-1 animate-spin" />,
  respondido: <span className="inline-block w-2 h-2 bg-green-400 rounded-full" />,
  en_proceso: <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" />,
  requiere_agente: <span className="inline-block w-2 h-2 bg-red-400 rounded-full" />,
  cerrado: <span className="inline-block w-2 h-2 bg-gray-400 rounded-full" />
}

const estadoEstilos = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  respondido: 'bg-green-100 text-green-700',
  en_proceso: 'bg-blue-100 text-blue-700',
  requiere_agente: 'bg-red-100 text-red-700',
  cerrado: 'bg-gray-100 text-gray-600'
}

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
          const res = await axios.get('/api/chats')
          setChats(res.data)
        } catch (error) {
          console.error('Error al cargar conversaciones:', error)
          setChats([])
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

      if (msg.conversationId === activoId) {
        setMensajes((prev) => ordenarMensajes([...prev, nuevo]))
      }

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
      if (chatActual?.estado === 'pendiente') {
        await axios.put(`/api/chats/${chatId}/estado`, { estado: 'en_proceso' })
      }
  
      const res = await axios.get(`/api/chats/${chatId}/messages?page=1&limit=20`)
      setMensajes(ordenarMensajes(res.data.messages))
      setHasMore(res.data.pagination.hasMore)
    } catch (err) {
      console.error('Error al cargar mensajes:', err)
    }
  }
  

  const handleLoadMore = async () => {
    if (!activoId) return
    const nextPage = page + 1
  
    try {
      const res = await axios.get(`/api/chats/${activoId}/messages?page=${nextPage}&limit=20`)
      setMensajes((prev) => ordenarMensajes([...res.data.messages, ...prev]))
      setPage(nextPage)
      setHasMore(res.data.pagination.hasMore)
    } catch (err) {
      console.error('Error al cargar más mensajes:', err)
    }
  }
  

  const handleSendMessage = async () => {
    if (!respuesta.trim() || !activoId) return

    const chatActual = chats.find((c) => c.id === activoId)
    const timestamp = new Date().toISOString()
    setRespuesta('')

    if (chatActual?.estado !== 'cerrado') {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${activoId}/responder-manual`,
          { contenido: respuesta }
        )

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activoId ? { ...chat, estado: 'requiere_agente' } : chat
          )
        )
      } catch (err) {
        console.error('Error al responder manualmente:', err)
      }
      return
    }

    const nuevoMensaje = {
      from: 'client',
      contenido: respuesta,
      timestamp
    }

    setMensajes((prev) => ordenarMensajes([...prev, nuevoMensaje]))

    try {
      const res = await responderConIA({
        chatId: activoId,
        mensaje: respuesta,
        intentosFallidos: 0
      })

      if (res.estado === 'requiere_agente') {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activoId ? { ...chat, estado: 'requiere_agente' } : chat
          )
        )

        if (audioRef.current) audioRef.current.play()
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }

      const respuestaIA = {
        from: 'bot',
        contenido: res.mensaje,
        timestamp: new Date().toISOString()
      }

      setMensajes((prev) => ordenarMensajes([...prev, respuestaIA]))
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activoId ? { ...chat, estado: 'respondido' } : chat
        )
      )
    } catch (err) {
      console.error('Error al responder con IA:', err)
    }
  }

  const handleCerrarConversacion = async () => {
    if (!activoId) return
  
    try {
      await axios.put(`/api/chats/${activoId}/estado`, {
        estado: 'cerrado'
      })
  
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activoId ? { ...chat, estado: 'cerrado' } : chat
        )
      )
  
      if (estadoFiltro !== 'todos') {
        setActivoId(null)
        setMensajes([])
      }
    } catch (err) {
      console.error('Error al cerrar conversación:', err)
    }
  }
  
  const ordenarMensajes = (mensajes: any[]) => {
    return [...mensajes].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeA - timeB
    })
  }

  return (
    <div className="flex h-full max-h-screen bg-[#111b21] text-white overflow-hidden">
      <ChatSidebar
        chats={chats}
        loading={loading}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        estadoFiltro={estadoFiltro}
        setEstadoFiltro={setEstadoFiltro}
        onSelectChat={handleSelectChat}
        activoId={activoId}
        estadoIconos={estadoIconos}
        estadoEstilos={estadoEstilos}
      />

      <section className="flex-1 flex flex-col h-full bg-[#0B141A] overflow-hidden">
        {activoId ? (
          <>
            <ChatHeader
              nombre={chats.find((c) => c.id === activoId)?.nombre || ''}
              estado={chats.find((c) => c.id === activoId)?.estado || ''}
              onCerrar={() => setMostrarModalCerrar(true)}
              mostrarBotonCerrar={true}
            />

            <ChatMessages
              mensajes={mensajes}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />

            <ChatInput
              value={respuesta}
              onChange={setRespuesta}
              onSend={handleSendMessage}
              disabled={chats.find((c) => c.id === activoId)?.estado === 'cerrado'}
            />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            <FiClock className="w-5 h-5 mr-2" /> Selecciona una conversación para comenzar
          </div>
        )}
      </section>

      {mostrarModalCerrar && (
        <ChatModalCerrar
          onClose={() => setMostrarModalCerrar(false)}
          onConfirm={handleCerrarConversacion}
        />
      )}
    </div>
  )
}
