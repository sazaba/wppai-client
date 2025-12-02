'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FiLoader, FiChevronDown, FiArrowUp } from 'react-icons/fi'
import MessageBubble, { type ChatMessage } from './MessageBubble' 

// Ahora Msg hereda 'externalId' de ChatMessage correctamente
type Msg = ChatMessage & {
  error?: boolean
}

interface Props {
  mensajes: Msg[]
  onLoadMore: () => void
  hasMore: boolean
  loading?: boolean
}

const isNearBottom = (el: HTMLElement | null, threshold = 100) => {
  if (!el) return true
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight
  return distance <= threshold
}

const softFingerprint = (m: Msg) =>
  `${m.from}|${m.timestamp ?? ''}|${(m.contenido ?? '').slice(0, 64)}|${m.mediaUrl ?? ''}`

const getMsgKey = (m: Msg) => String(m.id ?? m.externalId ?? softFingerprint(m))

function SkeletonBubble({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'} w-full`}>
      <div
        className={`
          relative w-[60%] max-w-[300px]
          rounded-2xl p-3
          ${side === 'right' ? 'bg-indigo-500/10 rounded-tr-sm' : 'bg-zinc-800/50 rounded-tl-sm'}
          border border-white/5
          animate-pulse
        `}
      >
        <div className="space-y-2">
            <div className={`h-2.5 bg-white/10 rounded w-[90%] ${side === 'right' ? 'ml-auto' : ''}`} />
            <div className={`h-2.5 bg-white/10 rounded w-[70%] ${side === 'right' ? 'ml-auto' : ''}`} />
            <div className={`h-2.5 bg-white/10 rounded w-[40%] ${side === 'right' ? 'ml-auto' : ''}`} />
        </div>
      </div>
    </div>
  )
}

function SkeletonChat() {
  return (
    <div className="px-4 py-6 flex flex-col gap-4 h-full justify-end">
      <SkeletonBubble side="left" />
      <SkeletonBubble side="right" />
      <SkeletonBubble side="left" />
      <SkeletonBubble side="left" />
      <SkeletonBubble side="right" />
    </div>
  )
}

export default function ChatMessages({ mensajes, onLoadMore, hasMore, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const [showScrollDown, setShowScrollDown] = useState(false)
  const [newCount, setNewCount] = useState(0)
  
  const atBottomRef = useRef(true)

  const msgsDeduped = useMemo(() => {
    const sorted = [...(mensajes ?? [])].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return ta - tb
    })
    
    const seen = new Set<string>()
    return sorted.filter((m) => {
      const k = getMsgKey(m)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }, [mensajes])

  const lastKey = useMemo(
    () => (msgsDeduped.length ? getMsgKey(msgsDeduped[msgsDeduped.length - 1]) : ''),
    [msgsDeduped]
  )

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      const near = isNearBottom(el)
      atBottomRef.current = near
      setShowScrollDown(!near)
      
      if (near && newCount > 0) setNewCount(0)
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [newCount])

  useEffect(() => {
    if (loading) return
    
    if (atBottomRef.current) {
      scrollToBottom()
    } else {
      if (msgsDeduped.length > 0) {
          setNewCount((n) => n + 1)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastKey, loading])

  const scrollToBottom = () => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    atBottomRef.current = true
    setShowScrollDown(false)
    setNewCount(0)
  }

  if (loading && msgsDeduped.length === 0) {
    return (
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
        <SkeletonChat />
      </section>
    )
  }

  return (
    <section className="relative flex flex-col flex-1 h-full min-h-0 overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full z-10 flex justify-center p-2 pointer-events-none">
        {hasMore ? (
          <button
            onClick={onLoadMore}
            className="pointer-events-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/80 backdrop-blur-md border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all shadow-lg"
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiArrowUp />}
            Cargar anteriores
          </button>
        ) : (
            msgsDeduped.length > 0 && (
                <div className="px-3 py-1 rounded-full bg-zinc-900/40 backdrop-blur-sm text-[10px] text-zinc-500 uppercase tracking-widest font-semibold border border-white/5">
                    Inicio del historial
                </div>
            )
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 pt-12 pb-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
      >
        {msgsDeduped.map((m) => {
          const isClient = m.from === 'client'
          const isMine = !isClient

          return (
            <MessageBubble 
                key={getMsgKey(m)} 
                message={m} 
                isMine={isMine} 
            />
          )
        })}

        <div ref={bottomRef} className="h-px w-full" />
      </div>

      {showScrollDown && (
        <div className="absolute bottom-6 right-6 z-20">
            <button
                onClick={scrollToBottom}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/90 backdrop-blur text-white shadow-xl border border-white/10 hover:bg-zinc-700 hover:scale-105 transition-all"
            >
                <FiChevronDown className="w-5 h-5" />
                {newCount > 0 && (
                    <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-[#0B141A]">
                        {newCount}
                    </span>
                )}
            </button>
        </div>
      )}
    </section>
  )
}