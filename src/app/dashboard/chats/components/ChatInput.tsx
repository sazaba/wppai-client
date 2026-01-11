'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { 
  FiSend, 
  FiSmile, 
  FiCalendar, 
  FiChevronUp, 
  FiChevronDown, 
  FiLoader, 
  FiPaperclip, 
  FiUserPlus,
  FiPhone 
} from 'react-icons/fi'
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../../context/AuthContext'
import clsx from 'clsx'

type MediaKind = 'image' | 'video' | 'audio' | 'document'

// --- NUEVA INTERFAZ PARA EL AUTOFILL ---
interface AutoFillData {
  nombreCliente?: string;
  servicio?: string;
  notas?: string;
}

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
  // Prop nueva para recibir los datos detectados
  autoFillData?: AutoFillData | null 
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const CI = {
  state: (id: number) => `/api/chat-input/state/${id}`,
  meta:  (id: number) => `/api/chat-input/meta/${id}`,
  staff: `/api/chat-input/staff`,
  services: `/api/chat-input/services`,
}

// Estilos de SweetAlert2 adaptados al tema Zinc-950
const DarkSwal = Swal.mixin({
  background: '#09090b', // zinc-950
  color: '#e4e4e7', // zinc-200
  iconColor: '#6366f1', // indigo-500
  buttonsStyling: false,
  didOpen: (popup) => {
      const container = Swal.getContainer()
      if (container) container.style.zIndex = '10000'
  },
  customClass: {
    popup: 'rounded-[2rem] border border-white/10 shadow-2xl bg-zinc-900/95 backdrop-blur-xl',
    title: 'text-xl font-bold text-white',
    htmlContainer: 'text-sm text-zinc-400',
    confirmButton:
      'inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20 mx-2',
    cancelButton:
      'inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium border border-white/10 text-zinc-300 hover:bg-white/5 transition-all mx-2',
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
      <p style="font-size:14px;line-height:1.6;color:#a1a1aa;">
        Si aceptas, se enviará un mensaje automático 24 horas antes de la cita
        para que el paciente confirme su asistencia.
      </p>
    `,
    showCancelButton: true,
    confirmButtonText: 'Sí, enviar',
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

type CreateApptPayload = {
  name: string
  phone: string
  service: string
  sede?: string
  providerId?: number | null
  startISO: string
  durationMin?: number
  notes?: string
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
  autoFillData // RECIBIMOS LA PROP
}: Props) {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAppt, setShowAppt] = useState(false)
  const [showSaveClient, setShowSaveClient] = useState(false)

  const [staffOpts, setStaffOpts] = useState<Array<{ id: number; name: string }>>([])
  const [serviceOpts, setServiceOpts] = useState<Array<{ id: number; name: string; defaultDuration?: number }>>([])
  
  // ESTADOS PARA DATOS BLOQUEADOS / PRE-LLENADOS
  const [lockedName, setLockedName] = useState<string>('')
  const [lockedService, setLockedService] = useState<string>('')
  const [lockedPhone, setLockedPhone] = useState<string>(chatPhone || '')
  // Nuevo estado para las notas (Preferencias)
  const [lockedNotes, setLockedNotes] = useState<string>('')
  
  const fileRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { token, usuario } = useAuth()
  const empresaId = usuario?.empresaId

  // --- EFECTO PARA AUTO-FILL EN TIEMPO REAL ---
  // Cuando llegan datos nuevos detectados por el padre, actualizamos los estados locales
  useEffect(() => {
    if (autoFillData) {
        if (autoFillData.nombreCliente) setLockedName(autoFillData.nombreCliente);
        if (autoFillData.servicio) setLockedService(autoFillData.servicio);
        if (autoFillData.notas) setLockedNotes(autoFillData.notas);
        
        // Opcional: Si también quieres que el teléfono se actualice si viene en el autofill
        // if (autoFillData.telefono) setLockedPhone(autoFillData.telefono);
    }
  }, [autoFillData]);

  // --- CARGA DE STAFF Y SERVICIOS ---
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

  // --- LOGICA DE SUMARIOS ANTIGUA (Mantenemos por si acaso falla el tiempo real) ---
  useEffect(() => {
    if (summaryText) {
      const staffFromSummary = extractStaffFromSummaryText(summaryText)
      if (staffFromSummary.length) {
        setStaffOpts((prev) => (prev.length ? prev : staffFromSummary))
      }
  
      const agBlock = extractAgendaFromSummaryBlock(summaryText)
  
      if (agBlock.nombre) setLockedName(agBlock.nombre)
      if (agBlock.servicio) setLockedService(agBlock.servicio)
      if (agBlock.telefono) setLockedPhone(agBlock.telefono)
    }
  
    if (chatPhone) {
      setLockedPhone(chatPhone)
    }
  }, [summaryText, chatPhone])
  

  useEffect(() => {
    const prime = async () => {
      if (!conversationId || !token) return
  
      try {
        const stateResp = await api<any>(CI.state(conversationId), undefined, token)
        const state = (stateResp as any)?.data ?? stateResp ?? null
  
        const { nombre, servicio } = extractAgendaFromState(state)
        if (nombre) setLockedName(nombre)
        if (servicio) setLockedService(servicio)
  
        const phoneFromState =
          stateResp?.phone ||
          state?.phone ||
          stateResp?.conversation?.phone ||
          state?.conversation?.phone
        if (phoneFromState) setLockedPhone(String(phoneFromState))
  
        const summaryFromStateText =
          stateResp?.summary?.text ||
          state?.summary?.text ||
          state?.summary?.text ||
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
        // Fallback a meta
      }
    }
  
    prime()
  }, [conversationId, token])
  

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
    if (e.key === 'Escape') { 
        if (showEmoji) setShowEmoji(false); 
        if (showAppt) setShowAppt(false);
        if (showSaveClient) setShowSaveClient(false);
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

  // ✅ la clave correcta para tu backend
  staffId: data.providerId ?? null,

  sede: data.sede || null,
  notas: data.notes || null,
  startAt: startAtISO,
  endAt: endAtISO,
  timezone: 'America/Bogota',
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

  // Función para Guardar Cliente desde el Chat
  async function handleSaveClient(data: { name: string; phone: string; procedure: string; date: string }) {
      if (!token) {
          await alertError('Error', 'No hay sesión activa')
          return
      }
      try {
          const res = await fetch(`${API_URL}/api/clients`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(data)
          })
          
          const json = await res.json()
          if(!res.ok) throw new Error(json.message || 'Error desconocido')

          await alertSuccess(
              'Paciente Guardado',
              `Se ha registrado a ${data.name} exitosamente.`
          )
          setShowSaveClient(false)
      } catch (err) {
          const msg = extractErrorMessage(err)
          await alertError('No se pudo guardar', msg)
      }
  }

  return (
    <div className="relative border-t border-white/5 bg-zinc-900/60 backdrop-blur-md p-4">
      <div className="flex items-end gap-3 max-w-5xl mx-auto">
        
        {/* Grupo de Botones Izquierda */}
        <div className="flex items-center gap-1 bg-zinc-800/50 rounded-xl p-1 border border-white/5">
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="p-2.5 rounded-lg hover:bg-white/10 disabled:opacity-50 text-zinc-400 hover:text-yellow-400 transition-colors"
              disabled={disabled}
              aria-label="Emoji"
              title="Emoji"
            >
              <FiSmile className="w-5 h-5" />
            </button>

            {showEmoji && (
              <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10">
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
              className="p-2.5 rounded-lg hover:bg-white/10 disabled:opacity-50 text-zinc-400 hover:text-indigo-400 transition-colors"
              disabled={disabled}
              aria-label="Crear cita"
              title="Crear cita"
            >
              <FiCalendar className="w-5 h-5" />
            </button>

            {/* Nuevo Botón: Guardar Cliente */}
            <button
              type="button"
              onClick={() => setShowSaveClient(true)}
              className="p-2.5 rounded-lg hover:bg-white/10 disabled:opacity-50 text-zinc-400 hover:text-pink-400 transition-colors"
              disabled={disabled}
              aria-label="Guardar Cliente"
              title="Guardar Cliente"
            >
              <FiUserPlus className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-lg hover:bg-white/10 disabled:opacity-50 text-zinc-400 hover:text-emerald-400 transition-colors"
              disabled={disabled}
              aria-label="Adjuntar archivo"
              title="Adjuntar archivo"
            >
              <FiPaperclip className="w-5 h-5" />
            </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />

        {/* Input Principal */}
        <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Escribe un mensaje..."
              className="w-full bg-zinc-950/50 text-white placeholder:text-zinc-600 px-5 py-3 rounded-2xl outline-none border border-white/5 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              disabled={disabled}
            />
        </div>

        {/* Botón Enviar */}
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20 transition-all active:scale-95 text-white"
          aria-label="Enviar"
          title="Enviar"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Agendar Cita */}
      <Dialog open={showAppt} onClose={() => setShowAppt(false)}>
        <CreateApptForm
          defaultName={lockedName}
          defaultPhone={lockedPhone}
          defaultService={lockedService}
          defaultNotes={lockedNotes} // PASAMOS LAS NOTAS
          staffOptions={staffOpts}
          serviceOptions={serviceOpts}
          onCancel={() => setShowAppt(false)}
          onSave={async (payload) => {
            await createAppointmentFromChat(payload)
            setShowAppt(false)
          }}
        />
      </Dialog>

      {/* Modal Guardar Cliente */}
      <Dialog open={showSaveClient} onClose={() => setShowSaveClient(false)}>
         <SaveClientForm 
            defaultName={lockedName}
            defaultPhone={lockedPhone}
            defaultService={lockedService}
            onCancel={() => setShowSaveClient(false)}
            onSave={handleSaveClient}
         />
      </Dialog>

      <style jsx global>{`
        .whatsapp-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.1) transparent;
        }
        .whatsapp-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .whatsapp-scroll::-webkit-scrollbar-track { background: transparent; }
        .whatsapp-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.1);
          border-radius: 9999px;
        }
        .whatsapp-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); }

        .no-native-spin::-webkit-outer-spin-button,
        .no-native-spin::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-native-spin { -moz-appearance: textfield; }
      `}</style>
    </div>
  )
}

// Botones mejorados
function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' | 'danger' }
) {
  const { className, variant = 'primary', ...rest } = props
  const base =
    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-95'
  const variants = {
    primary: 'text-white bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500 shadow-lg shadow-indigo-900/20',
    ghost: 'text-zinc-400 hover:text-white hover:bg-white/10',
    outline: 'border border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/20',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 shadow-lg shadow-red-900/20',
  } as const
  return <button className={clsx(base, variants[variant], className)} {...rest} />
}

// Dialog (Modal) Ultra Premium - MODIFICADO: Usando createPortal y z-index 100
function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!open || !mounted) return null

  // CAMBIO: z-index ajustado a 100 para permitir que Swal (z-1060+) se muestre encima
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-zinc-900/95 p-0 text-white shadow-2xl overflow-hidden"
      >
        <div className="max-h-[85vh] overflow-y-auto whatsapp-scroll p-8">
          {children}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

// Inputs de Formulario (Dark Deep)
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
    <label className="space-y-1.5 block">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">{label}</span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            'w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all',
            disabled && 'opacity-50 cursor-not-allowed bg-zinc-900'
          )}
          disabled={disabled}
          readOnly={readOnly}
        />
        {rightIcon && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">{rightIcon}</span>}
      </div>
      {helpText && <span className="text-[11px] text-zinc-500 ml-1">{helpText}</span>}
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
    <label className="space-y-1.5 w-full block">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          'w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none',
          disabled && 'opacity-50 cursor-not-allowed bg-zinc-900'
        )}
        disabled={disabled}
        readOnly={readOnly}
      />
      {helpText && <span className="text-[11px] text-zinc-500 ml-1">{helpText}</span>}
    </label>
  )
}

function CreateApptForm({
  onSave,
  onCancel,
  defaultName,
  defaultPhone,
  defaultService,
  defaultNotes, // PROP NUEVA
  staffOptions,
  serviceOptions,
}: {
  onSave: (d: CreateApptPayload) => Promise<void> | void
  onCancel: () => void
  defaultName: string
  defaultPhone: string
  defaultService: string
  defaultNotes?: string
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
const [providerId, setProviderId] = useState<string>('') // guardamos el id como string

  const [dateTime, setDateTime] = useState(`${yyyy}-${MM}-${dd}T${HH}:${mm}`)
  const [durationMin, setDurationMin] = useState<number>(30)
  const [notes, setNotes] = useState(defaultNotes || '') // Inicializar notas
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!service || !serviceOptions.length) return
    const found = serviceOptions.find(s => s.name === service)
    if (found?.defaultDuration && Number.isFinite(found.defaultDuration)) {
      setDurationMin(found.defaultDuration as number)
    }
  }, [serviceOptions, service])

  // LISTENERS DE CAMBIO DE PROPS (Para que se actualice si cambia afuera)
  useEffect(() => { if (defaultName) setName(defaultName) }, [defaultName])
  useEffect(() => { if (defaultPhone) setPhone(defaultPhone) }, [defaultPhone])
  useEffect(() => { if (defaultService) setService(defaultService) }, [defaultService])
  useEffect(() => { if (defaultNotes) setNotes(defaultNotes) }, [defaultNotes])

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
    return d ? `Sugerido: ${d} min` : ''
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
  name,
  phone,
  service,
  sede,
  providerId: providerId ? Number(providerId) : null,
  startISO: dateTime,
  durationMin,
  notes,
}

          await onSave(payload)
        } finally {
          setSaving(false)
        }
      }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400">
            <FiCalendar className="h-6 w-6" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">Agendar Cita</h2>
            <p className="text-sm text-zinc-400">Completa los detalles para crear la reserva.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
            <Input label="Nombre del cliente" value={name} onChange={setName} placeholder="Ej. Juan Pérez" />
            <Input label="Teléfono (WhatsApp)" value={phone} onChange={setPhone} placeholder="+57..." />
            
            <label className="space-y-1.5 block">
                <div className="flex justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Servicio</span>
                    {suggestedMsg && <span className="text-[10px] text-emerald-400 font-medium">{suggestedMsg}</span>}
                </div>
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
                    className="w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-colors hover:bg-zinc-900"
                >
                    <option value="">{service ? `(Mantener: ${service})` : '(Selecciona un servicio)'}</option>
                    {serviceOptions.map((s) => (
                    <option key={s.id} value={s.name}>
                        {s.name}
                    </option>
                    ))}
                </select>
            </label>
        </div>

        <div className="space-y-6">
            <label className="space-y-1.5 block">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Profesional</span>
             <select
  value={providerId}
  onChange={(e) => setProviderId(e.target.value)}
  className="w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-colors hover:bg-zinc-900"
>
  <option value="">(Sin preferencia)</option>
  {staffOptions.map((s) => (
    <option key={s.id} value={String(s.id)}>
      {s.name}
    </option>
  ))}
</select>

            </label>

            <Input label="Fecha y Hora" type="datetime-local" value={dateTime} onChange={setDateTime} />
            
            <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Duración (min)</span>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => bump(-5)} className="p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
                        <FiChevronDown />
                    </button>
                    <div className="relative flex-1">
                        <input
                        type="number"
                        inputMode="numeric"
                        value={String(durationMin)}
                        onChange={(e) => {
                            const n = Number((e.target.value || '').replace(/[^\d]/g, '')) || 1
                            setDurationMin(Math.max(1, n))
                        }}
                        className="no-native-spin w-full text-center rounded-xl border border-white/5 bg-zinc-950/50 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                        min={1}
                        />
                    </div>
                    <button type="button" onClick={() => bump(+5)} className="p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
                        <FiChevronUp />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 justify-center">
                    {suggestedChips.map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMin(m)}
                        className={clsx(
                        'rounded-full px-3 py-1 text-[10px] font-medium border transition-all',
                        durationMin === m 
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                            : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                        )}
                    >
                        {m} min
                    </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="pt-2 border-t border-white/5">
        <TextArea
            label="Notas Adicionales"
            value={notes}
            onChange={setNotes}
            placeholder="Detalles importantes sobre la cita..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={saving} className="px-6">
          Cancelar
        </Button>
        <button
          type="submit"
          disabled={!canSave}
          className={clsx(
            'inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all',
            canSave 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-900/20 transform hover:-translate-y-0.5' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          )}
        >
          {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiCalendar className="w-4 h-4" />}
          {saving ? 'Agendando...' : 'Confirmar Cita'}
        </button>
      </div>
    </form>
  )
}

function SaveClientForm({
  onSave,
  onCancel,
  defaultName,
  defaultPhone,
  defaultService,
}: {
  onSave: (data: { name: string; phone: string; procedure: string; date: string }) => Promise<void> | void
  onCancel: () => void
  defaultName: string
  defaultPhone: string
  defaultService: string
}) {
  const [name, setName] = useState(defaultName || '')
  const [phone, setPhone] = useState(defaultPhone || '')
  const [procedure, setProcedure] = useState(defaultService || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  // Listeners para auto-fill
  useEffect(() => { if(defaultName) setName(defaultName) }, [defaultName])
  useEffect(() => { if(defaultPhone) setPhone(defaultPhone) }, [defaultPhone])
  useEffect(() => { if(defaultService) setProcedure(defaultService) }, [defaultService])

  const canSave = name.trim() && phone.trim() && procedure.trim() && date && !saving

  return (
      <form
          onSubmit={async (e) => {
              e.preventDefault()
              if (!canSave) return
              setSaving(true)
              try {
                  await onSave({ name, phone, procedure, date })
              } finally {
                  setSaving(false)
              }
          }}
          className="space-y-6"
      >
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="p-3 rounded-full bg-pink-500/10 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                  <FiUserPlus className="h-6 w-6" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-white">Guardar Cliente</h2>
                  <p className="text-sm text-zinc-400">Verifica y guarda la información del paciente.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
               <Input 
                  label="Nombre Completo" 
                  value={name} 
                  onChange={setName} 
                  placeholder="Ej. María Perez" 
              />
               <Input 
                  label="Teléfono" 
                  value={phone} 
                  onChange={setPhone} 
                  placeholder="+57..." 
                  rightIcon={<FiPhone className="text-zinc-600" />}
              />
               <Input 
                  label="Procedimiento Realizado" 
                  value={procedure} 
                  onChange={setProcedure} 
                  placeholder="Ej. Limpieza Facial" 
              />
              <Input 
                  label="Fecha del Procedimiento" 
                  type="date"
                  value={date} 
                  onChange={setDate} 
              />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-4">
              <Button variant="ghost" type="button" onClick={onCancel} disabled={saving}>
                  Cancelar
              </Button>
              <button
                  type="submit"
                  disabled={!canSave}
                  className={clsx(
                      'inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all',
                      canSave 
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-900/20 transform hover:-translate-y-0.5' 
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  )}
              >
                  {saving ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiUserPlus className="w-4 h-4" />}
                  {saving ? 'Guardando...' : 'Guardar Ficha'}
              </button>
          </div>
      </form>
  )
}