'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import MessageBubble, { ChatMessage } from './MessageBubble'

interface ChatMessagesProps {
  mensajes: ChatMessage[]
  onLoadMore: () => void
  hasMore: boolean
}

export default function ChatMessages({ mensajes, onLoadMore, hasMore }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Dedupe
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
          [scrollbar-width:thin] [scrollbar-color:#2A3942_transparent]
          hover:[scrollbar-color:#2A3942_transparent]
        "
      >
        {/* Limitador para simetría en desktop */}
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-2 sm:gap-3">
          {hasMore && (
            <button
              onClick={onLoadMore}
              className="text-xs text-[#00A884] hover:underline self-center mb-2"
            >
              Ver mensajes anteriores
            </button>
          )}

          {list.length === 0 && !hasMore && (
            <div className="self-center text-sm text-[#8696a0] py-6">
              No hay mensajes todavía.
            </div>
          )}

          {list.map((msg) => {
            const key = String(msg.id ?? `${msg.from}-${msg.timestamp}-${msg.contenido}`)
            const isMine = msg.from === 'bot' || msg.from === 'agent'
            return <MessageBubble key={key} message={msg} isMine={isMine} />
          })}

          <div ref={bottomRef} />
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
