'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import axios, { AxiosInstance } from 'axios'
import { Trash2, RefreshCw, CheckCircle, Clock, XCircle, Send, ArrowUp } from 'lucide-react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../context/AuthContext'

interface MessageTemplate {
  id: number
  nombre: string
  idioma: string
  categoria: string
  cuerpo: string
  estado: string
  variables: number
  createdAt: string
}

type CategoriaMeta = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'

const CATEGORIAS_UI: { label: string; value: CategoriaMeta }[] = [
  { label: 'Operativa / Servicio', value: 'UTILITY' },
  { label: 'Marketing', value: 'MARKETING' },
  { label: 'Autenticación', value: 'AUTHENTICATION' },
]

const EJEMPLOS: Record<string, string> = {
  saludo_basico: 'Hola {{1}}, gracias por escribirnos.',
  recordatorio_cita: 'Hola {{1}}, te recordamos tu cita el {{2}}.',
  confirmacion_pedido: 'Hola {{1}}, tu pedido {{2}} ha sido confirmado.',
  notificacion_estado: 'Hola {{1}}, el estado de tu solicitud es: {{2}}.',
}

// ────────── UI helpers
const Spinner = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
)

const SkeletonCard = () => (
  <div className="border border-slate-700 p-4 rounded bg-slate-800 shadow-sm">
    <div className="h-4 w-32 bg-slate-700/60 rounded mb-2 animate-pulse" />
    <div className="h-3 w-24 bg-slate-700/60 rounded mb-3 animate-pulse" />
    <div className="h-3 w-full bg-slate-700/60 rounded mb-2 animate-pulse" />
    <div className="h-3 w-2/3 bg-slate-700/60 rounded animate-pulse" />
  </div>
)

export default function TemplatesPage() {
  const { token } = useAuth()

  const api: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '',
      timeout: 15000,
    })
    instance.interceptors.request.use((cfg) => {
      if (token) cfg.headers.Authorization = `Bearer ${token}`
      return cfg
    })
    return instance
  }, [token])

  // estados
  const [loading, setLoading] = useState(false) // para listado / skeleton
  const [plantillas, setPlantillas] = useState<MessageTemplate[]>([])
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [checkingId, setCheckingId] = useState<number | null>(null)

  // ✅ NUEVO: plantilla marcada como recordatorio 24h
  const [reminder24hTemplateId, setReminder24hTemplateId] = useState<number | null>(null)

  // loader global unificado
  const [busy, setBusy] = useState(false)
  const [busyText, setBusyText] = useState<string>('Procesando…')

  // refs scroll
  const listRef = useRef<HTMLDivElement | null>(null)
  const topRef = useRef<HTMLDivElement | null>(null)
  const [isAtTop, setIsAtTop] = useState(true)

  // form
  const [form, setForm] = useState({
    nombre: '',
    idioma: 'es',
    categoria: 'UTILITY' as CategoriaMeta,
    cuerpo: '',
    publicar: true,
  })

  // helper genérico para mostrar loader global en cualquier acción
  const withBusy = async (label: string, fn: () => Promise<void>) => {
    setBusyText(label)
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
      setBusyText('Procesando…')
    }
  }

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/templates')
      setPlantillas(res.data)
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'No se pudo cargar'
      console.error('Error al cargar plantillas', error)
      Swal.fire('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ NUEVO: obtener la regla de recordatorio 24h actual
  const fetchReminderRule = async () => {
    try {
      const res = await api.get('/api/appointments/reminders')
      const rules = (res.data || []) as any[]
      const r24 = rules.find((r) => r.active && r.offsetHours === 24)
      setReminder24hTemplateId(r24?.messageTemplateId ?? null)
    } catch (error) {
      console.error('Error al cargar reglas de recordatorio', error)
      // no rompemos nada si falla, solo dejamos null
    }
  }

  useEffect(() => {
    if (token) {
      fetchTemplates()
      fetchReminderRule()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setIsAtTop(el.scrollTop < 60)
  }

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm((s) => ({ ...s, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setForm((s) => ({ ...s, [name]: value }))
    }
  }

  const handleNombrePreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nombre = e.target.value
    setForm((s) => ({ ...s, nombre, cuerpo: EJEMPLOS[nombre] || '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.idioma || !form.categoria || !form.cuerpo) {
      return Swal.fire('Campos requeridos', 'Completa todos los campos.', 'warning')
    }
    await withBusy(form.publicar ? 'Creando y publicando…' : 'Creando plantilla…', async () => {
      const params = form.publicar ? '?publicar=true' : ''
      await api.post(`/api/templates${params}`, {
        nombre: form.nombre,
        idioma: form.idioma,
        categoria: form.categoria,
        cuerpo: form.cuerpo,
      })
      await fetchTemplates()
      setForm({ nombre: '', idioma: 'es', categoria: 'UTILITY', cuerpo: '', publicar: true })
      Swal.fire('Éxito', `Plantilla creada${form.publicar ? ' y enviada a Meta' : ''}`, 'success')
      setTimeout(scrollToTop, 100)
    })
  }

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar plantilla?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    })
    if (!confirm.isConfirmed) return

    await withBusy('Eliminando…', async () => {
      await api.delete(`/api/templates/${id}?borrarMeta=true`)
      await fetchTemplates()
      Swal.fire('Eliminada', 'La plantilla fue eliminada.', 'success')
      // Si la que se elimina era la de recordatorio 24h, limpiamos el estado
      setReminder24hTemplateId((prev) => (prev === id ? null : prev))
    })
  }

  const enviarAMeta = async (id: number) => {
    const confirm = await Swal.fire({
      title: '¿Enviar esta plantilla a Meta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
    })
    if (!confirm.isConfirmed) return

    setSendingId(id)
    await withBusy('Enviando a Meta…', async () => {
      await api.post(`/api/templates/${id}/enviar`)
      await fetchTemplates()
      Swal.fire('Enviado', 'La plantilla fue enviada a Meta', 'success')
    })
      .catch(() => {})
      .finally(() => setSendingId(null))
  }

  const consultarEstado = async (id: number) => {
    setCheckingId(id)
    await withBusy('Consultando estado…', async () => {
      const res = await api.get(`/api/templates/${id}/estado`)
      await fetchTemplates()
      Swal.fire('Estado actualizado', `Meta devolvió: ${res.data?.estado}`, 'info')
    })
      .catch(() => {})
      .finally(() => setCheckingId(null))
  }

  // ✅ NUEVO: marcar una plantilla como "recordatorio 24h"
  const marcarComoRecordatorio24h = async (tpl: MessageTemplate) => {
    const confirm = await Swal.fire({
      title: '¿Usar como recordatorio 24h?',
      text: 'Esta plantilla se usará para recordar las citas 24 horas antes.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, usar esta',
      cancelButtonText: 'Cancelar',
    })
    if (!confirm.isConfirmed) return

    await withBusy('Guardando regla de recordatorio…', async () => {
      await api.post('/api/appointments/reminders', {
        active: true,
        offsetHours: 24,
        messageTemplateId: tpl.id,
        templateName: tpl.nombre,
        templateLang: tpl.idioma,
        templateParams: null,
      })
      await fetchReminderRule()
      Swal.fire('Listo', 'Plantilla marcada como recordatorio 24h.', 'success')
    })
  }

  const renderEstado = (estado: string) => {
    const s = (estado || '').toLowerCase()
    if (s.includes('approved')) {
      return (
        <span className="flex items-center gap-1 text-green-400 text-sm">
          <CheckCircle size={16} /> Aprobado
        </span>
      )
    }
    if (s.includes('rejected')) {
      return (
        <span className="flex items-center gap-1 text-red-400 text-sm">
          <XCircle size={16} /> Rechazado
        </span>
      )
    }
    if (s.includes('in_review') || s.includes('pending')) {
      return (
        <span className="flex items-center gap-1 text-yellow-400 text-sm">
          <Clock size={16} /> En revisión
        </span>
      )
    }
    return <span className="text-slate-400 text-sm capitalize">{estado || '—'}</span>
  }

  return (
    <div className="max-w-3xl mx-auto p-6 relative">
      {/* Overlay global para cualquier acción */}
      {busy && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] rounded-lg z-20 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-100 text-sm">
            <Spinner size={20} className="text-blue-400" />
            {busyText}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-6 text-white">Plantillas de Mensaje</h1>
        <button
          onClick={() => withBusy('Actualizando…', fetchTemplates)}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition disabled:opacity-60"
          disabled={busy}
          title="Refrescar"
        >
          {loading || busy ? <Spinner size={16} /> : <RefreshCw size={16} />}
          {loading || busy ? 'Actualizando…' : 'Refrescar'}
        </button>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-md"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Tipo (preset opcional)</label>
            <select
              name="preset"
              onChange={handleNombrePreset}
              className="w-full bg-slate-900 text-white border border-slate-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={busy}
            >
              <option value="">— Sin preset —</option>
              <option value="saludo_basico">Saludo básico</option>
              <option value="recordatorio_cita">Recordatorio de cita</option>
              <option value="confirmacion_pedido">Confirmación de pedido</option>
              <option value="notificacion_estado">Notificación de estado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre (snake_case)</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="saludo_basico"
              className="w-full bg-slate-900 text-white border border-slate-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
              required
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Idioma</label>
            <select
              name="idioma"
              value={form.idioma}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white border border-slate-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={busy}
            >
              <option value="es">Español (es)</option>
              <option value="es_AR">Español (es_AR)</option>
              <option value="en_US">Inglés (en_US)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full bg-slate-900 text-white border border-slate-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={busy}
            >
              {CATEGORIAS_UI.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">
              {'Cuerpo (usa {{1}}, {{2}}, ... )'}
            </label>

            <textarea
              name="cuerpo"
              value={form.cuerpo}
              onChange={handleChange}
              placeholder="Hola {{1}}, tu pedido {{2}} está listo"
              className="w-full bg-slate-900 text-white border border-slate-600 placeholder-slate-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
              rows={3}
              required
              disabled={busy}
            />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-slate-300 text-sm">
          <input
            type="checkbox"
            name="publicar"
            checked={form.publicar}
            onChange={handleChange}
            className="accent-blue-600"
            disabled={busy}
          />
          Publicar en Meta al crear
        </label>

        <div>
          <button
            type="submit"
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white px-4 py-2 rounded font-medium transition-all inline-flex items-center gap-2"
          >
            {busy ? (
              <>
                <Spinner size={16} className="text-white" />
                Procesando…
              </>
            ) : (
              <>
                Crear plantilla{' '}
                {form.publicar && (
                  <span className="inline-flex items-center gap-1 ml-1">
                    <Send size={14} /> y publicar
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </form>

      <hr className="my-8 border-slate-700" />

      {/* LISTA con scroll sutil */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="
          relative max-h-[65vh] overflow-y-auto
          space-y-4 pr-1
          scrollbar scrollbar-thumb-transparent scrollbar-track-transparent
          hover:scrollbar-thumb-[#2A3942] scrollbar-thumb-rounded-full
          transition-all duration-300
        "
      >
        <div ref={topRef} />

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {plantillas.map((p) => (
              <div
                key={p.id}
                className="border border-slate-700 p-4 rounded flex justify-between items-start bg-slate-800 shadow-sm text-white"
              >
                <div className="pr-4">
                  <p className="font-semibold">{p.nombre}</p>
                  <p className="text-sm text-slate-400">
                    {p.idioma} • {p.categoria}
                  </p>
                  {p.cuerpo && <p className="text-sm mt-1">{p.cuerpo}</p>}
                  <div className="text-xs mt-2 text-slate-500 flex items-center gap-2">
                    <span>Vars: {p.variables}</span>
                    <span>•</span>
                    {renderEstado(p.estado)}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 min-w-[220px]">
                  <button
                    onClick={() => enviarAMeta(p.id)}
                    disabled={busy}
                    className="text-blue-400 hover:text-blue-500 text-sm underline disabled:opacity-50"
                    title="Subir a Meta"
                  >
                    {sendingId === p.id && busy ? 'Enviando…' : 'Enviar a Meta'}
                  </button>

                  <button
                    onClick={() => consultarEstado(p.id)}
                    disabled={busy}
                    className="text-slate-300 hover:text-white text-sm underline disabled:opacity-50 flex items-center gap-1"
                    title="Consultar estado en Meta"
                  >
                    <RefreshCw size={14} />{' '}
                    {checkingId === p.id && busy ? 'Consultando…' : 'Consultar estado'}
                  </button>

                  {/* ✅ NUEVO: marcar como recordatorio 24h */}
                  <button
                    onClick={() => marcarComoRecordatorio24h(p)}
                    disabled={busy}
                    className={`text-sm flex items-center gap-1 ${
                      reminder24hTemplateId === p.id
                        ? 'text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:text-emerald-400'
                    }`}
                    title="Usar esta plantilla como recordatorio 24h"
                  >
                    {reminder24hTemplateId === p.id ? (
                      <>
                        <CheckCircle size={16} /> Recordatorio 24h activo
                      </>
                    ) : (
                      <>
                        <Clock size={16} /> Usar como recordatorio 24h
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={busy}
                    className="text-red-400 hover:text-red-500 text-sm flex items-center gap-1 disabled:opacity-50"
                    title="Eliminar (DB + Meta)"
                  >
                    <Trash2 size={18} /> Eliminar
                  </button>
                </div>
              </div>
            ))}

            {!loading && plantillas.length === 0 && (
              <div className="text-slate-400 text-sm">Aún no hay plantillas.</div>
            )}
          </>
        )}
      </div>

      {/* botón flotante volver arriba */}
      {!isAtTop && (
        <button
          onClick={scrollToTop}
          aria-label="Subir al inicio"
          className="fixed bottom-6 right-6 z-10 bg-[#00A884] hover:bg-[#01976D] text-white w-9 h-9 flex items-center justify-center rounded-full shadow transition-all"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
