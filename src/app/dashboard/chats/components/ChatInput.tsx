'use client'

import { useRef, useState } from 'react'
import { FiSend, FiSmile, FiImage } from 'react-icons/fi'
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react'

type MediaKind = 'image' | 'video' | 'audio' | 'document'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
  onSendGif?: (url: string, isMp4: boolean) => void // compat
  onUploadFile?: (file: File, type: MediaKind) => void
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  onSendGif, // compat (no usado)
  onUploadFile,
}: Props) {
  const [showEmoji, setShowEmoji] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(value + emojiData.emoji)
    setShowEmoji(false)
    // Devolvemos el foco al input para seguir escribiendo fluido
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSend()
      return
    }
    // Cerrar el picker con Escape si está abierto
    if (e.key === 'Escape' && showEmoji) {
      setShowEmoji(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    let kind: MediaKind = 'document'
    if (f.type.startsWith('image/')) kind = 'image'
    else if (f.type.startsWith('video/')) kind = 'video'
    else if (f.type.startsWith('audio/')) kind = 'audio'
    onUploadFile?.(f, kind)
    // limpiamos input para poder volver a elegir el mismo archivo
    e.currentTarget.value = ''
  }

  return (
    <div className="relative border-t border-white/10 bg-[#202C33] p-2">
      <div className="flex items-center gap-2">
        {/* Emoji */}
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50"
          disabled={disabled}
          aria-label="Emoji"
          title="Emoji"
        >
          <FiSmile className="w-5 h-5 text-[#D1D7DB]" />
        </button>

        {showEmoji && (
          <div
            className="absolute bottom-14 left-2 z-50"
            // Si haces click fuera del picker dentro de este contenedor, lo cerramos
            onClick={(e) => {
              // Evita que un click dentro del picker cierre por bubbling
              if (e.target === e.currentTarget) setShowEmoji(false)
            }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              searchDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        {/* Multimedia (imagen / video / audio / doc) */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50"
          disabled={disabled}
          aria-label="Adjuntar archivo"
          title="Adjuntar archivo"
        >
          <FiImage className="w-5 h-5 text-[#D1D7DB]" />
        </button>
        <input
          ref={fileRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />

        {/* Campo de texto */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje"
          className="flex-1 bg-[#2A3942] text-white placeholder:text-[#8696A0] px-3 py-2 rounded-2xl outline-none border border-transparent focus:border-emerald-500"
          disabled={disabled}
        />

        {/* Enviar */}
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Enviar"
          title="Enviar"
        >
          <FiSend className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  )
}
