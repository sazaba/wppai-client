'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowDown, FiClock, FiFileText, FiMic } from 'react-icons/fi'

export interface Mensaje {
  id?: number
  externalId?: string // wamid si viene
  from: 'client' | 'bot' | 'agent'
  contenido: string
  timestamp: string // ISO

  /** Campos opcionales si tu API los retorna */
  mediaType?: 'image' | 'video' | 'audio' | 'document'
  mediaUrl?: string
  caption?: string
  transcription?: string
  mimeType?: string
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

  // 🔒 Dedupe local por externalId si existe, o por firma (from+timestamp+contenido)
  const list = useMemo(() => {
    const seen = new Set<string>()
    return mensajes.filter((m) => {
      const k = m.externalId ?? `${m.from}-${m.timestamp}-${m.contenido}`
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

  // Solo auto-scroll cuando aumenta la longitud y estamos ya al fondo
  const len = list.length
  useEffect(() => {
    if (isAtBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [len, isAtBottom])

  /* ========================= Helpers ========================= */

  const urlRegex = /\b(https?:\/\/[^\s<>()\[\]{}"']+)(?<![.,!?;:])/gi

  const isImageUrl = (u: string) =>
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(u)

  const isVideoUrl = (u: string) =>
    /\.mp4(\?.*)?$/i.test(u) ||
    /tenor\.com\/.*|tenor\.googleapis\.com\/v2\/.*(mp4|nanomp4)/i.test(u)

  const isAudioUrl = (u: string) =>
    /\.(ogg|opus|mp3|m4a|aac|amr|wav|webm)(\?.*)?$/i.test(u)

  const isPdfUrl = (u: string) =>
    /\.pdf(\?.*)?$/i.test(u)

  const extractUrls = (text: string) => {
    const urls: string[] = []
    text.replace(urlRegex, (m) => {
      urls.push(m)
      return m
    })
    return urls
  }

  // Admite formato "[video] URL" o "[imagen] URL" o "[audio] URL" o "[documento] URL"
  const parseLabeledMedia = (text: string) => {
    const video = text.match(/^\s*\[video\]\s+(https?:\/\/\S+)/i)
    if (video) return { type: 'video' as const, url: video[1], rest: '' }

    const image = text.match(/^\s*\[(imagen|image|img)\]\s+(https?:\/\/\S+)/i)
    if (image) return { type: 'image' as const, url: image[2], rest: '' }

    const audio = text.match(/^\s*\[(audio|nota\s*de\s*voz)\]\s+(https?:\/\/\S+)/i)
    if (audio) return { type: 'audio' as const, url: audio[2], rest: '' }

    const doc = text.match(/^\s*\[(doc|documento|pdf)\]\s+(https?:\/\/\S+)/i)
    if (doc) return { type: 'document' as const, url: doc[2], rest: '' }

    return null
  }

  const LinkifiedText = ({ text }: { text: string }) => {
    if (!text) return null
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    text.replace(urlRegex, (match, _p1, offset: number) => {
      const i = Number(offset)
      if (i > lastIndex) {
        parts.push(<span key={`t-${i}`}>{text.slice(lastIndex, i)}</span>)
      }
      parts.push(
        <a
          key={`a-${i}`}
          href={match}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-[#9de1fe] break-all"
        >
          {match}
        </a>
      )
      lastIndex = i + match.length
      return match
    })
    if (lastIndex < text.length) {
      parts.push(<span key={`t-end`}>{text.slice(lastIndex)}</span>)
    }
    return <>{parts}</>
  }

  const ImageOrVideo = ({ url }: { url: string }) => {
    if (isVideoUrl(url)) {
      return (
        <div className="rounded-lg overflow-hidden max-w-full max-h-[300px]">
          <video
            src={url}
            controls
            loop
            muted
            playsInline
            className="w-full h-auto outline-none"
          />
        </div>
      )
    }
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt="media"
        className="rounded-lg max-w-full max-h-[300px] object-cover"
      />
    )
  }

  const AudioPreview = ({ url, fallback }: { url?: string; fallback?: string }) => {
    if (url && isAudioUrl(url)) {
      return (
        <div className="rounded-lg overflow-hidden">
          <audio controls src={url} className="w-full outline-none" />
        </div>
      )
    }
    // Sin URL: mostramos chip/placeholder (útil para notas entrantes donde solo guardamos texto)
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black/20">
        <FiMic className="opacity-80" />
        <span className="text-sm opacity-90">{fallback || 'Nota de voz'}</span>
      </div>
    )
  }

  const DocumentPreview = ({ url, fileName }: { url: string; fileName?: string }) => {
    const name = fileName || url.split('/').pop() || 'documento.pdf'
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black/20 hover:bg-black/30 transition underline-offset-2"
      >
        <FiFileText />
        <span className="truncate max-w-[220px]">{name}</span>
      </a>
    )
  }

  /** Decide qué mostrar según campos opcionales o parseo del contenido */
  const renderBubbleContent = (msg: Mensaje, alignRight: boolean) => {
    // 1) Si el backend ya manda mediaType/mediaUrl, respetamos eso
    if (msg.mediaType && msg.mediaUrl) {
      const caption = msg.caption?.trim()
      if (msg.mediaType === 'image' || msg.mediaType === 'video') {
        return (
          <div className="flex flex-col gap-2">
            <ImageOrVideo url={msg.mediaUrl} />
            {caption && <div className="leading-relaxed"><LinkifiedText text={caption} /></div>}
          </div>
        )
      }
      if (msg.mediaType === 'audio') {
        return (
          <div className="flex flex-col gap-2">
            <AudioPreview url={msg.mediaUrl} fallback="Nota de voz" />
            {msg.transcription && (
              <div className="text-xs opacity-80 leading-relaxed">
                <span className="block mb-1">Transcripción:</span>
                {msg.transcription}
              </div>
            )}
          </div>
        )
      }
      if (msg.mediaType === 'document') {
        return (
          <div className="flex flex-col gap-2">
            <DocumentPreview url={msg.mediaUrl} />
            {caption && <div className="leading-relaxed"><LinkifiedText text={caption} /></div>}
          </div>
        )
      }
    }

    // 2) Si no hay campos, intentamos "[tipo] URL"
    const labeled = parseLabeledMedia(msg.contenido)
    if (labeled) {
      if (labeled.type === 'image' || labeled.type === 'video') {
        return (
          <div className="flex flex-col gap-2">
            <ImageOrVideo url={labeled.url} />
          </div>
        )
      }
      if (labeled.type === 'audio') {
        return <AudioPreview url={labeled.url} fallback="Nota de voz" />
      }
      if (labeled.type === 'document') {
        return <DocumentPreview url={labeled.url} />
      }
    }

    // 3) Buscamos URLs y renderizamos previews si hay media reconocible
    const urls = extractUrls(msg.contenido)
    if (urls.length) {
      const unique = Array.from(new Set(urls))
      const hasMedia = unique.some((u) => isImageUrl(u) || isVideoUrl(u) || isAudioUrl(u) || isPdfUrl(u))
      if (hasMedia) {
        const textOnly = msg.contenido.replace(urlRegex, '').trim()
        return (
          <div className="flex flex-col gap-2">
            {unique.map((u, idx) => {
              if (isImageUrl(u) || isVideoUrl(u)) return <ImageOrVideo key={idx} url={u} />
              if (isAudioUrl(u)) return <AudioPreview key={idx} url={u} />
              if (isPdfUrl(u)) return <DocumentPreview key={idx} url={u} />
              return (
                <a
                  key={idx}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline break-all ${alignRight ? 'text-white' : 'text-[#9de1fe]'}`}
                >
                  {u}
                </a>
              )
            })}
            {textOnly && (
              <div className="leading-relaxed">
                <LinkifiedText text={textOnly} />
              </div>
            )}
          </div>
        )
      }
    }

    // 4) Placeholders especiales sin URL (ej: "[nota de voz]" o "[documento]")
    if (/^\s*\[(audio|nota\s*de\s*voz)\]\s*$/i.test(msg.contenido)) {
      return <AudioPreview fallback="Nota de voz" />
    }
    if (/^\s*\[(doc|documento|pdf)\]\s*$/i.test(msg.contenido)) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black/20">
          <FiFileText className="opacity-80" />
          <span className="text-sm opacity-90">Documento</span>
        </div>
      )
    }

    // 5) Texto plano / con links
    return (
      <div className="leading-relaxed">
        <LinkifiedText text={msg.contenido} />
      </div>
    )
  }

  /* ========================= Render ========================= */

  return (
    <div className="flex-1 overflow-hidden relative bg-[#111B21]">
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-2 sm:gap-3
                   [scrollbar-width:thin] [scrollbar-color:#2A3942_transparent]
                   hover:[scrollbar-color:#2A3942_transparent]"
        onScroll={handleScroll}
      >
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
          const esIA = msg.from !== 'client'
          const key =
            msg.externalId ??
            String(msg.id ?? `${msg.from}-${msg.timestamp}-${msg.contenido.slice(0, 16)}`)

          return (
            <div
              key={key}
              className={`max-w-[90%] sm:max-w-[75%] px-4 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap shadow-sm leading-relaxed
                ${esIA ? 'bg-[#005C4B] text-white self-end ml-auto' : 'bg-[#202C33] text-[#e9edef] self-start'}
              `}
            >
              {/* Contenido (texto, links o media) */}
              {renderBubbleContent(msg, esIA)}

              {/* Transcripción como pie, si viene y no se mostró arriba */}
              {msg.mediaType !== 'audio' && msg.transcription && (
                <div className="text-xs opacity-80 leading-relaxed mt-2 border-t border-white/10 pt-2">
                  <span className="inline-flex items-center gap-2"><FiMic />Transcripción:</span>
                  <div className="mt-1">{msg.transcription}</div>
                </div>
              )}

              {/* Hora */}
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
          className="absolute bottom-5 right-4 z-10 bg-[#00A884] hover:bg-[#01976D] text-white w-9 h-9 flex items-center justify-center rounded-full shadow transition-all"
        >
          <FiArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
