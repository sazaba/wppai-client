'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiSend, FiSmile, FiImage, FiCalendar, FiUser, FiPhone, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
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

/* ---------- Config endpoints ---------- */
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const CI = {
  state: (id: number) => `/api/chat-input/state/${id}`,
  meta:  (id: number) => `/api/chat-input/meta/${id}`,
  staff: `/api/chat-input/staff`,
}

/* ---------- SweetAlert Dark ---------- */
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

function cx(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(' ') }

/* ---------- Types ---------- */
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

function extractAgendaFromState(state?: any): { nombre?: string; servicio?: string } {
  if (!state) return {}
  const nombre = state?.draft?.name || state?.draft?.pendingConfirm?.name
  const servicio = state?.draft?.procedureName || state?.draft?.pendingConfirm?.procedureName
  return { nombre, servicio }
}

/** Fallback si aún usas el bloque AGENDA_COLECTADA en summary.text */
function extractAgendaFromSummaryBlock(summary?: string): { nombre?: string; servicio?: string } {
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
  return { servicio: take('tratamiento'), nombre: take('nombre') }
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

/* =========================================================
   CHAT INPUT
========================================================= */
export default function ChatInput({
  value, onChange, onSend, disabled, onSendGif, onUploadFile, onAppointmentCreated,
  conversationId, chatPhone, summaryText,
}: Props) {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAppt, setShowAppt] = useState(false)
  const [staffOpts, setStaffOpts] = useState<Array<{ id: number; name: string }>>([])
  const [lockedName, setLockedName] = useState<string>('')       // editable
  const [lockedService, setLockedService] = useState<string>('') // editable
  const [lockedPhone, setLockedPhone] = useState<string>(chatPhone || '') // editable
  const fileRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { token, usuario } = useAuth()
  const empresaId = usuario?.empresaId

  /* ---- Staff ---- */
  useEffect(() => {
    const loadStaff = async () => {
      if (!token) return
      try {
        const res = await api<{ ok: boolean; data: Array<{ id: number; name: string; role?: string; active?: boolean }> }>(
          CI.staff, undefined, token
        )
        const list = Array.isArray(res?.data) ? res.data : []
        const active = list.filter((s) => s && (s as any).active !== false)
        setStaffOpts(active.map((s) => ({ id: s.id, name: s.name })))
      } catch {/* noop */}
    }
    loadStaff()
  }, [token])

  /* ---- Primeros datos desde props ---- */
  useEffect(() => {
    if (summaryText) {
      const staffFromSummary = extractStaffFromSummaryText(summaryText)
      if (staffFromSummary.length && !staffOpts.length) setStaffOpts(staffFromSummary)
      const agBlock = extractAgendaFromSummaryBlock(summaryText)
      if (agBlock.nombre && !lockedName) setLockedName(agBlock.nombre)
      if (agBlock.servicio && !lockedService) setLockedService(agBlock.servicio)
    }
    if (chatPhone && !lockedPhone) setLockedPhone(chatPhone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryText, chatPhone])

  /* ---- Leer estado de conversación (fuente principal) ---- */
  useEffect(() => {
    const prime = async () => {
      if (!conversationId || !token) return
      try {
        const stateResp = await api<any>(CI.state(conversationId), undefined, token)
        const state = stateResp?.data ?? null
        const { nombre, servicio } = extractAgendaFromState(state)
        if (nombre && !lockedName) setLockedName(nombre)
        if (servicio && !lockedService) setLockedService(servicio)

        const phoneFromState = stateResp?.phone || state?.phone || stateResp?.conversation?.phone
        if (phoneFromState && !lockedPhone) setLockedPhone(String(phoneFromState))

        const summaryFromStateText = stateResp?.summary?.text || state?.summary?.text || null
        const staffFromSummary = extractStaffFromSummaryText(summaryFromStateText || '')
        if (staffFromSummary.length && !staffOpts.length) setStaffOpts(staffFromSummary)

        if ((!nombre || !servicio) && summaryFromStateText) {
          const agBlock = extractAgendaFromSummaryBlock(summaryFromStateText)
          if (agBlock.nombre && !lockedName) setLockedName(agBlock.nombre)
          if (agBlock.servicio && !lockedService) setLockedService(agBlock.servicio)
        }
      } catch {
        try {
          const meta = await api<any>(CI.meta(conversationId), undefined, token)
          const phoneFromConv = meta?.phone
          if (phoneFromConv && !lockedPhone) setLockedPhone(String(phoneFromConv))
          const summaryFromMetaText = meta?.summary?.text as string | undefined
          const staffFromSummary = extractStaffFromSummaryText(summaryFromMetaText || '')
          if (staffFromSummary.length && !staffOpts.length) setStaffOpts(staffFromSummary)
          const agBlock = extractAgendaFromSummaryBlock(summaryFromMetaText || '')
          if (agBlock.nombre && !lockedName) setLockedName(agBlock.nombre)
          if (agBlock.servicio && !lockedService) setLockedService(agBlock.servicio)
        } catch {/* noop */}
      }
    }
    prime()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, token])

  /* ---- Emoji ---- */
  const insertAtCursor = useCallback((insertText: string) => {
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
  }, [onChange, value])
  const handleEmojiClick = (emojiData: EmojiClickData) => { insertAtCursor(emojiData.emoji); setShowEmoji(false) }

  /* ---- Teclado ---- */
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const isSubmit = (e.key === 'Enter' && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter')
    if (isSubmit) { e.preventDefault(); if (!disabled && value.trim()) onSend(); return }
    if (e.key === 'Escape') { if (showEmoji) setShowEmoji(false); if (showAppt) setShowAppt(false) }
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

  /* ---- Crear cita ---- */
  async function createAppointmentFromChat(data: CreateApptPayload) {
    if (!empresaId || !token) {
      await DarkSwal.fire({ icon: 'error', title: 'No se pudo agendar', text: 'Falta sesión o empresa seleccionada.' })
      return
    }
    if (!data.name?.trim())  { await DarkSwal.fire({ icon:'error', title:'Falta el nombre' }); return }
    if (!data.service?.trim()) { await DarkSwal.fire({ icon:'error', title:'Falta el servicio' }); return }
    if (!data.phone?.trim()) { await DarkSwal.fire({ icon:'error', title:'Falta el teléfono' }); return }

    try {
      const { iso: startAtISO, dateLocal } = localToISOWithOffset(data.startISO, -300)
      const durationMin = Number.isFinite(data.durationMin as number) ? (data.durationMin as number) : 30
      const endLocal = new Date(dateLocal.getTime() + durationMin * 60_000)
      const endLocalStr =
        `${endLocal.getFullYear()}-${String(endLocal.getMonth() + 1).padStart(2, '0')}-${String(endLocal.getDate()).padStart(2, '0')}T` +
        `${String(endLocal.getHours()).padStart(2, '0')}:${String(endLocal.getMinutes()).padStart(2, '0')}`
      const { iso: endAtISO } = localToISOWithOffset(endLocalStr, -300)

      const body = {
        empresaId,
        customerName: data.name,
        customerPhone: data.phone,
        serviceName: data.service,
        providerName: data.provider || null,
        sede: data.sede || null,
        notas: data.notes || null,
        startAt: startAtISO,
        endAt: endAtISO,
        timezone: 'America/Bogota',
      }

      const created = await api<{ id: number; customerName: string; startAt: string }>(
        `/api/appointments?empresaId=${empresaId}`, { method: 'POST', body: JSON.stringify(body) }, token
      )

      await DarkSwal.fire({
        icon: 'success',
        title: 'Cita creada',
        text: `${created.customerName} • ${new Date(created.startAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}`
      })
      onAppointmentCreated?.({ id: created.id, startAt: created.startAt })
    } catch (err) {
      const msg = extractErrorMessage(err)
      await DarkSwal.fire({ icon:'error', title:'No se pudo agendar la cita', html:`<pre style="text-align:left;white-space:pre-wrap;">${msg}</pre>` })
      throw err
    }
  }

  return (
    <div className="relative border-t border-white/10 bg-[#202C33] p-3">
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

        {/* Crear cita */}
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

        {/* Adjuntar */}
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

      {/* Dialogo Crear Cita */}
      <Dialog open={showAppt} onClose={() => setShowAppt(false)}>
        <CreateApptForm
          defaultName={lockedName}
          defaultPhone={lockedPhone}
          defaultService={lockedService}
          staffOptions={staffOpts}
          onCancel={() => setShowAppt(false)}
          onSave={async (payload) => {
            await createAppointmentFromChat(payload)
            setShowAppt(false)
          }}
        />
      </Dialog>
    </div>
  )
}

/* =========================================================
   UI PRIMITIVOS
========================================================= */
function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' | 'danger' }
) {
  const { className, variant = 'primary', ...rest } = props
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2'
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
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F1216] p-6 text-white shadow-2xl"
      >
        {children}
      </motion.div>
    </div>
  )
}

function FieldLabel({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/80">
      {icon} <span>{text}</span>
    </div>
  )
}

function Input({
  label, icon, type = 'text', value, onChange, placeholder, disabled, readOnly,
}: {
  label: string
  icon?: React.ReactNode
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
}) {
  return (
    <label className="space-y-1">
      <FieldLabel icon={icon} text={label} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(
          'w-full rounded-xl border border-white/10 bg-[#0B0E12] px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
        disabled={disabled}
        readOnly={readOnly}
      />
    </label>
  )
}

function TextArea({
  label, value, onChange, placeholder, disabled, readOnly,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
}) {
  return (
    <label className="space-y-1 sm:col-span-2">
      <FieldLabel text={label} />
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(
          'w-full rounded-xl border border-white/10 bg-[#0B0E12] px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
        disabled={disabled}
        readOnly={readOnly}
      />
    </label>
  )
}

/* =========================================================
   COMPONENTES: DatePicker + MinutePicker (premium)
========================================================= */
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0) }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1) }
function sameYMD(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function CustomDatePicker({
  value, onChange,
}: {
  /** value en formato YYYY-MM-DD */
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const parts = value?.split('-').map(Number)
    return (parts?.length === 3) ? new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1) : new Date()
  })
  const selected = useMemo(() => {
    const p = value?.split('-').map(Number) || []
    return (p.length === 3) ? new Date(p[0], (p[1] || 1) - 1, p[2] || 1) : null
  }, [value])

  const first = startOfMonth(viewDate)
  const last = endOfMonth(viewDate)
  const firstWeekday = (first.getDay() + 6) % 7 // convertir domingo=0 a lunes=0
  const totalDays = last.getDate()

  const days: Array<Date | null> = []
  for (let i = 0; i < firstWeekday; i++) days.push(null)
  for (let d = 1; d <= totalDays; d++) days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))

  const monthName = viewDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' })

  function choose(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${dd}`)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full rounded-xl border border-white/10 bg-[#0B0E12] px-3 py-2 text-sm text-white text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {value || 'Selecciona fecha'}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0F1216] p-3 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/10"
              onClick={() => setViewDate(v => addMonths(v, -1))}
              aria-label="Mes anterior"
            >
              <FiChevronLeft />
            </button>
            <div className="text-sm font-medium capitalize">{monthName}</div>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/10"
              onClick={() => setViewDate(v => addMonths(v, 1))}
              aria-label="Mes siguiente"
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] text-white/60 mb-1">
            {['L','M','X','J','V','S','D'].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={i} />
              const isToday = sameYMD(d, new Date())
              const isSelected = selected ? sameYMD(d, selected) : false
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(d)}
                  className={cx(
                    'py-2 rounded-lg text-sm',
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-white/10 text-white',
                    isToday && !isSelected && 'ring-1 ring-emerald-400/40'
                  )}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              className="text-xs text-white/70 hover:underline"
              onClick={() => { const t = new Date(); choose(t) }}
            >
              Hoy
            </button>
            <button
              type="button"
              className="text-xs text-white/70 hover:underline"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MinutePicker({
  value, onChange,
}: {
  /** mm en string '00'..'59' */
  value: string
  onChange: (v: string) => void
}) {
  const chips = useMemo(() => {
    const arr: string[] = []
    for (let m = 0; m < 60; m += 5) arr.push(String(m).padStart(2, '0'))
    return arr
  }, [])

  function bump(delta: number) {
    const m = Math.max(0, Math.min(59, (Number(value) || 0) + delta))
    onChange(String(m).padStart(2, '0'))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={59}
          value={value}
          onChange={(e) => {
            const n = Math.max(0, Math.min(59, Number(e.target.value || 0)))
            onChange(String(n).padStart(2, '0'))
          }}
          className="w-20 rounded-xl border border-white/10 bg-[#0B0E12] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <Button variant="outline" type="button" onClick={() => bump(-5)}>-5</Button>
        <Button variant="outline" type="button" onClick={() => bump(+5)}>+5</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cx(
              'px-2.5 py-1.5 rounded-lg text-xs border',
              value === c
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#0B0E12] text-white/90 border-white/10 hover:bg-white/10'
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

/* =========================================================
   FORM: Crear Cita (con DatePicker premium y MinutePicker)
========================================================= */
function CreateApptForm({
  onSave, onCancel, defaultName, defaultPhone, defaultService, staffOptions,
}: {
  onSave: (d: CreateApptPayload) => Promise<void> | void
  onCancel: () => void
  defaultName: string
  defaultPhone: string
  defaultService: string
  staffOptions: Array<{ id: number; name: string }>
}) {
  // Defaults locales
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
  const [datePart, setDatePart] = useState(`${yyyy}-${MM}-${dd}`)
  const [hourPart, setHourPart] = useState(HH)
  const [minutePart, setMinutePart] = useState(mm.padStart(2, '0'))
  const [durationMin, setDurationMin] = useState<number>(30)
  const [notes, setNotes] = useState('')

  // sincronizar si llegan locks luego
  useEffect(() => { if (defaultName) setName(defaultName) }, [defaultName])
  useEffect(() => { if (defaultPhone) setPhone(defaultPhone) }, [defaultPhone])
  useEffect(() => { if (defaultService) setService(defaultService) }, [defaultService])

  const timeHHMM = useMemo(() => {
    const H = String(Math.max(0, Math.min(23, Number(hourPart) || 0))).padStart(2, '0')
    const M = String(Math.max(0, Math.min(59, Number(minutePart) || 0))).padStart(2, '0')
    return `${H}:${M}`
  }, [hourPart, minutePart])

  const startISO = useMemo(() => `${datePart}T${timeHHMM}`, [datePart, timeHHMM])

  function bumpHour(delta: number) {
    const [H, M] = timeHHMM.split(':').map(Number)
    const base = new Date(2000, 0, 1, H, M, 0, 0)
    base.setHours(base.getHours() + delta)
    setHourPart(String(base.getHours()).padStart(2, '0'))
  }

  const canSave =
    name.trim() &&
    phone.trim() &&
    service.trim() &&
    datePart.length === 10 &&
    timeHHMM.length === 5 &&
    Number(durationMin) > 0

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!canSave) return
        await onSave({
          name, phone, service, sede, provider,
          startISO, durationMin, notes,
        })
      }}
      className="space-y-5 text-white"
    >
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FiCalendar className="h-5 w-5" /> Crear nueva cita
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre cliente" icon={<FiUser className="opacity-70" />} value={name} onChange={setName} />
        <Input label="Teléfono (chat)" icon={<FiPhone className="opacity-70" />} value={phone} onChange={setPhone} />

        <Input label="Servicio" value={service} onChange={setService} placeholder="Ej. Limpieza facial" />
        <Input label="Sede (opcional)" value={sede} onChange={setSede} placeholder="Ej. Sede Centro" />

        {/* Staff desde BD */}
        <label className="space-y-1">
          <FieldLabel text="Profesional (staff)" />
          <select
            value={provider || ''}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0B0E12] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">(Sin preferencia)</option>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-white/50">Se carga por API o desde summary STAFF</span>
        </label>

        {/* Fecha premium */}
        <label className="space-y-1">
          <FieldLabel text="Fecha" />
          <CustomDatePicker value={datePart} onChange={setDatePart} />
        </label>

        {/* Hora + minutos premium */}
        <div className="grid grid-cols-1 gap-3">
          <label className="space-y-1">
            <FieldLabel text="Hora (HH)" />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={23}
                value={hourPart}
                onChange={(e) => setHourPart(e.target.value.padStart(2, '0'))}
                className="w-24 rounded-xl border border-white/10 bg-[#0B0E12] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button variant="outline" type="button" onClick={() => bumpHour(-1)}>-1h</Button>
              <Button variant="outline" type="button" onClick={() => bumpHour(+1)}>+1h</Button>
            </div>
          </label>

          <label className="space-y-1">
            <FieldLabel text="Minutos" />
            <MinutePicker value={minutePart} onChange={setMinutePart} />
          </label>
        </div>

        <label className="space-y-1">
          <FieldLabel text="Duración (min)" />
          <input
            type="number"
            value={String(durationMin)}
            onChange={(e) => setDurationMin(Math.max(1, Number(e.target.value || 30)))}
            className="w-full rounded-xl border border-white/10 bg-[#0B0E12] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="30"
          />
        </label>

        <TextArea
          label="Notas (opcional)"
          value={notes}
          onChange={setNotes}
          placeholder="Observaciones, indicaciones…"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className={cx(!(canSave) && 'opacity-60 pointer-events-none')}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
