'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FiClock, FiAlertTriangle } from 'react-icons/fi'
import { responderConIA } from '@/lib/chatService'
import socket from '@/lib/socket'
import axios from '@/lib/axios'

import ChatSidebar from './components/ChatSidebar'
import ChatHeader from './components/ChatHeader'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import ChatModalCerrar from './components/ChatModalCerrar'
import ChatModalCrear from './components/ChatModalCrear'
import { useAuth } from '@/app/context/AuthContext'

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
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false)

  // 🚨 Errores de política (24h cerrada) por conversación
  const [policyErrors, setPolicyErrors] = useState<Record<number, { code?: number; message: string }>>({})

  const { token } = useAuth()

  // ------- utils de dedupe/orden -------
  const keyOf = useCallback((m: any) => {
    // soporta backend con externalId o con firma
    return m.externalId ?? `${m.from}|${m.timestamp}|${m.contenido}`
  }, [])

  const ordenarMensajes = useCallback(
    (arr: any[]) => [...arr].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    []
  )

  const mergeUnique = useCallback((prev: any[], incoming: any[]) => {
    const seen = new Set(prev.map(keyOf))
    const toAdd = incoming.filter(m => {
      const k = keyOf(m)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    return ordenarMensajes([...prev, ...toAdd])
  }, [keyOf, ordenarMensajes])

  // ------- carga de chats -------
  useEffect(() => {
    if (!token) return
    const fetchChats = async () => {
      try {
        const res = await axios.get('/api/chats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setChats(res.data)
      } catch (err) {
        console.error('❌ Error al cargar chats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [token])

  // ------- handlers de socket -------
  const handleNuevoMensaje = useCallback((msg: any) => {
    // admitir shape {conversationId, message:{...}} o plano
    const payload = msg.message ?? msg
    const nuevo = {
      id: payload.id,
      externalId: payload.externalId,
      from: payload.from,            // 'client' | 'bot' | 'agent'
      contenido: payload.contenido ?? payload.body ?? '',
      timestamp: payload.timestamp ?? payload.createdAt
    }

    if (msg.conversationId === activoId) {
      setMensajes(prev => mergeUnique(prev, [nuevo]))
    }

    // si el cliente vuelve a escribir, limpiamos el banner (reabrió 24h)
    if (payload.from === 'client' && msg.conversationId) {
      setPolicyErrors(prev => {
        if (!(msg.conversationId in prev)) return prev
        const { [msg.conversationId]: _omit, ...rest } = prev
        return rest
      })
    }

    // actualizar tarjeta de la lista
    setChats(prev => {
      const existe = prev.find(c => c.id === msg.conversationId)
      if (existe) {
        return prev.map(chat =>
          chat.id === msg.conversationId
            ? { ...chat, mensaje: nuevo.contenido, estado: msg.estado ?? chat.estado, fecha: nuevo.timestamp }
            : chat
        )
      } else {
        return [
          { id: msg.conversationId, nombre: msg.nombre ?? msg.conversationId, estado: msg.estado ?? 'pendiente', mensaje: nuevo.contenido, fecha: nuevo.timestamp },
          ...prev
        ]
      }
    })
  }, [activoId, mergeUnique])

  const handleChatActualizado = useCallback((data: any) => {
    setChats(prev => prev.map(chat => (chat.id === data.id ? { ...chat, estado: data.estado } : chat)))
  }, [])

  const handlePolicyError = useCallback((payload: any) => {
    const { conversationId, code, message } = payload || {}
    if (!conversationId) return
    setPolicyErrors(prev => ({
      ...prev,
      [conversationId]: {
        code,
        message: message || 'Ventana de 24h cerrada. Se requiere plantilla para iniciar la conversación.'
      }
    }))
  }, [])

  useEffect(() => {
    socket.off('nuevo_mensaje', handleNuevoMensaje)
    socket.on('nuevo_mensaje', handleNuevoMensaje)

    socket.off('chat_actualizado', handleChatActualizado)
    socket.on('chat_actualizado', handleChatActualizado)

    socket.off('wa_policy_error', handlePolicyError)
    socket.on('wa_policy_error', handlePolicyError)

    return () => {
      socket.off('nuevo_mensaje', handleNuevoMensaje)
      socket.off('chat_actualizado', handleChatActualizado)
      socket.off('wa_policy_error', handlePolicyError)
    }
  }, [handleNuevoMensaje, handleChatActualizado, handlePolicyError])

  // ------- seleccionar chat / historial -------
  const handleSelectChat = async (chatId: number) => {
    setActivoId(chatId)
    setMensajes([])
    setPage(1)
    try {
      const chatActual = chats.find(c => c.id === chatId)
      if (chatActual?.estado === 'pendiente') {
        await axios.put(`/api/chats/${chatId}/estado`, { estado: 'en_proceso' }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      const res = await axios.get(`/api/chats/${chatId}/messages?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const mapped = res.data.messages.map((m: any) => ({
        id: m.id,
        externalId: m.externalId,
        from: m.from,
        contenido: m.contenido ?? m.body,
        timestamp: m.timestamp ?? m.createdAt
      }))

      setMensajes(ordenarMensajes(mapped))
      setHasMore(res.data.pagination.hasMore)
    } catch (err) {
      console.error('Error al cargar mensajes:', err)
    }
  }

  // ------- paginación -------
  const handleLoadMore = async () => {
    if (!activoId) return
    const nextPage = page + 1
    try {
      const res = await axios.get(`/api/chats/${activoId}/messages?page=${nextPage}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const mapped = res.data.messages.map((m: any) => ({
        id: m.id,
        externalId: m.externalId,
        from: m.from,
        contenido: m.contenido ?? m.body,
        timestamp: m.timestamp ?? m.createdAt
      }))
      setMensajes(prev => mergeUnique(mapped, prev)) // prepend único + previos
      setPage(nextPage)
      setHasMore(res.data.pagination.hasMore)
    } catch (err) {
      console.error('Error al cargar más mensajes:', err)
    }
  }

  // ------- enviar (manual/IA) -------
  const handleSendMessage = async () => {
    if (!respuesta.trim() || !activoId) return
    const chatActual = chats.find(c => c.id === activoId)
    const timestamp = new Date().toISOString()
    const msgCliente = { from: 'client', contenido: respuesta, timestamp }

    setRespuesta('')

    // si la conversación NO está cerrada → envío manual del agente
    if (chatActual?.estado !== 'cerrado') {
      try {
        // optimista seguro (se guarda como "manual" en backend)
        setMensajes(prev => mergeUnique(prev, [msgCliente]))
        await axios.post(`/api/chats/${activoId}/responder-manual`, { contenido: respuesta }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setChats(prev => prev.map(chat => (chat.id === activoId ? { ...chat, estado: 'requiere_agente' } : chat)))
      } catch (err) {
        console.error('Error al responder manualmente:', err)
      }
      return
    }

    // si está cerrada y tu flujo usa IA directa: agregamos solo el mensaje del cliente.
    setMensajes(prev => mergeUnique(prev, [msgCliente]))

    try {
      const res = await responderConIA({ chatId: activoId, mensaje: respuesta, intentosFallidos: 0 })
      if (res.estado === 'requiere_agente') {
        setChats(prev => prev.map(chat => (chat.id === activoId ? { ...chat, estado: 'requiere_agente' } : chat)))
        if (audioRef.current) audioRef.current.play()
        if (navigator.vibrate) navigator.vibrate(200)
        return
      }
      // no empujamos la respuesta del bot aquí; la insertará el backend y llegará por socket
      setChats(prev => prev.map(chat => (chat.id === activoId ? { ...chat, estado: 'respondido' } : chat)))
    } catch (err) {
      console.error('Error al responder con IA:', err)
    }
  }

  const handleCerrarConversacion = async () => {
    if (!activoId) return
    try {
      await axios.put(`/api/chats/${activoId}/estado`, { estado: 'cerrado' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChats(prev => prev.map(chat => (chat.id === activoId ? { ...chat, estado: 'cerrado' } : chat)))
      if (estadoFiltro !== 'todos') {
        setActivoId(null)
        setMensajes([])
      }
    } catch (err) {
      console.error('Error al cerrar conversación:', err)
    }
  }

  const handleCrearConversacion = async (data: { nombre?: string; phone: string }) => {
    try {
      const res = await axios.post('/api/chats', data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChats(prev => [res.data.chat, ...prev])
      setActivoId(res.data.chat.id)
      await handleSelectChat(res.data.chat.id)
      await axios.put(`/api/chats/${res.data.chat.id}/estado`, { estado: 'en_proceso' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMostrarModalCrear(false)
    } catch (err) {
      console.error('Error al crear conversación:', err)
    }
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
        onNuevaConversacion={() => setMostrarModalCrear(true)}
      />

      <section className="flex-1 flex flex-col h-full bg-[#0B141A] overflow-hidden">
        {activoId ? (
          <>
            <ChatHeader
              nombre={chats.find(c => c.id === activoId)?.nombre || ''}
              estado={chats.find(c => c.id === activoId)?.estado || ''}
              onCerrar={() => setMostrarModalCerrar(true)}
              mostrarBotonCerrar={true}
            />

            {/* Banner de ventana 24h cerrada */}
            {policyErrors[activoId] && (
              <div className="mx-6 mt-3 mb-1 rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 px-4 py-3 text-sm">
                <div className="flex items-start gap-2">
                  <FiAlertTriangle className="mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">Sesión de 24 h vencida</div>
                    <div className="opacity-90">
                      {policyErrors[activoId].message}
                      {policyErrors[activoId].code ? ` (código ${policyErrors[activoId].code})` : null}
                    </div>
                    <div className="mt-1 text-xs opacity-80">
                      Por ahora no se envían respuestas automáticas. Usa una plantilla aprobada para reabrir la conversación.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPolicyErrors(prev => {
                        const { [activoId!]: _omit, ...rest } = prev
                        return rest
                      })
                    }}
                    className="text-yellow-200/80 hover:text-yellow-100 text-xs"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            <ChatMessages
              mensajes={mensajes}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />

            <ChatInput
              value={respuesta}
              onChange={setRespuesta}
              onSend={handleSendMessage}
              disabled={chats.find(c => c.id === activoId)?.estado === 'cerrado'}
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
      {mostrarModalCrear && (
        <ChatModalCrear
          onClose={() => setMostrarModalCrear(false)}
          onCreate={handleCrearConversacion}
        />
      )}
    </div>
  )
}
