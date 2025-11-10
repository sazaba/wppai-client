'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FiLoader, FiChevronDown } from 'react-icons/fi'

type Msg = {
  id?: string | number
  externalId?: string
  from: 'client' | 'agent' | 'bot' | string
  contenido?: string
  timestamp?: string
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  mediaUrl?: string
  mimeType?: string
  caption?: string
  transcription?: string
  isVoiceNote?: boolean
  error?: boolean
}

interface Props {
  mensajes: Msg[]
  onLoadMore: () => void
  hasMore: boolean
  loading?: boolean
}

/* ============ Helpers ============ */
const formatTime = (iso?: string) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const isNearBottom = (el: HTMLElement | null, threshold = 80) => {
  if (!el) return true
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight
  return distance <= threshold
}

/** Firma estable para mensajes sin id/externalId (último recurso) */
const softFingerprint = (m: Msg) =>
  `${m.from}|${m.timestamp ?? ''}|${(m.contenido ?? '').slice(0, 64)}|${m.mediaUrl ?? ''}`

/** Key estable (no usar Math.random) */
const getMsgKey = (m: Msg) => String(m.id ?? m.externalId ?? softFingerprint(m))

/* ============ Skeleton Premium ============ */
function SkeletonBubble({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          relative max-w-[50%]
          rounded-2xl px-4 py-3
          ${side === 'right' ? 'bg-emerald-700/20' : 'bg-[#2A3942]'}
          border border-white/10
          animate-pulse
        `}
      >
        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
        <div className="h-3 w-44 bg-white/10 rounded mb-1" />
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div
          className={`absolute bottom-1 ${
            side === 'right' ? 'right-3' : 'left-3'
          } h-2 w-10 bg-white/10 rounded mt-2`}
        />
      </div>
    </div>
  )
}

function SkeletonChat() {
  return (
    <div className="px-2 sm:px-4 pt-3 pb-4 flex flex-col gap-3">
      <SkeletonBubble side="left" />
      <SkeletonBubble side="right" />
      <SkeletonBubble side="left" />
      <SkeletonBubble side="right" />
      <SkeletonBubble side="left" />
    </div>
  )
}

/* ============ ChatMessages ============ */
export default function ChatMessages({ mensajes, onLoadMore, hasMore, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Estado para controlar el botón "ir al final" y contador de nuevos
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [newCount, setNewCount] = useState(0)

  // Guardamos si el usuario está pegado al fondo
  const atBottomRef = useRef(true)

  /* ===== FIX: DEDUP + ORDEN =====
     - Quitamos duplicados por id/externalId
     - Si no existen, usamos una firma suave (from+timestamp+contenido)
     - Ordenamos por timestamp asc para consistencia
  */
  const msgsDeduped = useMemo(() => {
    const seen = new Set<string>()
    const sorted = [...(mensajes ?? [])].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return ta - tb
    })
    return sorted.filter((m) => {
      const k = getMsgKey(m)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }, [mensajes])

  // Clave del último mensaje para detectar cambios (sobre deduplicados)
  const lastKey = useMemo(
    () => (msgsDeduped.length ? getMsgKey(msgsDeduped[msgsDeduped.length - 1]) : ''),
    [msgsDeduped]
  )

  // Listener de scroll para mostrar/ocultar el botón de bajar
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      const near = isNearBottom(el)
      atBottomRef.current = near
      setShowScrollDown(!near)
      if (near && newCount) setNewCount(0)
    }

    handleScroll() // estado inicial
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [newCount])

  // Cuando llegan mensajes nuevos:
  // - Si está cerca del final, baja automático.
  // - Si NO está cerca, no bajamos y aumentamos "newCount".
  useEffect(() => {
    if (loading) return
    const el = scrollRef.current
    if (!el) return

    if (atBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      setNewCount(0)
    } else {
      setNewCount((n) => n + 1)
    }
  }, [lastKey, loading])

  // Acción del botón (bajar al final)
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    atBottomRef.current = true
    setShowScrollDown(false)
    setNewCount(0)
  }

  // Mientras carga el historial inicial => skeleton premium
  if (loading && msgsDeduped.length === 0) {
    return (
      <section className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3">
          <div className="mx-auto mb-3 w-fit text-xs text-[#b6c4cc] opacity-70 flex items-center gap-2">
            <FiLoader className="animate-spin" /> Cargando mensajes…
          </div>
        </div>
        <SkeletonChat />
      </section>
    )
  }

  return (
    <section className="relative flex-1 overflow-hidden">
      {/* Top “cargar más” dentro de un contenedor con scroll independiente */}
      <div className="px-4 pt-3">
        {hasMore ? (
          <button
            onClick={onLoadMore}
            className="mx-auto block text-xs text-[#b6c4cc] hover:text-white/90 border border-white/15 px-3 py-1 rounded-full bg-[#1a252b] transition"
            title="Cargar mensajes anteriores"
          >
            Cargar mensajes anteriores
          </button>
        ) : (
          <div className="mx-auto w-fit text-xs text-[#6b7d86] opacity-80">Inicio de la conversación</div>
        )}
      </div>

      {/* Contenedor SCROLLEABLE */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-2 sm:px-4 pt-3 pb-16 flex flex-col gap-3"
        style={{ maxHeight: '100%' }}
      >
        {msgsDeduped.map((m) => {
          const side: 'left' | 'right' = m.from === 'client' ? 'left' : 'right'
          const isRight = side === 'right'
          const isError = !!m.error

          const bubbleBase = `
            max-w-[50%] break-words
            rounded-2xl px-4 py-2.5
            shadow-sm border border-white/10
          `
          const bubbleColor = isRight ? 'bg-[#008069] text-white' : 'bg-[#2A3942] text-[#E9EDEF]'
          const bubbleError = isError ? 'ring-1 ring-red-500/50' : ''

          return (
            <div key={getMsgKey(m)} className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
              <div className={`${bubbleBase} ${bubbleColor} ${bubbleError}`}>
                {/* Texto / Caption */}
                {m.contenido ? <p className="whitespace-pre-wrap leading-relaxed">{m.contenido}</p> : null}

                {/* Media simple (si hubiese) */}
                {m.mediaUrl && (
                  <div className="mt-2">
                    {m.mediaType === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.mediaUrl}
                        alt={m.caption || 'image'}
                        className="rounded-lg max-h-72 object-contain"
                      />
                    ) : m.mediaType === 'video' ? (
                      <video src={m.mediaUrl} controls className="rounded-lg max-h-72" />
                    ) : m.mediaType === 'audio' ? (
                      <audio src={m.mediaUrl} controls />
                    ) : (
                      <a
                        href={m.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-white/90"
                      >
                        Ver archivo
                      </a>
                    )}
                    {m.caption && <p className="mt-1 text-sm opacity-90">{m.caption}</p>}
                  </div>
                )}

                {/* Hora */}
                <div className={`mt-1 text-[11px] ${isRight ? 'text-white/80' : 'text-[#b6c4cc]'}`}>
                  {formatTime(m.timestamp)}
                </div>
              </div>
            </div>
          )
        })}

        {/* Sentinel para bajar suave al fondo */}
        <div ref={bottomRef} />
      </div>

      {/* Botón flotante tipo WhatsApp */}
      {showScrollDown && (
        <button
          onClick={scrollToBottom}
          className="absolute right-4 bottom-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#0b141a] text-[#e9edef] shadow-lg border border-white/10 hover:bg-[#122029] transition"
          title="Ir al último mensaje"
        >
          <div className="relative">
            <FiChevronDown size={22} />
            {newCount > 0 && (
              <span className="absolute -top-2 -right-2 text-[10px] leading-none bg-[#25d366] text-black font-semibold rounded-full px-1.5 py-0.5 border border-black/10">
                {newCount}
              </span>
            )}
          </div>
        </button>
      )}
    </section>
  )
}
