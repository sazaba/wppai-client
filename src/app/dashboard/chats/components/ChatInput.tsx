'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiSend, FiSmile, FiImage, FiCalendar, FiChevronUp, FiChevronDown, FiLoader } from 'react-icons/fi'
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
  onSendGif?: (url: string, isMp4: boolean) => void
  onUploadFile?: (file: File, type: MediaKind) => void
  onAppointmentCreated?: (created: { id: number; startAt: string }) => void
  conversationId?: number
  chatPhone?: string
  summaryText?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const CI = {
  state: (id: number) => `/api/chat-input/state/${id}`,
  meta:  (id: number) => `/api/chat-input/meta/${id}`,
  staff: `/api/chat-input/staff`,
  services: `/api/chat-input/services`,
}

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
      'inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-400',
    cancelButton:
      'inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-white/15 text-white/90 hover:bg-white/5 ml-2',
  },
})

function extractErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  try {
    const j = JSON.parse(raw)
    return (j as any)?.message || (j as any)?.error || (j as any)?.details || (j as any)?.msg || raw
  } catch { return raw }
}

async function alertSuccess(title: string, text?: string) {
  await DarkSwal.fire({ icon: 'success', title, text, confirmButtonText: 'Aceptar' })
}
async function alertError(title: string, html?: string) {
  await DarkSwal.fire({ icon: 'error', title, html, confirmButtonText: 'Entendido' })
}

/** 🔔 Pregunta si quieres enviar recordatorio 24h antes para ESTA cita */
async function confirmReminder24h(): Promise<boolean> {
  const res = await DarkSwal.fire({
    icon: 'question',
    title: '¿Enviar recordatorio 24 horas antes?',
    html: `
      <p style="font-size:13px;line-height:1.4;">
        Si aceptas, se enviará un mensaje automático 24 horas antes de la cita
        para que el paciente confirme su asistencia.
      </p>
    `,
    showCancelButton: true,
    confirmButtonText: 'Sí, enviar recordatorio',
    cancelButtonText: 'No, solo agendar',
    reverseButtons: true,
  })
  return res.isConfirmed === true
}

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

function cx(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(' ') }

type CreateApptPayload = {
  name: string
  phone: string
  service: string
  sede?: string
  provider?: string
  startISO: string
  durationMin?: number
  notes?: string
  /** Flag por cita: si se debe enviar recordatorio 24h antes */
  sendReminder24h?: boolean
}

function extractAgendaFromState(state?: any): { nombre?: string; servicio?: string } {
  if (!state) return {}
  const nombre = state?.draft?.name || state?.draft?.pendingConfirm?.name
  const servicio = state?.draft?.procedureName || state?.draft?.pendingConfirm?.procedureName
  return { nombre, servicio }
}

function extractAgendaFromSummaryBlock(summary?: string): {
  nombre?: string;
  servicio?: string;
  telefono?: string;
} {
  if (!summary) return {}
  const m = /=== AGENDA_COLECTADA ===([\s\S]*?)=== FIN_AGENDA ===/m.exec(summary)
  if (!m) return {}
  const block = m[1] || ''
  const take = (label: string) => {
    const rx = new RegExp(String.raw`^\s*${label}\s*:\s*(.+)\s*$`, 'mi')
    const mm = rx.exec(block)
    const v = (mm?.[1] || '').trim()
    return v && v !== '—' ? v : undefined
  }

  const nombre = take('nombre')
  const servicio = take('tratamiento')
  const telefono = take('telefono') || take('teléfono')

  return { nombre, servicio, telefono }
}


function extractStaffFromSummaryText(summaryText?: string): Array<{ id: number; name: string }> {
  if (!summaryText) return []
  const staffBlock = /=== STAFF ===([\s\S]*?)=== FIN_STAFF ===/m.exec(summaryText)?.[1] || ''
  const out: Array<{ id: number; name: string }> = []
  staffBlock.split('\n').forEach((line) => {
    const m = /id\s*=\s*(\d+)\s*;\s*name\s*=\s*([^;]+)\s*;/i.exec(line)
    if (m) out.push({ id: Number(m[1]), name: m[2].trim() })
  })
  return out
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  onSendGif,
  onUploadFile,
  onAppointmentCreated,
  conversationId,
  chatPhone,
  summaryText,
}: Props) {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAppt, setShowAppt] = useState(false)
  const [staffOpts, setStaffOpts] = useState<Array<{ id: number; name: string }>>([])
  const [serviceOpts, setServiceOpts] = useState<Array<{ id: number; name: string; defaultDuration?: number }>>([])
  const [lockedName, setLockedName] = useState<string>('')
  const [lockedService, setLockedService] = useState<string>('')
  const [lockedPhone, setLockedPhone] = useState<string>(chatPhone || '')
  const fileRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { token, usuario } = useAuth()
  const empresaId = usuario?.empresaId

  useEffect(() => {
    const loadStaff = async () => {
      if (!token) return
      try {
        const res = await api<{ ok: boolean; data: Array<{ id: number; name: string; active?: boolean }> }>(
          CI.staff, undefined, token
        )
        const list = Array.isArray(res?.data) ? res.data : []
        const active = list.filter((s) => s && (s as any).active !== false)
        setStaffOpts(active.map((s) => ({ id: s.id, name: s.name })))
      } catch {}
    }
    loadStaff()
  }, [token])

  useEffect(() => {
    const loadServices = async () => {
      if (!token) return
      try {
        const res = await api<{ ok: boolean; data: Array<{ id: number; name: string; active?: boolean; defaultDuration?: number }> }>(
          CI.services, undefined, token
        )
        const list = Array.isArray(res?.data) ? res.data : []
        const active = list.filter((s) => s && (s as any).active !== false)
        setServiceOpts(active.map((s) => ({ id: s.id, name: s.name, defaultDuration: (s as any).defaultDuration })))
      } catch {}
    }
    loadServices()
  }, [token])

  useEffect(() => {
    // Si cambió el summary, volvemos a leer todo y SOBREESCRIBIMOS
    if (summaryText) {
      const staffFromSummary = extractStaffFromSummaryText(summaryText)
      if (staffFromSummary.length) {
        setStaffOpts((prev) => (prev.length ? prev : staffFromSummary))
      }
  
      const agBlock = extractAgendaFromSummaryBlock(summaryText)
  
      if (agBlock.nombre) {
        setLockedName(agBlock.nombre)
      }
      if (agBlock.servicio) {
        setLockedService(agBlock.servicio)
      }
      if (agBlock.telefono) {
        setLockedPhone(agBlock.telefono)
      }
    }
  
    // Si cambia el teléfono del chat, también lo actualizamos
    if (chatPhone) {
      setLockedPhone(chatPhone)
    }
  }, [summaryText, chatPhone])
  

  useEffect(() => {
    const prime = async () => {
      // 👈 Solo tiene sentido pedir el estado cuando voy a abrir el modal
      if (!conversationId || !token || !showAppt) return
  
      try {
        const stateResp = await api<any>(CI.state(conversationId), undefined, token)
  
        // 🔎 En tu caso el estado viene como el JSON que pegaste (sin .data)
        // pero dejamos compatibilidad por si en otro entorno viene con .data.
        const state = (stateResp as any)?.data ?? stateResp ?? null
  
        // 1) Nombre y servicio desde draft del conversation_state
        const { nombre, servicio } = extractAgendaFromState(state)
        if (nombre) setLockedName(nombre)
        if (servicio) setLockedService(servicio)
  
        // 2) Teléfono si el estado lo trae
        const phoneFromState =
          stateResp?.phone ||
          state?.phone ||
          stateResp?.conversation?.phone ||
          state?.conversation?.phone
        if (phoneFromState) setLockedPhone(String(phoneFromState))
  
        // 3) Summary del estado (por si luego agregas AGENDA_COLECTADA)
        const summaryFromStateText =
          stateResp?.summary?.text ||
          state?.summary?.text ||
          null
  
        const staffFromSummary = extractStaffFromSummaryText(summaryFromStateText || '')
        if (staffFromSummary.length && !staffOpts.length) setStaffOpts(staffFromSummary)
  
        if (summaryFromStateText) {
          const agBlock = extractAgendaFromSummaryBlock(summaryFromStateText)
          if (agBlock.nombre) setLockedName(agBlock.nombre)
          if (agBlock.servicio) setLockedService(agBlock.servicio)
          if (agBlock.telefono) setLockedPhone(agBlock.telefono)
        }
      } catch {
        // 🔁 Fallback a /meta si /state falla
        try {
          const meta = await api<any>(CI.meta(conversationId), undefined, token)
  
          const phoneFromConv = meta?.phone || meta?.conversation?.phone
          if (phoneFromConv) setLockedPhone(String(phoneFromConv))
  
          const summaryFromMetaText = (meta?.summary?.text as string | undefined) || ''
          const staffFromSummary = extractStaffFromSummaryText(summaryFromMetaText)
          if (staffFromSummary.length && !staffOpts.length) setStaffOpts(staffFromSummary)
  
          const agBlock = extractAgendaFromSummaryBlock(summaryFromMetaText)
          if (agBlock.nombre) setLockedName(agBlock.nombre)
          if (agBlock.servicio) setLockedService(agBlock.servicio)
          if (agBlock.telefono) setLockedPhone(agBlock.telefono)
        } catch {}
      }
    }
  
    prime()
  }, [conversationId, token, showAppt])
  

  const insertAtCursor = useCallback(
    (insertText: string) => {
      const el = inputRef.current
      if (!el) { onChange(value + insertText); return }
      const start = el.selectionStart ?? value.length
      const end = el.selectionEnd ?? value.length
      const newVal = value.slice(0, start) + insertText + value.slice(end)
      const caret = start + insertText.length
      onChange(newVal)
      requestAnimationFrame(() => {
        el.focus()
        try { el.setSelectionRange(caret, caret) } catch {}
      })
    },
    [onChange, value]
  )
  const handleEmojiClick = (emojiData: EmojiClickData) => { insertAtCursor(emojiData.emoji); setShowEmoji(false) }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const isSubmit =
      (e.key === 'Enter' && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter')
    if (isSubmit) {
      e.preventDefault()
      if (!disabled && value.trim()) onSend()
      return
    }
    if (e.key === 'Escape') { if (showEmoji) setShowEmoji(false); if (showAppt) setShowAppt(false) }
  }

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

  async function createAppointmentFromChat(data: CreateApptPayload) {
    if (!empresaId || !token) {
      await alertError('No se pudo agendar', '<span>Falta sesión o empresa seleccionada.</span>')
      return
    }
    if (!data.name?.trim())  { await alertError('Falta el nombre'); return }
    if (!data.service?.trim()) { await alertError('Falta el servicio'); return }
    if (!data.phone?.trim()) { await alertError('Falta el teléfono'); return }

    try {
      // 🔔 Preguntamos si queremos recordatorio 24h ANTES de construir el body
      const sendReminder24h = await confirmReminder24h()

      const { iso: startAtISO, dateLocal } = localToISOWithOffset(data.startISO, -300)
      const durationMin = Number.isFinite(data.durationMin as number) ? (data.durationMin as number) : 30
      const endLocal = new Date(dateLocal.getTime() + durationMin * 60_000)
      const endLocalStr =
        `${endLocal.getFullYear()}-${String(endLocal.getMonth() + 1).padStart(2, '0')}-${String(endLocal.getDate()).padStart(2, '0')}T` +
        `${String(endLocal.getHours()).padStart(2, '0')}:${String(endLocal.getMinutes()).padStart(2, '0')}`
      const { iso: endAtISO } = localToISOWithOffset(endLocalStr, -300)

      const body = {
        empresaId,
        conversationId: conversationId ?? null,
        customerName: data.name,
        customerPhone: data.phone,
        serviceName: data.service,
        providerName: data.provider || null,
        sede: data.sede || null,
        notas: data.notes || null,
        startAt: startAtISO,
        endAt: endAtISO,
        timezone: 'America/Bogota',
        // 👇 nuevo flag por cita
        sendReminder24h,
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

      onAppointmentCreated?.({ id: created.id, startAt: created.startAt })
    } catch (err) {
      const msg = extractErrorMessage(err)
      await alertError('No se pudo agendar la cita', `<pre style="text-align:left;white-space:pre-wrap;">${msg}</pre>`)
      throw err
    }
  }

  return (
    <div className="relative border-t border-white/10 bg-[#202C33] p-2">
      <div className="flex items-center gap-2">
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
          <div className="absolute bottom-14 left-2 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              searchDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

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

      <Dialog open={showAppt} onClose={() => setShowAppt(false)}>
        <CreateApptForm
          defaultName={lockedName}
          defaultPhone={lockedPhone}
          defaultService={lockedService}
          staffOptions={staffOpts}
          serviceOptions={serviceOpts}
          onCancel={() => setShowAppt(false)}
          onSave={async (payload) => {
            await createAppointmentFromChat(payload)
            setShowAppt(false)
          }}
        />
      </Dialog>

      <style jsx global>{`
        .whatsapp-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.18) transparent;
        }
        .whatsapp-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .whatsapp-scroll::-webkit-scrollbar-track { background: transparent; }
        .whatsapp-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.14);
          border-radius: 9999px;
          border: 2px solid transparent;
        }
        .whatsapp-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,.22); }

        .no-native-spin::-webkit-outer-spin-button,
        .no-native-spin::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-native-spin { -moz-appearance: textfield; }
      `}</style>
    </div>
  )
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
        className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-900 p-0 text-white shadow-2xl"
      >
        <div className="max-h-[75vh] overflow-y-auto whatsapp-scroll p-6">
          {children}
        </div>
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
  disabled,
  readOnly,
  rightIcon,
  helpText,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  rightIcon?: React.ReactNode
  helpText?: string
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-white/80">{label}</span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cx(
            'w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-3 pr-10 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
          disabled={disabled}
          readOnly={readOnly}
        />
        {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">{rightIcon}</span>}
      </div>
      {helpText && <span className="text-[11px] text-white/50">{helpText}</span>}
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  helpText,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  helpText?: string
}) {
  return (
    <label className="space-y-1 w-full">
      <span className="text-xs text-white/80">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(
          'w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
        disabled={disabled}
        readOnly={readOnly}
      />
      {helpText && <span className="text-[11px] text-white/50">{helpText}</span>}
    </label>
  )
}

function CreateApptForm({
  onSave,
  onCancel,
  defaultName,
  defaultPhone,
  defaultService,
  staffOptions,
  serviceOptions,
}: {
  onSave: (d: CreateApptPayload) => Promise<void> | void
  onCancel: () => void
  defaultName: string
  defaultPhone: string
  defaultService: string
  staffOptions: Array<{ id: number; name: string }>
  serviceOptions: Array<{ id: number; name: string; defaultDuration?: number }>
}) {
  const now = new Date()
  const yyyy = now.getFullYear()
  const MM = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const HH = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')

  const [name, setName] = useState(defaultName || '')
  const [phone, setPhone] = useState(defaultPhone || '')
  const [service, setService] = useState(defaultService || '')
  const [sede, setSede] = useState('')
  const [provider, setProvider] = useState('')
  const [dateTime, setDateTime] = useState(`${yyyy}-${MM}-${dd}T${HH}:${mm}`)
  const [durationMin, setDurationMin] = useState<number>(30)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!service || !serviceOptions.length) return
    const found = serviceOptions.find(s => s.name === service)
    if (found?.defaultDuration && Number.isFinite(found.defaultDuration)) {
      setDurationMin(found.defaultDuration as number)
    }
  }, [serviceOptions, service])

  useEffect(() => { if (defaultName) setName(defaultName) }, [defaultName])
  useEffect(() => { if (defaultPhone) setPhone(defaultPhone) }, [defaultPhone])
  useEffect(() => { if (defaultService) setService(defaultService) }, [defaultService])

  const canSave =
    name.trim() && phone.trim() && service.trim() &&
    dateTime.length >= 16 && Number(durationMin) > 0 && !saving

  const bump = (delta: number) => setDurationMin((v) => Math.max(1, v + delta))

  const suggestedChips = useMemo(() => {
    const base = [15, 30, 45, 60, 90]
    const current = serviceOptions.find(s => s.name === service)?.defaultDuration
    const list = current && !base.includes(current) ? [...base, current] : base
    return [...new Set(list)].sort((a, b) => a - b)
  }, [serviceOptions, service])

  const suggestedMsg = useMemo(() => {
    const d = serviceOptions.find(s => s.name === service)?.defaultDuration
    return d ? `Sugerido por servicio: ${d} min` : ''
  }, [serviceOptions, service])

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault()
        if (!canSave) return
        setSaving(true)
        try {
          const payload: CreateApptPayload = {
            name, phone, service, sede, provider,
            startISO: dateTime, durationMin, notes,
          }
          await onSave(payload)
        } finally {
          setSaving(false)
        }
      }}
      className="space-y-6 text-white"
    >
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FiCalendar className="h-5 w-5" /> Crear nueva cita
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
        <Input label="Nombre cliente" value={name} onChange={setName} />
        <Input label="Teléfono (chat)" value={phone} onChange={setPhone} />
        <label className="space-y-1">
          <span className="text-xs text-white/80">Servicio</span>
          <select
            value={service}
            onChange={(e) => {
              const v = e.target.value
              setService(v)
              const opt = serviceOptions.find(s => s.name === v)
              if (opt?.defaultDuration && Number.isFinite(opt.defaultDuration)) {
                setDurationMin(opt.defaultDuration as number)
              }
            }}
            className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{service ? `(Mantener: ${service})` : '(Selecciona un servicio)'}</option>
            {serviceOptions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}{s.defaultDuration ? ` — ${s.defaultDuration} min` : ''}
              </option>
            ))}
          </select>
          {suggestedMsg && <span className="text-[11px] text-emerald-300">{suggestedMsg}</span>}
        </label>
        <Input label="Sede (opcional)" value={sede} onChange={setSede} placeholder="Ej. Sede Centro" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 items-start">
        <label className="space-y-1">
          <span className="text-xs text-white/80">Profesional (staff)</span>
          <select
            value={provider || ''}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">(Sin preferencia)</option>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <span className="text-[11px] text-white/50">Se carga por API o desde summary STAFF</span>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-white/80">Fecha y hora</span>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 items-start">
        <div className="space-y-2">
          <span className="text-xs text-white/80">Duración (min)</span>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={String(durationMin)}
              onChange={(e) => {
                const n = Number((e.target.value || '').replace(/[^\d]/g, '')) || 1
                setDurationMin(Math.max(1, n))
              }}
              className="no-native-spin w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-3 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="30"
              min={1}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
              <button type="button" onClick={() => bump(+5)} className="rounded-lg p-1 hover:bg-white/10" title="+5">
                <FiChevronUp />
              </button>
              <button type="button" onClick={() => bump(-5)} className="rounded-lg p-1 hover:bg-white/10" title="-5">
                <FiChevronDown />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {suggestedChips.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDurationMin(m)}
                className={cx(
                  'rounded-lg px-2 py-1 text-xs border border-white/15 hover:bg-white/5',
                  durationMin === m && 'border-emerald-400 bg-emerald-500/10'
                )}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div className="w-full">
          <TextArea
            label="Notas (opcional)"
            value={notes}
            onChange={setNotes}
            placeholder="Observaciones, indicaciones…"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <button
          type="submit"
          disabled={!canSave}
          className={cx(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {saving && <FiLoader className="h-4 w-4 animate-spin" />} Guardar
        </button>
      </div>
    </form>
  )
}
