'use client'

import { useEffect, useMemo, useRef } from 'react'
import { FiLoader } from 'react-icons/fi'

interface Msg {
  id?: string | number
  externalId?: string
  from: 'client' | 'agent' | string
  contenido?: string
  timestamp?: string | number | Date
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  mediaUrl?: string
  mimeType?: string
  caption?: string
  error?: boolean
}

export default function ChatMessages({
  mensajes,
  onLoadMore,
  hasMore,
}: {
  mensajes: Msg[]
  onLoadMore: () => void
  hasMore: boolean
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  // scroll al fondo cuando llegan mensajes nuevos (si estás cerca del final)
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200
    if (nearBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes])

  const items = useMemo(() => Array.isArray(mensajes) ? mensajes : [], [mensajes])

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-[#374045] scrollbar-track-transparent">
      {/* Cargar más */}
      {hasMore && (
        <div className="py-2 flex justify-center">
          <button
            onClick={onLoadMore}
            className="text-xs px-3 py-1 rounded-full bg-[#202C33] text-white/90 hover:bg-[#2A3942] border border-white/10"
          >
            Ver mensajes anteriores
          </button>
        </div>
      )}

      {items.map((m, i) => {
        const isAgent = (m.from || '').toLowerCase() !== 'client'
        const sending = typeof m.id === 'string' && m.id.startsWith('temp-') && !m.error
        const failed  = !!m.error

        // —— clases de burbuja (¡aquí está la corrección!)
        //  - whitespace-pre-wrap: respeta saltos que envíe el usuario
        //  - break-words: solo rompe palabras MUY largas (evita "Santiag / o")
        //  - NO usar break-all ni overflow-wrap:anywhere
        const bubbleBase =
          'inline-block max-w-[80%] sm:max-w-[65%] rounded-2xl px-3 py-2 text-[15px] leading-relaxed ' +
          'whitespace-pre-wrap break-words hyphens-none'

        const bubble =
          (isAgent
            ? 'bg-[#1F8C6A] text-white shadow-md' // saliente
            : 'bg-[#202C33] text-[#E9EDEF]') + ' ' + bubbleBase

        // hora pequeñita
        const time = m.timestamp
          ? new Date(m.timestamp as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''

        return (
          <div key={(m.id ?? i) as any} className={`w-full flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col items-start gap-1">
              {/* Bubble */}
              <div className={bubble}>
                {/* texto o media */}
                {renderContent(m)}

                {/* footer: estado / hora */}
                <div className="mt-1 flex items-center gap-2 text-[11px] opacity-75">
                  {failed ? (
                    <span className="text-red-300">No enviado</span>
                  ) : sending ? (
                    <span className="flex items-center gap-1">
                      <FiLoader className="animate-spin" /> Enviando…
                    </span>
                  ) : null}
                  {time && <span>{time}</span>}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <div ref={bottomRef} />
    </div>
  )
}

function renderContent(m: Msg) {
  if (m.mediaUrl) {
    if (m.mediaType === 'image') {
      return (
        <div className="space-y-1">
          <img
            src={m.mediaUrl}
            alt={m.caption || 'imagen'}
            className="rounded-xl max-h-[320px] object-contain"
          />
          {m.caption && <p className="whitespace-pre-wrap break-words">{m.caption}</p>}
        </div>
      )
    }
    if (m.mediaType === 'video') {
      return (
        <div className="space-y-1">
          <video src={m.mediaUrl} controls className="rounded-xl max-h-[320px]" />
          {m.caption && <p className="whitespace-pre-wrap break-words">{m.caption}</p>}
        </div>
      )
    }
    // audio/doc: mostramos link simple
    return (
      <div className="space-y-1">
        <a
          href={m.mediaUrl}
          target="_blank"
          className="underline underline-offset-2 break-words"
          rel="noreferrer"
        >
          Abrir archivo
        </a>
        {m.caption && <p className="whitespace-pre-wrap break-words">{m.caption}</p>}
      </div>
    )
  }

  // Mensaje de texto
  return <p>{m.contenido || ''}</p>
}
