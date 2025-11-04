'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { FiSend, FiSmile, FiImage, FiCalendar } from 'react-icons/fi'
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../../context/AuthContext'

type MediaKind = 'image' | 'video' | 'audio' | 'document'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
  onSendGif?: (url: string, isMp4: boolean) => void // compat
  onUploadFile?: (file: File, type: MediaKind) => void
}

/* ---------- Helpers UX ---------- */
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const DarkSwal = Swal.mixin({
  background: '#0B0C14',
  color: '#E5E7EB',
  iconColor: '#A78BFA',
  buttonsStyling: false,
  customClass: {
    popup: 'rounded-2xl border border-white/10 shadow-2xl',
    title: 'text-lg font-semibold',
    htmlContainer: 'text-sm text-gray-200',
    confirmButton:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-400',
    cancelButton:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-white/15 text-white/90 hover:bg-white/5 ml-2',
  },
})

function extractErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  try {
    const j = JSON.parse(raw)
    return (j as any)?.message || (j as any)?.error || (j as any)?.details || (j as any)?.msg || raw
  } catch {
    return raw
  }
}

async function alertSuccess(title: string, text?: string) {
  await DarkSwal.fire({ icon: 'success', title, text, confirmButtonText: 'Aceptar' })
}
async function alertError(title: string, html?: string) {
  await DarkSwal.fire({ icon: 'error', title, html, confirmButtonText: 'Entendido' })
}

/** "YYYY-MM-DDTHH:mm" -> ISO con offset fijo (default Bogotá -05:00) */
function localToISOWithOffset(local: string, offsetMinutes = -300): { iso: string; dateLocal: Date } {
  const [y, m, rest] = local.split('-')
  const [d, hm] = (rest || '').split('T')
  const [H, M] = (hm || '').split(':')
  const dateLocal = new Date(Number(y), Number(m) - 1, Number(d), Number(H || 0), Number(M || 0), 0, 0)

  const sign = offsetMinutes <= 0 ? '-' : '+'
  const abs = Math.abs(offsetMinutes)
  const oh = String(Math.floor(abs / 60)).padStart(2, '0')
  const om = String(abs % 60).padStart(2, '0')
  const tz = `${sign}${oh}:${om}`

  const yyyy = dateLocal.getFullYear()
  const MM = String(dateLocal.getMonth() + 1).padStart(2, '0')
  const dd = String(dateLocal.getDate()).padStart(2, '0')
  const HH = String(dateLocal.getHours()).padStart(2, '0')
  const mm = String(dateLocal.getMinutes()).padStart(2, '0')
  return { iso: `${yyyy}-${MM}-${dd}T${HH}:${mm}:00${tz}`, dateLocal }
}

async function api<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/* ---------- Mini UI Primitives ---------- */
function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ')
}
function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' | 'danger' }
) {
  const { className, variant = 'primary', ...rest } = props
  const base =
    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2'
  const variants = {
    primary: 'text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400',
    ghost: 'text-white/90 hover:bg-white/10',
    outline: 'border border-white/15 text-white hover:bg-white/5',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
  } as const
  return <button className={cx(base, variants[variant], className)} {...rest} />
}

function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl"
      >
        {children}
      </motion.div>
    </div>
  )
}

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-white/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </label>
  )
}
function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="space-y-1 sm:col-span-2">
      <span className="text-xs text-white/80">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </label>
  )
}

/* ---------- Types para cita ---------- */
type CreateApptPayload = {
  name: string
  phone: string
  service: string
  sede?: string
  provider?: string
  startISO: string // "YYYY-MM-DDTHH:mm"
  durationMin?: number
  notes?: string
}

/* ---------- Componente principal ---------- */
export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  onSendGif, // compat
  onUploadFile,
}: Props) {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAppt, setShowAppt] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { token, usuario } = useAuth()
  const empresaId = usuario?.empresaId

  /* ---- Insertar emoji en la posición del caret ---- */
  const insertAtCursor = useCallback(
    (insertText: string) => {
      const el = inputRef.current
      if (!el) {
        onChange(value + insertText)
        return
      }
      const start = el.selectionStart ?? value.length
      const end = el.selectionEnd ?? value.length
      const newVal = value.slice(0, start) + insertText + value.slice(end)
      const caret = start + insertText.length
      onChange(newVal)
      requestAnimationFrame(() => {
        el.focus()
        try {
          el.setSelectionRange(caret, caret)
        } catch {}
      })
    },
    [onChange, value]
  )

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    insertAtCursor(emojiData.emoji)
    setShowEmoji(false)
  }

  /* ---- Teclado ---- */
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // Enviar con Enter (y permitir Ctrl/Cmd+Enter como alternativa)
    const isSubmit =
      (e.key === 'Enter' && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter')
    if (isSubmit) {
      e.preventDefault()
      if (!disabled && value.trim()) onSend()
      return
    }
    if (e.key === 'Escape') {
      if (showEmoji) setShowEmoji(false)
      if (showAppt) setShowAppt(false)
    }
  }

  /* ---- Adjuntos ---- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    let kind: MediaKind = 'document'
    if (f.type.startsWith('image/')) kind = 'image'
    else if (f.type.startsWith('video/')) kind = 'video'
    else if (f.type.startsWith('audio/')) kind = 'audio'
    onUploadFile?.(f, kind)
    e.currentTarget.value = ''
  }

  // Pegar archivos/imágenes directamente en el input
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items
    if (!items || !onUploadFile) return
    for (const it of items) {
      if (it.kind === 'file') {
        const f = it.getAsFile()
        if (!f) continue
        let kind: MediaKind = 'document'
        if (f.type.startsWith('image/')) kind = 'image'
        else if (f.type.startsWith('video/')) kind = 'video'
        else if (f.type.startsWith('audio/')) kind = 'audio'
        onUploadFile(f, kind)
        e.preventDefault()
        break
      }
    }
  }

  /* ---- Crear cita desde el chat (POST al backend) ---- */
  async function createAppointmentFromChat(data: CreateApptPayload) {
    if (!empresaId || !token) {
      await alertError('No se pudo agendar', '<span>Falta sesión o empresa seleccionada.</span>')
      return
    }
    try {
      const { iso: startAtISO, dateLocal } = localToISOWithOffset(data.startISO, -300)
      const durationMin = Number.isFinite(data.durationMin as number) ? (data.durationMin as number) : 30
      const endLocal = new Date(dateLocal.getTime() + durationMin * 60_000)
      const endLocalStr = `${endLocal.getFullYear()}-${String(endLocal.getMonth() + 1).padStart(2, '0')}-${String(
        endLocal.getDate()
      ).padStart(2, '0')}T${String(endLocal.getHours()).padStart(2, '0')}:${String(endLocal.getMinutes()).padStart(
        2,
        '0'
      )}`
      const { iso: endAtISO } = localToISOWithOffset(endLocalStr, -300)

      const body = {
        empresaId,
        customerName: data.name,
        customerPhone: data.phone,
        serviceName: data.service,
        notas: data.notes || null,
        startAt: startAtISO,
        endAt: endAtISO,
        timezone: 'America/Bogota',
      }

      const created = await api<{ id: number; customerName: string; startAt: string }>(
        `/api/appointments?empresaId=${empresaId}`,
        { method: 'POST', body: JSON.stringify(body) },
        token
      )

      await alertSuccess(
        'Cita creada',
        `${created.customerName} • ${new Date(created.startAt).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`
      )
    } catch (err) {
      const msg = extractErrorMessage(err)
      await alertError('No se pudo agendar la cita', `<pre style="text-align:left;white-space:pre-wrap;">${msg}</pre>`)
      throw err
    }
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
            onClick={(e) => {
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

        {/* Agenda: crear cita */}
        <button
          type="button"
          onClick={() => setShowAppt(true)}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50"
          disabled={disabled}
          aria-label="Crear cita"
          title="Crear cita"
        >
          <FiCalendar className="w-5 h-5 text-[#D1D7DB]" />
        </button>

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
          onPaste={handlePaste}
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

      {/* Dialogo para crear cita (mismo layout del calendario) */}
      <Dialog open={showAppt} onClose={() => setShowAppt(false)}>
        <CreateApptForm
          onCancel={() => setShowAppt(false)}
          onSave={async (data) => {
            await createAppointmentFromChat(data)
            setShowAppt(false)
          }}
        />
      </Dialog>
    </div>
  )
}

/* ---------- Formulario Crear Cita (par con appointmentsCalendar) ---------- */
function CreateApptForm({
  onSave,
  onCancel,
}: {
  onSave: (d: CreateApptPayload) => Promise<void> | void
  onCancel: () => void
}) {
  const nowLocal = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const MM = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const HH = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}`
  }, [])

  const [form, setForm] = useState<CreateApptPayload>({
    name: '',
    phone: '',
    service: '',
    sede: '',
    provider: '',
    startISO: nowLocal,
    durationMin: 30,
    notes: '',
  })

  const canSave =
    form.name.trim() &&
    form.phone.trim() &&
    form.service.trim() &&
    form.startISO.length >= 16 &&
    Number(form.durationMin) > 0

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!canSave) return
        await onSave(form)
      }}
      className="space-y-4 text-white"
    >
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FiCalendar className="h-5 w-5" /> Crear nueva cita
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Nombre cliente"
          value={form.name}
          onChange={(v) => setForm((s) => ({ ...s, name: v }))}
          placeholder="Ej. Juan Pérez"
        />
        <Input
          label="Teléfono"
          value={form.phone}
          onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
          placeholder="Ej. +57 300 000 0000"
        />
        <Input
          label="Sede (opcional)"
          value={form.sede || ''}
          onChange={(v) => setForm((s) => ({ ...s, sede: v }))}
          placeholder="Ej. Sede Centro"
        />
        <Input
          label="Profesional (opcional)"
          value={form.provider || ''}
          onChange={(v) => setForm((s) => ({ ...s, provider: v }))}
          placeholder="Ej. Dra. López"
        />
        <Input
          label="Servicio"
          value={form.service}
          onChange={(v) => setForm((s) => ({ ...s, service: v }))}
          placeholder="Ej. Blanqueamiento dental"
        />
        <Input
          label="Fecha y hora"
          type="datetime-local"
          value={form.startISO}
          onChange={(v) => setForm((s) => ({ ...s, startISO: v }))}
        />
        <Input
          label="Duración (min)"
          type="number"
          value={String(form.durationMin || 30)}
          onChange={(v) => setForm((s) => ({ ...s, durationMin: Number(v || 30) }))}
          placeholder="30"
        />
        <TextArea
          label="Notas (opcional)"
          value={form.notes || ''}
          onChange={(v) => setForm((s) => ({ ...s, notes: v }))}
          placeholder="Observaciones, indicaciones…"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className={cx(!canSave && 'opacity-60 pointer-events-none')}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
