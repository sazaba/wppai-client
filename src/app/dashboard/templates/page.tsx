'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import axios, { AxiosInstance } from 'axios'
import { Trash2, RefreshCw, CheckCircle, Clock, XCircle, Send, ArrowUp, FileText, MessageSquare, Sparkles, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

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
  { label: 'Seguimiento / Fidelización', value: 'MARKETING' },
  { label: 'Autenticación', value: 'AUTHENTICATION' },
]

const EJEMPLOS: Record<string, string> = {
  recordatorio_cita_12:
    'Hola, te recordamos tu cita con nosotros. Responde 1 para confirmar tu asistencia o 2 si deseas cancelarla.',
  confirmacion_cita:
    'Tu cita ha sido agendada con éxito. Si necesitas hacer cambios o reprogramar, responde a este mensaje.',
  post_cita:
    'Esperamos que tu cita haya ido muy bien. Si tienes alguna duda adicional o requieres otra valoración, respóndenos por este medio.',
  saludo_bienvenida:
    'Hola, gracias por comunicarte con nosotros. Te ayudaremos a gestionar tu cita y resolver tus dudas.',
}

// ────────── UI helpers Premium
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
  <div className="border border-white/5 p-6 rounded-2xl bg-zinc-900/40 shadow-lg backdrop-blur-sm relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    <div className="h-5 w-32 bg-zinc-800 rounded mb-3" />
    <div className="h-3 w-24 bg-zinc-800 rounded mb-4" />
    <div className="h-3 w-full bg-zinc-800 rounded mb-2" />
    <div className="h-3 w-2/3 bg-zinc-800 rounded" />
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
  const [loading, setLoading] = useState(false) 
  const [plantillas, setPlantillas] = useState<MessageTemplate[]>([])
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [checkingId, setCheckingId] = useState<number | null>(null)

  // plantilla marcada como recordatorio 24h
  const [reminder24hTemplateId, setReminder24hTemplateId] = useState<number | null>(null)
  const [reminder24hRuleId, setReminder24hRuleId] = useState<number | null>(null)

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
      Swal.fire({ title: 'Error', text: msg, icon: 'error', background: '#09090b', color: '#fff' })
    } finally {
      setLoading(false)
    }
  }

  const fetchReminderRule = async () => {
    try {
      const res = await api.get('/api/appointments/reminders')
      const rules = (res.data || []) as any[]
      const r24 = rules.find((r) => r.active && r.offsetHours === 24)
      setReminder24hTemplateId(r24?.messageTemplateId ?? null)
      setReminder24hRuleId(r24?.id ?? null)
    } catch (error) {
      console.error('Error al cargar reglas de recordatorio', error)
      setReminder24hTemplateId(null)
      setReminder24hRuleId(null)
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm((s) => ({ ...s, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setForm((s) => ({ ...s, [name]: value }))
    }
  }

  const handleNombrePreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value
    setForm((s) => ({
      ...s,
      nombre: preset || s.nombre,
      cuerpo: EJEMPLOS[preset] || s.cuerpo,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.idioma || !form.categoria || !form.cuerpo) {
      return Swal.fire({ title: 'Campos requeridos', text: 'Completa todos los campos.', icon: 'warning', background: '#09090b', color: '#fff' })
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
      setForm({
        nombre: '',
        idioma: 'es',
        categoria: 'UTILITY',
        cuerpo: '',
        publicar: true,
      })
      Swal.fire({
        title: 'Éxito',
        text: `Plantilla creada${form.publicar ? ' y enviada a Meta' : ''}`,
        icon: 'success',
        background: '#09090b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      })
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
      cancelButtonText: 'Cancelar',
      background: '#09090b',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a'
    })
    if (!confirm.isConfirmed) return

    await withBusy('Eliminando…', async () => {
      await api.delete(`/api/templates/${id}?borrarMeta=true`)
      await fetchTemplates()
      Swal.fire({ title: 'Eliminada', text: 'La plantilla fue eliminada.', icon: 'success', background: '#09090b', color: '#fff', confirmButtonColor: '#4f46e5' })
      setReminder24hTemplateId((prev) => (prev === id ? null : prev))
    })
  }

  const enviarAMeta = async (id: number) => {
    const confirm = await Swal.fire({
      title: '¿Enviar esta plantilla a Meta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      background: '#09090b',
      color: '#fff',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#27272a'
    })
    if (!confirm.isConfirmed) return

    setSendingId(id)
    await withBusy('Enviando a Meta…', async () => {
      await api.post(`/api/templates/${id}/enviar`)
      await fetchTemplates()
      Swal.fire({ title: 'Enviado', text: 'La plantilla fue enviada a Meta', icon: 'success', background: '#09090b', color: '#fff', confirmButtonColor: '#4f46e5' })
    })
      .catch(() => {})
      .finally(() => setSendingId(null))
  }

  const consultarEstado = async (id: number) => {
    setCheckingId(id)
    await withBusy('Consultando estado…', async () => {
      const res = await api.get(`/api/templates/${id}/estado`)
      await fetchTemplates()
      Swal.fire({ title: 'Estado actualizado', text: `Meta devolvió: ${res.data?.estado}`, icon: 'info', background: '#09090b', color: '#fff', confirmButtonColor: '#4f46e5' })
    })
      .catch(() => {})
      .finally(() => setCheckingId(null))
  }

  const marcarComoRecordatorio24h = async (tpl: MessageTemplate) => {
    const confirm = await Swal.fire({
      title: '¿Usar como recordatorio 24h?',
      text: 'Esta plantilla se usará para recordar las citas 24 horas antes.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, usar esta',
      cancelButtonText: 'Cancelar',
      background: '#09090b',
      color: '#fff',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#27272a'
    })
    if (!confirm.isConfirmed) return

    try {
      await withBusy('Guardando regla de recordatorio…', async () => {
        await api.post('/api/appointments/reminders', {
          active: true,
          offsetHours: 24,
          messageTemplateId: tpl.id,
          templateName: tpl.nombre,
          templateLang: tpl.idioma,
          templateParams: null,
        })
      })

      await fetchReminderRule()
      Swal.fire({ title: 'Listo', text: 'Plantilla marcada como recordatorio 24h.', icon: 'success', background: '#09090b', color: '#fff', confirmButtonColor: '#10b981' })
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'No se pudo guardar la regla de recordatorio.'
      console.error('[TemplatesPage] error al marcar recordatorio 24h:', error)
      Swal.fire({ title: 'Error', text: msg, icon: 'error', background: '#09090b', color: '#fff' })
    }
  }

  const desactivarRecordatorio24h = async () => {
    if (!reminder24hRuleId) {
      return Swal.fire({ title: 'Sin regla', text: 'No hay una regla 24h activa para desactivar.', icon: 'info', background: '#09090b', color: '#fff' })
    }

    const confirm = await Swal.fire({
      title: '¿Desactivar recordatorio 24h?',
      text: 'Se eliminará la regla de recordatorio 24 horas antes de la base de datos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#09090b',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a'
    })
    if (!confirm.isConfirmed) return

    try {
      await withBusy('Eliminando regla de recordatorio…', async () => {
        await api.delete(`/api/appointments/reminders/${reminder24hRuleId}`)
      })

      await fetchReminderRule()
      Swal.fire({ title: 'Listo', text: 'Recordatorio 24h desactivado.', icon: 'success', background: '#09090b', color: '#fff', confirmButtonColor: '#4f46e5' })
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'No se pudo eliminar la regla de recordatorio.'
      console.error('[TemplatesPage] error al desactivar recordatorio 24h:', error)
      Swal.fire({ title: 'Error', text: msg, icon: 'error', background: '#09090b', color: '#fff' })
    }
  }

  const renderEstado = (estado: string) => {
    const s = (estado || '').toLowerCase()
    if (s.includes('approved')) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
          <CheckCircle size={12} /> Aprobado
        </span>
      )
    }
    if (s.includes('rejected')) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
          <XCircle size={12} /> Rechazado
        </span>
      )
    }
    if (s.includes('in_review') || s.includes('pending')) {
      return (
        <span className="flex items-center gap-1.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
          <Clock size={12} /> En revisión
        </span>
      )
    }
    return <span className="text-zinc-500 text-xs capitalize bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">{estado || '—'}</span>
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 relative overflow-hidden">
        
      {/* Luces Ambientales */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">

        {/* Overlay Loader */}
        {busy && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm rounded-3xl z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-zinc-900 p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="h-10 w-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                    <span className="text-zinc-300 font-medium text-sm tracking-wide animate-pulse">{busyText}</span>
                </div>
            </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <FileText className="text-indigo-400 w-8 h-8" />
                    Plantillas de Mensaje
                </h1>
                <p className="text-zinc-400 text-sm mt-1">Crea y gestiona las plantillas aprobadas por Meta para iniciar conversaciones.</p>
            </div>
            <button
                onClick={() => withBusy('Actualizando…', fetchTemplates)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all text-xs font-bold uppercase tracking-wide disabled:opacity-50 shadow-lg"
                disabled={busy}
            >
                {loading || busy ? <Spinner size={14} /> : <RefreshCw size={14} />}
                {loading || busy ? 'Sincronizando...' : 'Sincronizar con Meta'}
            </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
            
            {/* FORMULARIO DE CREACIÓN */}
            <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <MessageSquare className="w-32 h-32 text-white" />
                </div>
                
                <div className="relative z-10">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" /> Nueva Plantilla
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Preset */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Usar Ejemplo (Preset)</label>
                            <select
                                name="preset"
                                onChange={handleNombrePreset}
                                className="w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-colors hover:bg-zinc-900"
                                disabled={busy}
                            >
                                <option value="">— Seleccionar ejemplo —</option>
                                {Object.keys(EJEMPLOS).map(key => (
                                    <option key={key} value={key}>{key.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Nombre (snake_case)</label>
                                <input
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="ej: cita_confirmacion"
                                    className="w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    required
                                    disabled={busy}
                                />
                            </div>

                            {/* Categoría */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Categoría</label>
                                <select
                                    name="categoria"
                                    value={form.categoria}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-colors hover:bg-zinc-900"
                                    disabled={busy}
                                >
                                    {CATEGORIAS_UI.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Idioma (oculto visualmente o simplificado si solo usas ES) */}
                        <div className="space-y-1.5">
                             <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Idioma</label>
                             <select
                                name="idioma"
                                value={form.idioma}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-colors hover:bg-zinc-900"
                                disabled={busy}
                            >
                                <option value="es">Español (es)</option>
                                <option value="es_AR">Español (es_AR)</option>
                                <option value="en_US">Inglés (en_US)</option>
                            </select>
                        </div>

                        {/* Cuerpo */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Contenido del Mensaje</label>
                            <textarea
                                name="cuerpo"
                                value={form.cuerpo}
                                onChange={handleChange}
                                placeholder="Escribe el mensaje aquí..."
                                className="w-full rounded-xl border border-white/5 bg-zinc-950/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none h-32"
                                required
                                disabled={busy}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="inline-flex items-center gap-2 text-zinc-300 text-sm cursor-pointer select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="publicar"
                                        checked={form.publicar}
                                        onChange={handleChange}
                                        className="peer sr-only"
                                        disabled={busy}
                                    />
                                    <div className="w-10 h-6 bg-zinc-800 rounded-full peer-checked:bg-indigo-600 transition-all border border-zinc-600 peer-checked:border-indigo-500"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4"></div>
                                </div>
                                <span>Publicar en Meta</span>
                            </label>

                            <button
                                type="submit"
                                disabled={busy}
                                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
                            >
                                {busy ? <Spinner size={16} className="text-white" /> : <Send size={16} />}
                                {busy ? 'Procesando...' : 'Crear Plantilla'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* LISTA DE PLANTILLAS */}
            <section className="h-full flex flex-col min-h-[500px]">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 ml-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Plantillas Existentes
                </h3>
                
                <div 
                    ref={listRef}
                    onScroll={handleScroll}
                    className="flex-1 space-y-4 pr-1 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
                >
                    <div ref={topRef} />

                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : plantillas.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-zinc-500 text-sm">No has creado ninguna plantilla aún.</p>
                        </div>
                    ) : (
                        plantillas.map((p) => {
                            const esRecordatorioActivo = reminder24hTemplateId === p.id
                            
                            return (
                                <div 
                                    key={p.id} 
                                    className={clsx(
                                        "group relative bg-zinc-900/40 border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl",
                                        esRecordatorioActivo 
                                            ? "border-emerald-500/30 bg-emerald-500/5" 
                                            : "border-white/5 hover:border-indigo-500/30 hover:bg-zinc-900/60"
                                    )}
                                >
                                    {/* Cabecera de la tarjeta */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-white text-sm tracking-tight">{p.nombre}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                                <span>{p.idioma}</span>
                                                <span>•</span>
                                                <span>{p.categoria}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {renderEstado(p.estado)}
                                            {esRecordatorioActivo && (
                                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 flex items-center gap-1">
                                                    <Clock size={10} /> Recordatorio 24h
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cuerpo del mensaje (Preview) */}
                                    <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5 text-zinc-300 text-xs leading-relaxed mb-4 font-mono">
                                        {p.cuerpo}
                                    </div>

                                    {/* Footer de acciones */}
                                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                                            Vars: {p.variables}
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            
                                            <button
                                                onClick={() => consultarEstado(p.id)}
                                                disabled={busy}
                                                className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                                title="Consultar estado"
                                            >
                                                <RefreshCw size={14} className={checkingId === p.id && busy ? 'animate-spin' : ''} />
                                            </button>

                                            <button
                                                onClick={() => enviarAMeta(p.id)}
                                                disabled={busy}
                                                className="p-2 rounded-lg hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-400 transition-colors"
                                                title="Reenviar a Meta"
                                            >
                                                <Send size={14} />
                                            </button>

                                            {esRecordatorioActivo ? (
                                                <button
                                                    onClick={desactivarRecordatorio24h}
                                                    disabled={busy}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                                                    title="Quitar recordatorio"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => marcarComoRecordatorio24h(p)}
                                                    disabled={busy}
                                                    className="p-2 rounded-lg hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"
                                                    title="Usar como recordatorio"
                                                >
                                                    <Clock size={14} />
                                                </button>
                                            )}

                                            <div className="w-px h-4 bg-white/10 mx-1" />

                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                disabled={busy}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </section>

        </div>
      </div>

      {/* Botón Flotante Subir */}
      {!isAtTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-20 bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg shadow-indigo-900/40 transition-all active:scale-95"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  )
}