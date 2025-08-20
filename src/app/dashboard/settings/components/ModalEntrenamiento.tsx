'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { X, Plus, Trash2 } from 'lucide-react'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string

type BusinessType = 'servicios' | 'productos'

interface Pregunta {
  campo: keyof ConfigForm
  tipo: 'input' | 'textarea'
  pregunta: string
  placeholder?: string
  required?: boolean
}

interface ModalEntrenamientoProps {
  trainingActive: boolean
  onClose?: () => void
  initialConfig?: Partial<ConfigForm>
}

interface ImagenProducto {
  url: string
  alt?: string
}

type Producto = {
  id?: number // si existe, viene desde la DB y no se creará de nuevo
  nombre: string
  descripcion: string
  beneficios: string
  caracteristicas: string
  precioDesde?: number | null
  imagenes: ImagenProducto[]
}

interface ConfigForm {
  nombre: string
  descripcion: string
  servicios: string
  faq: string
  horarios: string
  disclaimers: string
  businessType: BusinessType
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
}: ModalEntrenamientoProps) {
  const [open, setOpen] = useState<boolean>(trainingActive)
  useEffect(() => setOpen(trainingActive), [trainingActive])

  // UI State
  const [step, setStep] = useState<number>(0)
  const [saving, setSaving] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form state (config negocio)
  const [businessType, setBusinessType] = useState<BusinessType>(
    (initialConfig?.businessType as BusinessType) || 'servicios',
  )

  const [form, setForm] = useState<ConfigForm>({
    nombre: initialConfig?.nombre || '',
    descripcion: initialConfig?.descripcion || '',
    servicios: initialConfig?.servicios || '',
    faq: initialConfig?.faq || '',
    horarios: initialConfig?.horarios || '',
    disclaimers: initialConfig?.disclaimers || '',
    businessType: ((initialConfig?.businessType as BusinessType) || 'servicios') as BusinessType,
  })

  // Productos (solo para 'productos')
  const [productos, setProductos] = useState<Producto[]>([])
  const [catalogLoaded, setCatalogLoaded] = useState<boolean>(false)
  const [nuevoProd, setNuevoProd] = useState<Producto>({
    nombre: '',
    descripcion: '',
    beneficios: '',
    caracteristicas: '',
    precioDesde: null,
    imagenes: [],
  })
  const [imgUrl, setImgUrl] = useState<string>('')
  const [imgAlt, setImgAlt] = useState<string>('')

  // Preguntas por tipo
  const preguntasServicios: Pregunta[] = [
    { campo: 'nombre', tipo: 'input', pregunta: '¿Cómo se llama tu negocio?', required: true },
    {
      campo: 'descripcion',
      tipo: 'textarea',
      pregunta: 'Describe brevemente el negocio (1–3 líneas).',
      required: true,
    },
    {
      campo: 'servicios',
      tipo: 'textarea',
      pregunta: 'Servicios que ofreces (viñetas separadas por salto de línea).',
    },
    { campo: 'faq', tipo: 'textarea', pregunta: 'FAQs (usa formato P:… / R:…).' },
    { campo: 'horarios', tipo: 'textarea', pregunta: '¿Cuál es el horario de atención?' },
    { campo: 'disclaimers', tipo: 'textarea', pregunta: 'Disclaimers (reglas duras para la IA).' },
  ]

  const preguntasProductos: Pregunta[] = [
    { campo: 'nombre', tipo: 'input', pregunta: '¿Nombre del negocio?', required: true },
    {
      campo: 'descripcion',
      tipo: 'textarea',
      pregunta: 'Describe brevemente el negocio (1–3 líneas).',
      required: true,
    },
    { campo: 'faq', tipo: 'textarea', pregunta: 'FAQs (usa formato P:… / R:…).' },
    { campo: 'horarios', tipo: 'textarea', pregunta: '¿Horario de atención?' },
    {
      campo: 'disclaimers',
      tipo: 'textarea',
      pregunta:
        'Disclaimers globales (sin diagnósticos, precios sujetos a confirmación, etc.).',
    },
  ]

  const preguntas = useMemo(
    () => (businessType === 'productos' ? preguntasProductos : preguntasServicios),
    [businessType],
  )

  const totalSteps = useMemo(() => {
    // Para productos, +1 paso de "Catálogo"
    return businessType === 'productos' ? preguntas.length + 1 : preguntas.length
  }, [businessType, preguntas.length])

  // Helpers
  function close() {
    setOpen(false)
    onClose?.()
  }

  function next() {
    if (step < totalSteps - 1) setStep((s) => s + 1)
  }
  function back() {
    if (step > 0) setStep((s) => s - 1)
  }

  function updateField(campo: keyof ConfigForm, val: string) {
    setForm((f) => ({ ...f, [campo]: val }))
  }

  function addImagenAlNuevo() {
    if (!imgUrl.trim()) return
    setNuevoProd((p) => ({
      ...p,
      imagenes: [...p.imagenes, { url: imgUrl.trim(), alt: imgAlt.trim() || undefined }],
    }))
    setImgUrl('')
    setImgAlt('')
  }

  function removeImgNuevo(idx: number) {
    setNuevoProd((p) => ({ ...p, imagenes: p.imagenes.filter((_, i) => i !== idx) }))
  }

  function pushProducto() {
    if (!nuevoProd.nombre.trim()) {
      setErrorMsg('El producto necesita al menos un nombre.')
      return
    }
    setProductos((arr) => [...arr, { ...nuevoProd }])
    setNuevoProd({
      nombre: '',
      descripcion: '',
      beneficios: '',
      caracteristicas: '',
      precioDesde: null,
      imagenes: [],
    })
    setErrorMsg(null)
  }

  function removeProducto(idx: number) {
    setProductos((arr) => arr.filter((_, i) => i !== idx))
  }

  // 🔄 Cargar catálogo existente desde /api/products
  async function loadCatalog() {
    try {
      const { data } = await axios.get(`${API_URL}/api/products`, { headers: getAuthHeaders() })
      const mapped: Producto[] = (Array.isArray(data) ? data : []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre ?? '',
        descripcion: p.descripcion ?? '',
        beneficios: p.beneficios ?? '',
        caracteristicas: p.caracteristicas ?? '',
        precioDesde: p.precioDesde ?? null,
        imagenes: (p.imagenes || []).map((img: any) => ({
          url: img.url,
          alt: img.alt || '',
        })),
      }))
      setProductos(mapped)
      setCatalogLoaded(true)
    } catch (e) {
      console.error('[loadCatalog] error:', e)
      setCatalogLoaded(false)
    }
  }

  // 🧠 Al abrir el modal: hidrata form y carga catálogo si aplica
  useEffect(() => {
    if (!open) return
    const bt = (initialConfig?.businessType as BusinessType) || 'servicios'
    setBusinessType(bt)
    setForm({
      nombre: initialConfig?.nombre || '',
      descripcion: initialConfig?.descripcion || '',
      servicios: initialConfig?.servicios || '',
      faq: initialConfig?.faq || '',
      horarios: initialConfig?.horarios || '',
      disclaimers: initialConfig?.disclaimers || '',
      businessType: bt,
    })
    if (bt === 'productos') {
      loadCatalog()
    } else {
      // si cambia a servicios, no arrastramos estado del catálogo
      setProductos([])
      setCatalogLoaded(false)
    }
    setStep(0)
    setErrorMsg(null)
  }, [open]) // importante: se dispara cada vez que se abre

  // Si cambia a "Productos" dentro del modal, carga catálogo una vez
  const handleSetProductosType = async () => {
    setBusinessType('productos')
    setForm((f) => ({ ...f, businessType: 'productos' }))
    if (!catalogLoaded) await loadCatalog()
  }
  const handleSetServiciosType = () => {
    setBusinessType('servicios')
    setForm((f) => ({ ...f, businessType: 'servicios' }))
    setProductos([])
    setCatalogLoaded(false)
  }

  async function guardarTodo() {
    try {
      setSaving(true)
      setErrorMsg(null)

      // 1) Guardar configuración (con Authorization)
      await axios.put(
        `${API_URL}/api/config`,
        { ...form, businessType },
        { headers: getAuthHeaders() },
      )

      // 2) Si es productos, persistir SOLO los productos nuevos (sin id)
      if (businessType === 'productos' && productos.length) {
        const nuevos = productos.filter((p) => !p.id)
        for (const prod of nuevos) {
          const { data: created } = await axios.post(
            `${API_URL}/api/products`,
            {
              nombre: prod.nombre,
              descripcion: prod.descripcion,
              beneficios: prod.beneficios,
              caracteristicas: prod.caracteristicas,
              precioDesde: prod.precioDesde ?? null,
            },
            { headers: getAuthHeaders() },
          )
          if (prod.imagenes?.length) {
            for (const img of prod.imagenes) {
              await axios.post(
                `${API_URL}/api/products/${created.id}/images`,
                { url: img.url, alt: img.alt || '' },
                { headers: getAuthHeaders() },
              )
            }
          }
        }
      }

      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando cambios.')
    } finally {
      setSaving(false)
    }
  }

  // UI blocks
  const isCatalogStep = businessType === 'productos' && step === preguntas.length
  const preguntaActual = preguntas[step]

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={() => {}} className="relative z-50">
          {/* Background */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

          {/* Panel */}
          <div className="fixed inset-0 flex items-center justify-center px-3 sm:px-6">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="w-full max-w-3xl bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-2xl overflow-y-auto max-h-[92vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-medium border border-slate-700">
                    Entrenamiento de IA
                  </div>
                  <span className="text-slate-400 text-sm">
                    Paso {step + 1} de {totalSteps}
                  </span>
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>

              {/* Tipo de negocio */}
              <div className="mb-4 grid grid-cols-2 gap-2">
                <button
                  onClick={handleSetServiciosType}
                  className={`rounded-xl px-3 py-2 text-sm border transition ${
                    businessType === 'servicios'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  Servicios
                </button>
                <button
                  onClick={handleSetProductosType}
                  className={`rounded-xl px-3 py-2 text-sm border transition ${
                    businessType === 'productos'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  Productos
                </button>
              </div>

              {/* Contenido del paso */}
              {!isCatalogStep ? (
                <div className="space-y-3">
                  <h2 className="text-lg sm:text-xl font-semibold">{preguntaActual.pregunta}</h2>

                  {preguntaActual.tipo === 'textarea' ? (
                    <textarea
                      rows={5}
                      value={form[preguntaActual.campo] || ''}
                      onChange={(e) => updateField(preguntaActual.campo, e.target.value)}
                      placeholder={preguntaActual.placeholder}
                      className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-500/40 text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[preguntaActual.campo] || ''}
                      onChange={(e) => updateField(preguntaActual.campo, e.target.value)}
                      placeholder={preguntaActual.placeholder}
                      className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-500/40 text-sm"
                    />
                  )}
                </div>
              ) : (
                // Paso de Catálogo (solo productos)
                <div className="space-y-5">
                  <h2 className="text-lg sm:text-xl font-semibold">Catálogo inicial (opcional)</h2>

                  {/* Form producto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Nombre *</label>
                      <input
                        value={nuevoProd.nombre}
                        onChange={(e) => setNuevoProd({ ...nuevoProd, nombre: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Precio desde (opcional)</label>
                      <input
                        type="number"
                        value={nuevoProd.precioDesde ?? ''}
                        onChange={(e) =>
                          setNuevoProd({
                            ...nuevoProd,
                            precioDesde: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Descripción</label>
                        <textarea
                          rows={3}
                          value={nuevoProd.descripcion}
                          onChange={(e) => setNuevoProd({ ...nuevoProd, descripcion: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Beneficios (uno por línea)</label>
                        <textarea
                          rows={3}
                          value={nuevoProd.beneficios}
                          onChange={(e) => setNuevoProd({ ...nuevoProd, beneficios: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm text-slate-300">Características (una por línea)</label>
                        <textarea
                          rows={3}
                          value={nuevoProd.caracteristicas}
                          onChange={(e) => setNuevoProd({ ...nuevoProd, caracteristicas: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    {/* Imágenes */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm text-slate-300">Imágenes (URL)</label>
                      <div className="flex flex-col md:flex-row gap-2">
                        <input
                          placeholder="https://res.cloudinary.com/tu-cloud/..."
                          value={imgUrl}
                          onChange={(e) => setImgUrl(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                        />
                        <input
                          placeholder="Alt (opcional)"
                          value={imgAlt}
                          onChange={(e) => setImgAlt(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                        />
                        <button
                          onClick={addImagenAlNuevo}
                          className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl px-3 py-2 text-sm"
                        >
                          <Plus className="w-4 h-4" /> Agregar
                        </button>
                      </div>

                      {!!nuevoProd.imagenes.length && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {nuevoProd.imagenes.map((img, i) => (
                            <div
                              key={i}
                              className="relative group rounded-xl overflow-hidden border border-slate-700"
                            >
                              <img src={img.url} alt={img.alt || ''} className="w-full h-28 object-cover" />
                              <button
                                onClick={() => removeImgNuevo(i)}
                                className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 hover:bg-black/80"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <button
                        onClick={pushProducto}
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm"
                      >
                        <Plus className="w-4 h-4" /> Añadir al catálogo
                      </button>
                    </div>
                  </div>

                  {!!productos.length && (
                    <div className="space-y-2">
                      <h3 className="text-sm text-slate-300">
                        Productos actuales / a guardar ({productos.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {productos.map((p, idx) => (
                          <div
                            key={`${p.id ?? 'nuevo'}-${idx}`}
                            className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-medium">
                                  {p.nombre}{' '}
                                  {p.id ? (
                                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">
                                      existente
                                    </span>
                                  ) : null}
                                </div>
                                {p.precioDesde != null && (
                                  <div className="text-xs text-slate-400">Desde: {p.precioDesde}</div>
                                )}
                              </div>
                              <button
                                onClick={() => removeProducto(idx)}
                                className="p-1.5 rounded-lg hover:bg-slate-700"
                              >
                                <Trash2 className="w-4 h-4 text-slate-200" />
                              </button>
                            </div>
                            {!!p.imagenes.length && (
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                {p.imagenes.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img.url}
                                    alt={img.alt || ''}
                                    className="w-full h-16 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
                  {errorMsg}
                </div>
              )}

              {/* Footer actions */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {businessType === 'productos'
                    ? 'Consejo: agrega al menos 1–2 productos para que la IA tenga contexto.'
                    : 'Completa la info clave para respuestas precisas.'}
                </div>

                <div className="flex items-center gap-2">
                  {step > 0 ? (
                    <button
                      onClick={back}
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm"
                    >
                      Atrás
                    </button>
                  ) : (
                    <div className="hidden sm:block w-[84px]" />
                  )}

                  {step < totalSteps - 1 ? (
                    <button
                      onClick={next}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60"
                      disabled={Boolean(
                        preguntaActual?.required && !String(form[preguntaActual.campo] || '').trim(),
                      )}
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={guardarTodo}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-60"
                    >
                      {saving ? 'Guardando…' : 'Finalizar y guardar'}
                    </button>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
