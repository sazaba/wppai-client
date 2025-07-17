'use client'

import { FiSend } from 'react-icons/fi'

interface ChatInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  disabled?: boolean
}

export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) {
        onSend()
      }
    }
  }

  return (
    <footer className="flex-shrink-0 px-4 py-3 bg-[#202C33] border-t border-[#2A3942]">
      <div className="flex items-end gap-2">
        <textarea
          placeholder="Escribe un mensaje..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            const target = e.currentTarget
            target.style.height = 'auto'
            target.style.height = `${target.scrollHeight}px`
          }}
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
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
    </footer>
  )
}
