'use client'

import { useEffect, useRef, useState } from 'react'
import { FiArrowDown, FiClock } from 'react-icons/fi'

interface Mensaje {
  from: 'client' | 'bot'
  contenido: string
  timestamp: string
}

interface ChatMessagesProps {
  mensajes: Mensaje[]
  onLoadMore: () => void
  hasMore: boolean
}

export default function ChatMessages({ mensajes, onLoadMore, hasMore }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isBottom = scrollHeight - scrollTop - clientHeight < 10
    setIsAtBottom(isBottom)
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajes])

  return (
    <div className="flex-1 overflow-hidden relative">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-6 py-4 flex flex-col gap-3 scrollbar scrollbar-thumb-transparent scrollbar-track-transparent hover:scrollbar-thumb-[#2A3942] scrollbar-thumb-rounded-full transition-all duration-300"
        onScroll={handleScroll}
      >
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="text-xs text-[#00A884] hover:underline self-center"
          >
            Ver mensajes anteriores
          </button>
        )}

        {mensajes.map((msg, index) => {
          const esIA = msg.from !== 'client'
          return (
            <div
              key={index}
              className={`max-w-[75%] px-4 py-2 rounded-xl text-sm break-words whitespace-pre-wrap shadow-sm ${
                esIA
                  ? 'bg-[#005C4B] text-white self-end ml-auto'
                  : 'bg-[#202C33] text-[#e9edef] self-start'
              }`}
            >
              {msg.contenido}
              <div
                className={`text-[10px] mt-1 text-right flex items-center gap-1 justify-end ${
                  esIA ? 'text-[#d1d7db]' : 'text-[#8696a0]'
                }`}
              >
                <FiClock className="inline-block" />
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          aria-label="Bajar al último mensaje"
          className="absolute bottom-5 right-4 z-10 bg-[#00A884] hover:bg-[#01976D] text-white w-8 h-8 flex items-center justify-center rounded-full shadow transition-all"
        >
          <FiArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
