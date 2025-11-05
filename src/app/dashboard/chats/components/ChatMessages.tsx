'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import MessageBubble, { ChatMessage } from './MessageBubble'

interface ChatMessagesProps {
  mensajes: ChatMessage[]
  onLoadMore: () => void
  hasMore: boolean
  /** loader superior mientras cargas históricos (opcional) */
  loadingMore?: boolean
  /** burbuja efímera “escribiendo…” (opcional) */
  isTyping?: boolean
}

export default function ChatMessages({
  mensajes,
  onLoadMore,
  hasMore,
  loadingMore = false,
  isTyping = false,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Dedupe estable por id y fallback seguro
  const list = useMemo(() => {
    const seen = new Set<string>()
    return mensajes.filter((m) => {
      const k = String(m.id ?? `${m.from}-${m.timestamp}-${m.contenido}`)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }, [mensajes])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isBottom = scrollHeight - scrollTop - clientHeight < 10
    setIsAtBottom(isBottom)
  }

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    if (isAtBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [list.length, isAtBottom])

  return (
    <div className="flex-1 overflow-hidden relative bg-[#111B21] z-0">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="
          h-full overflow-y-auto overflow-x-hidden
          px-3 sm:px-5 py-4
          scrollbar-thin scrollbar-thumb-[#2A3942]/60 scrollbar-track-transparent
          hover:scrollbar-thumb-[#2A3942]
          [scrollbar-width:thin]
        "
        style={{ scrollbarColor: '#2A3942 transparent' } as any}
      >
        {/* Limitador para simetría en desktop y evitar estirar de más */}
        <div className="mx-auto w-full max-w-3xl">
          {/* Pila de mensajes con ritmo vertical consistente */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {hasMore && (
              <div className="self-center flex flex-col items-center gap-2 mb-1">
                <button
                  onClick={onLoadMore}
                  className="text-xs text-[#00A884] hover:underline"
                  disabled={loadingMore}
                >
                  Ver mensajes anteriores
                </button>
                {loadingMore && (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="self-start bg-[#1F2C34] rounded-2xl px-3.5 py-2.5 w-40 h-6 animate-pulse" />
                    <div className="self-end bg-[#005C4B] rounded-2xl px-3.5 py-2.5 w-56 h-6 animate-pulse" />
                  </div>
                )}
              </div>
            )}

            {list.length === 0 && !hasMore && (
              <div className="self-center text-sm text-[#8696a0] py-6">
                No hay mensajes todavía.
              </div>
            )}

            {list.map((msg) => {
              const key = String(msg.id ?? `${msg.from}-${msg.timestamp}-${msg.contenido}`)
              // 👉 “Míos” = bot/agent (lado derecho)
              const isMine = msg.from === 'bot' || msg.from === 'agent'
              return <MessageBubble key={key} message={msg} isMine={isMine} />
            })}

            {/* Typing indicator (opcional) */}
            {isTyping && (
              <MessageBubble
                key="typing-indicator"
                isMine={true} // cambia a false si quieres que aparezca a la izquierda
                message={{
                  id: 'typing',
                  from: 'bot',
                  contenido: '',
                  status: 'sending',
                  timestamp: new Date().toISOString(),
                }}
              />
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          aria-label="Bajar al último mensaje"
          className="absolute bottom-5 right-4 z-10 bg-[#00A884] hover:bg-[#01976D] text-white w-9 h-9 flex items-center justify-center rounded-full shadow transition-all"
        >
          <FiArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
