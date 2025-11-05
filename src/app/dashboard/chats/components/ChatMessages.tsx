'use client'

import { useEffect, useMemo, useRef } from 'react'
import { FiLoader } from 'react-icons/fi'

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

  // Auto-scroll bottom cuando llegan nuevos (si no se está cargando)
  const lastKey = useMemo(
    () => (mensajes.length ? `${mensajes[mensajes.length - 1].id || mensajes[mensajes.length - 1].externalId}` : ''),
    [mensajes]
  )

  useEffect(() => {
    if (loading) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight + 1000
  }, [lastKey, loading])

  // Mientras carga el historial inicial => skeleton premium
  if (loading && mensajes.length === 0) {
    return (
      <section className="flex-1 overflow-y-auto">
        {/* “Cargar más” deshabilitado mientras carga */}
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
    <section className="flex-1 overflow-y-auto">
      {/* Top “cargar más” */}
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

      {/* Contenedor de mensajes (con padding-top que pediste) */}
      <div
        ref={scrollRef}
        className="px-2 sm:px-4 pt-3 pb-4 flex flex-col gap-3"
        style={{ minHeight: '100%' }}
      >
        {mensajes.map((m) => {
          const side: 'left' | 'right' = m.from === 'client' ? 'left' : 'right'
          const isRight = side === 'right'
          const isError = !!m.error

          // clase de burbuja (50% ancho máximo, sin cortar palabras)
          const bubbleBase = `
            max-w-[50%] break-words
            rounded-2xl px-4 py-2.5
            shadow-sm border border-white/10
          `
          const bubbleColor = isRight ? 'bg-[#008069] text-white' : 'bg-[#2A3942] text-[#E9EDEF]'
          const bubbleError = isError ? 'ring-1 ring-red-500/50' : ''

          return (
            <div key={m.id || m.externalId || Math.random()} className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
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
      </div>
    </section>
  )
}
