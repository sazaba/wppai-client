'use client'

import { useEffect, useRef } from 'react'

type Msg = {
  id?: string | number
  from: 'client' | 'agent' | 'bot' | 'ai'
  contenido?: string
  timestamp?: string
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  mediaUrl?: string
  caption?: string
  error?: boolean
}

export default function ChatMessages({
  mensajes,
  onLoadMore,
  hasMore,
}: {
  mensajes: Msg[]
  onLoadMore?: () => void
  hasMore?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll al final cuando hay nuevos
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // pequeño delay para que el DOM pinte
    const t = setTimeout(() => {
      el.scrollTop = el.scrollHeight
    }, 50)
    return () => clearTimeout(t)
  }, [mensajes.length])

  const renderBubble = (m: Msg) => {
    const isAgent = m.from !== 'client'  // 'agent', 'bot', 'ai' => derecha

    // colores y bordes de WhatsApp-like
    const bubbleBase =
      'relative w-fit max-w-[50%] px-4 py-2 rounded-2xl shadow-sm ' +
      'whitespace-pre-wrap break-words hyphens-none leading-relaxed text-[15px]'

    const bubbleColor = isAgent
      ? 'bg-[#1F8C6A] text-white' // verde salida
      : 'bg-[#202C33] text-[#E9EDF0]' // gris entrada

    // borde “cola” sutil con radius asimétrico
    const bubbleShape = isAgent
      ? 'rounded-br-md rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
      : 'rounded-bl-md rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'

    // wrapper para alinear a izquierda / derecha
    const wrap = isAgent ? 'justify-end pr-3' : 'justify-start pl-3'

    return (
      <div key={`${m.id ?? Math.random()}`} className={`w-full flex ${wrap}`}>
        <div className={`${bubbleBase} ${bubbleColor} ${bubbleShape}`}>
          {/* Contenido de texto / caption */}
          {m.contenido ? m.contenido : m.caption ? m.caption : ''}

          {/* Hora dentro del bubble, alineada a la derecha */}
          {m.timestamp && (
            <div className="mt-1 text-[11px] opacity-80 text-right select-none">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          {/* Marca de error si falló el envío */}
          {m.error && (
            <div className="mt-1 text-[11px] text-red-300/90 font-medium text-right">No enviado</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="flex-1 overflow-y-auto bg-[#0B141A]">
      {/* botón cargar más (arriba) */}
      {hasMore && (
        <div className="py-2 flex justify-center">
          <button
            onClick={onLoadMore}
            className="text-xs px-3 py-1 rounded-full bg-[#1f2c33] text-[#cbd5e1] hover:bg-[#22343d]"
          >
            Cargar mensajes anteriores
          </button>
        </div>
      )}

<div
  ref={scrollRef}
  className="px-2 sm:px-4 pt-3 pb-4 flex flex-col gap-3"  // 👈 se agregó pt-3
  style={{
    minHeight: '100%',
  }}
>
        {mensajes.map(renderBubble)}
      </div>
    </section>
  )
}
