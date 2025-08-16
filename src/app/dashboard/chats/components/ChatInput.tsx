'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FiSend, FiSmile, FiImage } from 'react-icons/fi'
import EmojiPicker, { EmojiClickData, Theme, EmojiStyle } from 'emoji-picker-react'
import axios from 'axios'

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  disabled?: boolean
  /** Si se provee, se usa para enviar el GIF como media al backend */
  onSendGif?: (url: string, isMp4?: boolean) => void
}

type TenorItem = {
  id: string
  media_formats: Record<string, { url: string; duration?: number; dims?: number[] }>
  content_description?: string
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  onSendGif,
}: ChatInputProps) {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showGifs, setShowGifs] = useState(false)
  const [gifQuery, setGifQuery] = useState('trending')
  const [gifResults, setGifResults] = useState<TenorItem[]>([])
  const [gifLoading, setGifLoading] = useState(false)
  const [gifError, setGifError] = useState<string | null>(null)

  const areaRef = useRef<HTMLTextAreaElement | null>(null)
  const emojiRef = useRef<HTMLDivElement | null>(null)
  const gifRef = useRef<HTMLDivElement | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY
  const tenorEnabled = Boolean(TENOR_KEY)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) onSend()
    }
  }

  // Auto-resize
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [value])

  // Cerrar popovers al hacer click fuera
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (showEmoji && emojiRef.current && !emojiRef.current.contains(t)) setShowEmoji(false)
      if (showGifs && gifRef.current && !gifRef.current.contains(t)) setShowGifs(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showEmoji, showGifs])

  // Buscar GIFs (Tenor v2) con debounce
  const doFetchGifs = useCallback(
    async (q: string) => {
      if (!TENOR_KEY) {
        setGifError('Falta NEXT_PUBLIC_TENOR_API_KEY')
        setGifResults([])
        return
      }
      setGifError(null)
      setGifLoading(true)
      try {
        const url = `https://tenor.googleapis.com/v2/${q === 'trending' ? 'featured' : 'search'}`
        const { data } = await axios.get(url, {
          params: {
            key: TENOR_KEY,
            q: q === 'trending' ? undefined : q,
            limit: 24,
            media_filter: 'mp4,gif,tinygif,nanomp4,nanogif',
            random: q === 'trending' ? true : undefined,
          },
        })
        setGifResults(data?.results || [])
      } catch (err) {
        console.error('[Tenor] error:', err)
        setGifError('No se pudo cargar GIFs')
        setGifResults([])
      } finally {
        setGifLoading(false)
      }
    },
    [TENOR_KEY]
  )

  const fetchGifsDebounced = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doFetchGifs(q), 400)
    },
    [doFetchGifs]
  )

  // Dispara búsqueda al abrir o al cambiar query
  useEffect(() => {
    if (showGifs) fetchGifsDebounced(gifQuery)
  }, [showGifs, gifQuery, fetchGifsDebounced])

  const insertAtCursor = (text: string) => {
    const el = areaRef.current
    if (!el) return onChange(value + text)
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + text.length
      el.setSelectionRange(pos, pos)
    })
  }

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    insertAtCursor(emojiData.emoji)
  }

  const handlePickGif = (item: TenorItem) => {
    // Preferimos MP4 para WhatsApp; fallback a tinygif si no hay mp4
    const mp4 =
      item.media_formats['mp4']?.url ||
      item.media_formats['nanomp4']?.url ||
      item.media_formats['tinygif']?.url
    const isMp4 = !!(item.media_formats['mp4']?.url || item.media_formats['nanomp4']?.url)

    if (onSendGif && mp4) {
      onSendGif(mp4, isMp4)
    } else if (mp4) {
      insertAtCursor(` ${mp4} `)
    }
    setShowGifs(false)
  }

  return (
    <footer className="relative flex-shrink-0 px-4 py-3 bg-[#202C33] border-t border-[#2A3942]">
      <div className="flex items-end gap-2">

        {/* Botón Emoji */}
        <div className="relative" ref={emojiRef}>
          <button
            type="button"
            onClick={() => { setShowEmoji(v => !v); setShowGifs(false) }}
            className="p-2 rounded-full bg-[#2A3942] text-white hover:bg-[#35464f] transition"
            disabled={disabled}
            aria-label="Emojis"
            title="Emojis"
          >
            <FiSmile className="w-5 h-5" />
          </button>

          {showEmoji && (
            <div className="absolute bottom-14 left-0 z-50 rounded-xl shadow-xl overflow-hidden">
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={handleEmojiSelect}
                lazyLoadEmojis
                emojiStyle={EmojiStyle.NATIVE}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* Botón GIF */}
        <div className="relative" ref={gifRef}>
          <button
            type="button"
            onClick={() => { setShowGifs(v => !v); setShowEmoji(false) }}
            className={`px-3 py-2 rounded-full transition text-xs font-semibold ${
              tenorEnabled
                ? 'bg-[#2A3942] text-white hover:bg-[#35464f]'
                : 'bg-[#2A3942] text-[#5B6B75] cursor-not-allowed'
            }`}
            disabled={disabled || !tenorEnabled}
            aria-label="GIFs"
            title={tenorEnabled ? 'GIFs' : 'Configura NEXT_PUBLIC_TENOR_API_KEY'}
          >
            <span className="inline-flex items-center gap-2">
              <FiImage className="w-4 h-4" /> GIF
            </span>
          </button>

          {showGifs && (
            <div className="absolute bottom-14 left-0 z-50 w-[420px] max-h-[360px] bg-[#111B21] border border-[#2A3942] rounded-xl shadow-xl p-3">
              <input
                type="text"
                placeholder="Buscar GIFs (Tenor)…"
                className="w-full mb-3 px-3 py-2 rounded-md bg-[#2A3942] text-white placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#00A884]"
                value={gifQuery}
                onChange={(e) => setGifQuery(e.target.value || 'trending')}
              />
              {gifError && (
                <div className="text-xs text-red-400 mb-2">{gifError}</div>
              )}
              {gifLoading ? (
                <div className="text-[#8696a0] text-sm">Buscando…</div>
              ) : (
                <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-64 pr-1">
                  {gifResults.map((g) => {
                    const thumb =
                      g.media_formats['tinygif']?.url ||
                      g.media_formats['gif']?.url ||
                      g.media_formats['nanomp4']?.url ||
                      g.media_formats['mp4']?.url
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handlePickGif(g)}
                        className="relative group rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#00A884]"
                        title={g.content_description || 'GIF'}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumb}
                          alt={g.content_description || 'gif'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <textarea
          ref={areaRef}
          placeholder="Escribe un mensaje..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ maxHeight: '140px', overflowY: 'auto' }}
          disabled={disabled}
          className="flex-1 resize-none bg-[#2A3942] text-white border border-[#2A3942] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A884] placeholder-[#8696a0] disabled:opacity-60"
        />

        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className={`p-3 rounded-full transition ${
            disabled || !value.trim()
              ? 'bg-[#2A3942] text-[#5B6B75] cursor-not-allowed'
              : 'bg-[#00A884] hover:bg-[#01976D] text-white'
          }`}
          aria-label="Enviar"
          title="Enviar"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
    </footer>
  )
}
