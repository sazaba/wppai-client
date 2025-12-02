'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FiClock, FiAlertTriangle, FiLock, FiMessageSquare } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi' // Icono extra para el empty state
import socket from '@/lib/socket'
import axios from '@/lib/axios'
import Swal from 'sweetalert2'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion' // Agregamos framer-motion

import ChatSidebar from './components/ChatSidebar'
import ChatHeader from './components/ChatHeader'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import ChatModalCerrar from './components/ChatModalCerrar'
import ChatModalCrear from './components/ChatModalCrear'

import { useAuth } from '../../context/AuthContext'

// ——————————————————————————————
// Config de estados (Iconos)
// ——————————————————————————————
const estadoIconos = {
  pendiente: <FiClock className="inline mr-1 animate-spin text-amber-400" />,
  respondido: <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />,
  en_proceso: <span className="inline-block w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.6)]" />,
  requiere_agente: <span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />,
  agendado: <span className="inline-block w-2.5 h-2.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.6)]" />,
  agendado_consulta: <span className="inline-block w-2.5 h-2.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.6)]" />,
  cerrado: <span className="inline-block w-2.5 h-2.5 bg-zinc-600 rounded-full" />,
  todos: <span className="inline-block w-2.5 h-2.5 bg-zinc-500 rounded-full" />,
}

// Estilos de badge modernizados
const estadoEstilos = {
  pendiente: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  respondido: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  en_proceso: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  requiere_agente: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  agendado: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  agendado_consulta: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  cerrado: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  todos: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
}

export default function ChatsPage() {
  const [chats, setChats] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [activoId, setActivoId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [mensajes, setMensajes] = useState<any[]>([])
  const [respuesta, setRespuesta] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [mostrarModalCerrar, setMostrarModalCerrar] = useState(false)
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false)

  // 🔒 Estado de Bloqueo por Billing
  const [isBillingLocked, setIsBillingLocked] = useState(false)

  // 🚨 Errores de política (24h)
  const [policyErrors, setPolicyErrors] = useState<Record<number, { code?: number; message: string }>>({})

  const { token }: { token?: string } = useAuth() as any

  // 1. Verificar Estado de Billing (Bloqueo)
  useEffect(() => {
    if (!token) return
    const checkBilling = async () => {
        try {
            const res = await axios.get('/api/billing/status', {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Si isActiveForUse es false, bloqueamos
            const locked = res.data?.meta?.isActiveForUse === false
            setIsBillingLocked(locked)
        } catch (error) {
            console.error('Error verificando billing:', error)
        }
    }
    checkBilling()
  }, [token])

  // Dedupe / Orden
  const keyOf = useCallback(
    (m: any) =>
      m.id ??
      m.externalId ??
      (m.mediaId ? `mid:${m.mediaId}` : `${m.from}|${m.timestamp}|${m.contenido || ''}`),
    []
  )

  const ordenarMensajes = useCallback(
    (arr: any[]) =>
      [...arr].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    []
  )

  const mergeUnique = useCallback(
    (prev: any[], incoming: any[]) => {
      const seen = new Set(prev.map(keyOf))
      const toAdd = incoming.filter((m) => {
        const k = keyOf(m)
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      return ordenarMensajes([...prev, ...toAdd])
    },
    [keyOf, ordenarMensajes]
  )

  // Cargar lista de chats
  useEffect(() => {
    if (!token) return
    const fetchChats = async () => {
      try {
        const res = await axios.get('/api/chats', { headers: { Authorization: `Bearer ${token}` } })
        setChats(res.data)
      } catch (err) {
        console.error('❌ Error al cargar chats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [token])

  // Sockets
  const handleNuevoMensaje = useCallback(
    (msg: any) => {
      const payload = msg.message ?? msg

      const nuevo = {
        id: payload.id,
        externalId: payload.externalId,
        from: payload.from,
        contenido: payload.contenido ?? payload.body ?? '',
        timestamp: payload.timestamp ?? payload.createdAt,
        mediaId: payload.mediaId,
        mediaType: payload.mediaType,
        mediaUrl: payload.mediaUrl,
        mimeType: payload.mimeType,
        caption: payload.caption,
        transcription: payload.transcription,
        isVoiceNote: payload.isVoiceNote,
      }

      if (msg.conversationId === activoId) setMensajes((prev) => mergeUnique(prev, [nuevo]))

      if (payload.from === 'client' && msg.conversationId) {
        setPolicyErrors((prev) => {
          if (!(msg.conversationId in prev)) return prev
          const { [msg.conversationId]: _omit, ...rest } = prev
          return rest
        })
      }

      setChats((prev) => {
        const existe = prev.find((c) => c.id === msg.conversationId)
        if (existe) {
          return prev.map((chat) =>
            chat.id === msg.conversationId
              ? {
                  ...chat,
                  mensaje: nuevo.contenido || '[media]',
                  estado: msg.estado ?? chat.estado,
                  fecha: nuevo.timestamp,
                }
              : chat
          )
        }
        return [
          {
            id: msg.conversationId,
            nombre: msg.nombre ?? msg.conversationId,
            estado: msg.estado ?? 'pendiente',
            mensaje: nuevo.contenido || '[media]',
            fecha: nuevo.timestamp,
          },
          ...prev,
        ]
      })
    },
    [activoId, mergeUnique]
  )

  const handleChatActualizado = useCallback(
    (data: any) => {
      setChats((prev) => prev.map((chat) => (chat.id === data.id ? { ...chat, estado: data.estado } : chat)))
      if (data.id === activoId && data.estado !== 'cerrado') {
        setRespuesta('')
        setPolicyErrors((prev) => {
          const { [data.id]: _omit, ...rest } = prev
          return rest
        })
      }
    },
    [activoId]
  )

  const handlePolicyError = useCallback((payload: any) => {
    const { conversationId, code, message } = payload || {}
    if (!conversationId) return
    
    // Si el error es por LÍMITE ALCANZADO (viene del webhook)
    if (code === 'limit_reached') {
        setIsBillingLocked(true); // Bloqueamos la interfaz inmediatamente
    }

    setPolicyErrors((prev) => ({
      ...prev,
      [conversationId]: {
        code,
        message: message || 'Ventana de 24 h cerrada. Se requiere plantilla para iniciar la conversación.',
      },
    }))
  }, [])

  useEffect(() => {
    const onEliminado = ({ id }: { id: number }) => {
      setChats((prev) => prev.filter((c) => c.id !== id))
      if (activoId === id) {
        setActivoId(null)
        setMensajes([])
      }
      setPolicyErrors((prev) => {
        const { [id]: _omit, ...rest } = prev
        return rest
      })
    }

    socket.off('nuevo_mensaje', handleNuevoMensaje)
    socket.on('nuevo_mensaje', handleNuevoMensaje)
    socket.off('chat_actualizado', handleChatActualizado)
    socket.on('chat_actualizado', handleChatActualizado)
    socket.off('wa_policy_error', handlePolicyError)
    socket.on('wa_policy_error', handlePolicyError)
    socket.off('chat_eliminado', onEliminado)
    socket.on('chat_eliminado', onEliminado)

    return () => {
      socket.off('nuevo_mensaje', handleNuevoMensaje)
      socket.off('chat_actualizado', handleChatActualizado)
      socket.off('wa_policy_error', handlePolicyError)
      socket.off('chat_eliminado', onEliminado)
    }
  }, [handleNuevoMensaje, handleChatActualizado, handlePolicyError, activoId])

  // Handlers de selección y carga (sin cambios)
  const handleSelectChat = async (chatId: number) => {
    setActivoId(chatId)
    setMensajes([])
    setPage(1)
    setLoadingMsgs(true)
    try {
      const chatActual = chats.find((c) => c.id === chatId)
      if (chatActual?.estado === 'pendiente') {
        await axios.put(
          `/api/chats/${chatId}/estado`,
          { estado: 'en_proceso' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      const res = await axios.get(`/api/chats/${chatId}/messages?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const mapped = res.data.messages.map((m: any) => ({
        id: m.id,
        externalId: m.externalId,
        from: m.from,
        contenido: m.contenido ?? m.body ?? '',
        timestamp: m.timestamp ?? m.createdAt,
        mediaId: m.mediaId,
        mediaType: m.mediaType,
        mediaUrl: m.mediaUrl,
        mimeType: m.mimeType,
        caption: m.caption,
        transcription: m.transcription,
        isVoiceNote: m.isVoiceNote,
      }))
      setMensajes(ordenarMensajes(mapped))
      setHasMore(res.data.pagination.hasMore)
    } catch (err) {
      console.error('Error al cargar mensajes:', err)
    } finally {
      setLoadingMsgs(false)
    }
  }

  const handleLoadMore = async () => {
    if (!activoId) return
    const nextPage = page + 1
    try {
      const res = await axios.get(`/api/chats/${activoId}/messages?page=${nextPage}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const mapped = res.data.messages.map((m: any) => ({
        id: m.id,
        externalId: m.externalId,
        from: m.from,
        contenido: m.contenido ?? m.body ?? '',
        timestamp: m.timestamp ?? m.createdAt,
        mediaId: m.mediaId,
        mediaType: m.mediaType,
        mediaUrl: m.mediaUrl,
        mimeType: m.mimeType,
        caption: m.caption,
        transcription: m.transcription,
        isVoiceNote: m.isVoiceNote,
      }))
      setMensajes((prev) => mergeUnique(mapped, prev))
      setPage(nextPage)
      setHasMore(res.data.pagination.hasMore)
    } catch (err) {
      console.error('Error al cargar más mensajes:', err)
    }
  }

  // Enviar mensaje (protegido con isBillingLocked)
  const handleSendMessage = async () => {
    const body = respuesta.trim()
    if (!body || !activoId) return

    // 🔒 Bloqueo en Frontend
    if (isBillingLocked) {
        await Swal.fire({
            icon: 'error',
            title: 'Servicio Suspendido',
            text: 'Tu plan ha finalizado o alcanzaste el límite. Reactiva tu cuenta para enviar mensajes.',
            confirmButtonText: 'Ir a Facturación',
            confirmButtonColor: '#ef4444',
            background: '#09090b',
            color: '#fff'
        }).then((res) => {
            if(res.isConfirmed) window.location.href = '/dashboard/billing';
        });
        return;
    }

    const chatActual = chats.find((c) => c.id === activoId)
    const tempId = `temp-${Date.now()}`
    const timestamp = new Date().toISOString()
    const msgOptimista = { id: tempId, from: 'agent', contenido: body, timestamp }

    setRespuesta('')
    setMensajes((prev) => mergeUnique(prev, [msgOptimista]))

    if (chatActual?.estado === 'cerrado') {
      setMensajes((prev) => prev.map((m) => (m.id === tempId ? { ...m, error: true } : m)))
      await Swal.fire({
        icon: 'info',
        title: 'Conversación cerrada',
        text: 'Debes reabrir la conversación antes de enviar un mensaje.',
        background: '#09090b',
        color: '#e5e7eb',
        confirmButtonColor: '#10b981',
      })
      return
    }

    const aplicarOk = (created: any) => {
      const real = created?.message ?? created
      setMensajes((prev) =>
        ordenarMensajes(
          prev.map((m) => (m.id === tempId ? { ...m, ...real, id: real.id } : m))
        )
      )
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== activoId) return chat
          return {
            ...chat,
            mensaje: real.contenido || chat.mensaje,
            fecha: real.timestamp ?? chat.fecha,
          }
        })
      )
    }

    const aplicarError = async (err: any) => {
      console.error('Error al responder manualmente:', err)
      setMensajes((prev) => prev.map((m) => (m.id === tempId ? { ...m, error: true } : m)))
      let msg = ''
      try {
        const raw = err?.response?.data || err?.message || err
        msg = typeof raw === 'string' ? raw : JSON.stringify(raw)
      } catch {
        msg = String(err)
      }
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar',
        html: `<pre style="text-align:left;white-space:pre-wrap;">${msg}</pre>`,
        background: '#09090b',
        color: '#e5e7eb',
        confirmButtonColor: '#ef4444',
      })
    }

    try {
      const { data } = await axios.post(
        `/api/chats/${activoId}/responder-manual`,
        { text: body, body, contenido: body, from: 'agent' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      aplicarOk(data)
      return
    } catch (err: any) {
      const status = err?.response?.status
      if (status !== 404 && status !== 405) {
        await aplicarError(err)
        return
      }
    }

    try {
      const { data } = await axios.post(
        `/api/chats/${activoId}/messages`,
        { text: body, body, contenido: body, from: 'agent' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      aplicarOk(data)
    } catch (err) {
      await aplicarError(err)
    }
  }

  const handleSendMedia = async ({ url, type }: { url: string; type: 'image' | 'video' }) => {
    if (!activoId || !token) return
    try {
      await axios.post(
        `/api/chats/${activoId}/media`,
        { url, type },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: 'agent',
          contenido: type === 'image' ? '[imagen]' : '[video]',
          mediaType: type,
          mediaUrl: url,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err) {
      console.error('[handleSendMedia] Error:', err)
    }
  }

  const handleUploadFile = async (
    file: File,
    type: 'image' | 'video' | 'audio' | 'document',
    caption?: string
  ) => {
    if (!activoId || !token) return
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      fd.append('conversationId', String(activoId))
      if (caption) fd.append('caption', caption)

      await axios.post('/api/whatsapp/media-upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
    } catch (err) {
      console.error('❌ Error subiendo/enviando archivo:', err)
      alert('No se pudo enviar el archivo')
    }
  }

  const handleCerrarConversacion = async () => {
    if (!activoId) return
    try {
      await axios.put(
        `/api/chats/${activoId}/cerrar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChats((prev) => prev.map((chat) => (chat.id === activoId ? { ...chat, estado: 'cerrado' } : chat)))
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
      const res = await axios.post('/api/chats', data, { headers: { Authorization: `Bearer ${token}` } })
      setChats((prev) => [res.data.chat, ...prev])
      setActivoId(res.data.chat.id)
      await handleSelectChat(res.data.chat.id)
      await axios.put(
        `/api/chats/${res.data.chat.id}/estado`,
        { estado: 'en_proceso' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMostrarModalCrear(false)
    } catch (err) {
      console.error('Error al crear conversación:', err)
    }
  }

  const handleReabrirConversacion = async () => {
    if (!activoId) return
    try {
      await axios.put(
        `/api/chats/${activoId}/reabrir`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChats((prev) => prev.map((c) => (c.id === activoId ? { ...c, estado: 'respondido' } : c)))
      setRespuesta('')
      setPolicyErrors((prev) => {
        const { [activoId]: _omit, ...rest } = prev
        return rest
      })
    } catch (err) {
      console.error('Error al reabrir conversación:', err)
    }
  }

  const handleAppointmentCreated = async (created: { id: number; startAt: string }) => {
    if (!activoId || !token) return
    try {
      await axios.put(
        `/api/chats/${activoId}/estado`,
        { estado: 'agendado' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChats((prev) => prev.map((c) => (c.id === activoId ? { ...c, estado: 'agendado' } : c)))
    } catch (err) {
      console.error('No se pudo marcar como agendado:', err)
    }
  }

  const handleEliminarConversacion = async () => {
    if (!activoId) return
    const chatActual = chats.find((c) => c.id === activoId)
    if (chatActual?.estado !== 'cerrado') {
      await Swal.fire({
        title: 'No disponible',
        text: 'Solo puedes eliminar conversaciones que estén cerradas.',
        icon: 'info',
        background: '#09090b',
        color: '#e5e7eb',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981',
      })
      return
    }

    const resp = await Swal.fire({
      title: 'Eliminar conversación',
      text: 'Se borrarán primero los mensajes y luego la conversación. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      background: '#09090b',
      color: '#e5e7eb',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
    })

    if (!resp.isConfirmed) return

    try {
      await axios.delete(`/api/chats/${activoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setChats((prev) => prev.filter((c) => c.id !== activoId))
      setMensajes([])
      setPolicyErrors((prev) => {
        const { [activoId]: _omit, ...rest } = prev
        return rest
      })
      setActivoId(null)

      await Swal.fire({
        title: 'Eliminado',
        text: 'La conversación fue eliminada correctamente.',
        icon: 'success',
        background: '#09090b',
        color: '#e5e7eb',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#10b981',
      })
    } catch (err) {
      console.error('Error al eliminar conversación:', err)
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la conversación.',
        icon: 'error',
        background: '#09090b',
        color: '#e5e7eb',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden relative">
      
      {/* 🔮 Fondo ambiental con luces (Cyberpunk Vibe) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      {/* SIDEBAR - Restaurando estructura original para evitar daños de layout */}
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

      {/* ÁREA PRINCIPAL */}
      <section className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden">
        {activoId ? (
          <>
            {/* Header Glass */}
            <div className="bg-zinc-900/60 backdrop-blur-md border-b border-white/5">
                <ChatHeader
                chatId={activoId!}
                nombre={chats.find((c) => c.id === activoId)?.nombre || ''}
                estado={chats.find((c) => c.id === activoId)?.estado || ''}
                onCerrar={() => setMostrarModalCerrar(true)}
                onReabrir={handleReabrirConversacion}
                onEliminar={handleEliminarConversacion}
                mostrarBotonCerrar={true}
                />
            </div>

            {/* ⚠️ Banner de "Sesión Vencida (24h)" - Diseño Alerta Premium */}
            {!isBillingLocked && policyErrors[activoId] && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm p-4 shadow-lg shadow-amber-900/10"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-amber-500/20 text-amber-400">
                    <FiAlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-amber-200">Sesión de 24h finalizada</div>
                    <div className="text-sm text-amber-200/70 mt-1">
                      {policyErrors[activoId].message}
                      {policyErrors[activoId].code ? ` (código ${policyErrors[activoId].code})` : null}
                    </div>
                    <div className="mt-2 text-xs text-amber-200/50">
                      La ventana de respuesta gratuita se ha cerrado. Usa una plantilla para reactivarla.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPolicyErrors((prev) => {
                        const { [activoId!]: _omit, ...rest } = prev
                        return rest
                      })
                    }}
                    className="text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/20 px-3 py-1 rounded-lg transition-colors text-xs font-medium"
                  >
                    Ignorar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Área de Mensajes */}
            <div className="flex-1 overflow-hidden relative">
                {/* Patrón de fondo sutil estilo tech */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />
                <ChatMessages
                mensajes={mensajes}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                loading={loadingMsgs}
                />
            </div>

            {/* 🔒 BANNER DE BLOQUEO DE SERVICIO (Ultra Premium Alert) */}
            {isBillingLocked ? (
                <div className="p-6 bg-zinc-900/80 backdrop-blur-lg border-t border-white/5">
                    <div className="rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30">
                                <FiLock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg tracking-tight">Servicio Suspendido</h3>
                                <p className="text-zinc-400 text-sm mt-1 max-w-lg">
                                    Has alcanzado el límite de tu plan o tu periodo de prueba ha finalizado. 
                                    <br/><span className="text-red-300/80 text-xs">No se enviarán ni recibirán mensajes hasta regularizar.</span>
                                </p>
                            </div>
                        </div>
                        <Link 
                            href="/dashboard/billing"
                            className="whitespace-nowrap px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all transform hover:scale-[1.02] flex items-center gap-2"
                        >
                            <span>Reactivar Ahora</span>
                            <span className="text-white/60">→</span>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-zinc-900/60 backdrop-blur-md border-t border-white/5 p-4">
                    <ChatInput
                    key={activoId || 'none'}
                    value={respuesta}
                    onChange={setRespuesta}
                    onSend={handleSendMessage}
                    onSendGif={(url, isMp4) => handleSendMedia({ url, type: isMp4 ? 'video' : 'image' })}
                    onUploadFile={(file, type) => handleUploadFile(file, type)}
                    disabled={chats.find((c) => c.id === activoId)?.estado === 'cerrado'}
                    onAppointmentCreated={handleAppointmentCreated}
                    conversationId={activoId}
                    chatPhone={
                        chats.find((c) => c.id === activoId)?.telefono ||
                        chats.find((c) => c.id === activoId)?.phone ||
                        ''
                    }
                    summaryText={
                        chats.find((c) => c.id === activoId)?.summaryText ||
                        chats.find((c) => c.id === activoId)?.summary?.text ||
                        ''
                    }
                    />
                </div>
            )}

          </>
        ) : (
          /* EMPTY STATE - Diseño Central "No hay chat" */
          <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Círculo decorativo de fondo */}
            <div className="absolute w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <div className="w-24 h-24 bg-zinc-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl shadow-black/50 rotate-3">
                    <FiMessageSquare className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Centro de Conversaciones</h2>
                <p className="text-zinc-400 max-w-sm mx-auto mb-8">
                    Selecciona un chat de la barra lateral para ver el historial, gestionar respuestas o agendar citas.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-500">
                    <HiSparkles className="text-yellow-500" />
                    <span>IA Activa y lista para responder</span>
                </div>
            </motion.div>
          </div>
        )}
      </section>

      {mostrarModalCerrar && (
        <ChatModalCerrar onClose={() => setMostrarModalCerrar(false)} onConfirm={handleCerrarConversacion} />
      )}
      {mostrarModalCrear && (
        <ChatModalCrear onClose={() => setMostrarModalCrear(false)} onCreate={handleCrearConversacion} />
      )}
    </div>
  )
}