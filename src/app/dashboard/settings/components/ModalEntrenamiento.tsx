'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import {
  X,
  Plus,
  Trash2,
  PencilLine,
  Check,
  XCircle,
  RefreshCw,
  ImagePlus,
  ImageMinus,
  HelpCircle,
  Loader2,
} from 'lucide-react'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string

type BusinessType = 'servicios' | 'productos'

interface ConfigForm {
  nombre: string
  descripcion: string
  servicios: string
  faq: string
  horarios: string
  disclaimers: string
  businessType: BusinessType
}

interface Pregunta {
  campo: keyof ConfigForm
  tipo: 'input' | 'textarea'
  pregunta: string
  placeholder?: string
  required?: boolean
  hint?: string
}

interface ModalEntrenamientoProps {
  trainingActive: boolean
  onClose?: () => void
  initialConfig?: Partial<ConfigForm>
}

interface ImagenProducto {
  id?: number
  url: string
  alt?: string
}

type Producto = {
  id?: number
  nombre: string
  descripcion: string
  beneficios: string
  caracteristicas: string
  precioDesde?: number | null
  imagenes: ImagenProducto[]
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function Hint({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center group align-middle">
      <HelpCircle aria-hidden className="w-3.5 h-3.5 text-slate-400" />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max max-w-[260px] rounded-md border border-slate-700 bg-slate-900 text-slate-200 text-[11px] px-2 py-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {text}
      </span>
    </span>
  )
}

// Imagen con fallback inline (evita loops)
function ImgWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [broken, setBroken] = useState(false)
  return (
    <img
      {...props}
      onError={() => setBroken(true)}
      src={
        !broken
          ? (props.src as string)
          : 'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-size="12">imagen no disponible</text></svg>`,
            )
      }
    />
  )
}

export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
}: ModalEntrenamientoProps) {
  const [open, setOpen] = useState<boolean>(trainingActive)
  useEffect(() => setOpen(trainingActive), [trainingActive])

  // UI
  const [step, setStep] = useState<number>(0)
  const [saving, setSaving] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reloading, setReloading] = useState<boolean>(false)

  // Form negocio
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

  // Catálogo
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

  // EDIT inline
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<Producto | null>(null)
  const [editNewImgUrl, setEditNewImgUrl] = useState<string>('') // para agregar durante edición
  const [editNewImgAlt, setEditNewImgAlt] = useState<string>('')
  const [savingEdit, setSavingEdit] = useState<boolean>(false)
  const isEditing = (idx: number) => editingIndex === idx

  // Preguntas (con placeholders + hints)
  const preguntasServicios: Pregunta[] = [
    {
      campo: 'nombre',
      tipo: 'input',
      pregunta: '¿Cómo se llama tu negocio?',
      placeholder: 'Ej: Clínica Dental Sonrisa Sana',
      required: true,
      hint: 'Nombre comercial como lo verán tus clientes.',
    },
    {
      campo: 'descripcion',
      tipo: 'textarea',
      pregunta: 'Describe brevemente el negocio (1–3 líneas).',
      placeholder:
        'Ej: Centro odontológico especializado en estética y salud dental para toda la familia.',
      required: true,
      hint: 'Resumen claro y directo. Enfócate en qué haces y para quién.',
    },
    {
      campo: 'servicios',
      tipo: 'textarea',
      pregunta: 'Lista los servicios que ofreces (uno por línea).',
      placeholder: 'Ej:\n- Limpieza dental\n- Ortodoncia\n- Blanqueamiento dental',
      hint: 'Cada línea será una viñeta para la IA.',
    },
    {
      campo: 'faq',
      tipo: 'textarea',
      pregunta: 'FAQs (usa formato P:… / R:…).',
      placeholder:
        'Ej:\nP: ¿Atienden fines de semana?\nR: Sí, de 8am a 2pm.\nP: ¿Métodos de pago?\nR: Efectivo, tarjeta y transferencia.',
      hint: 'Incluye preguntas comunes para reducir atención humana.',
    },
    {
      campo: 'horarios',
      tipo: 'textarea',
      pregunta: '¿Cuál es el horario de atención?',
      placeholder: 'Ej: Lun–Vie 8:00–18:00 / Sáb 8:00–14:00 / Dom cerrado',
      hint: 'Si cambia en festivos, indícalo.',
    },
    {
      campo: 'disclaimers',
      tipo: 'textarea',
      pregunta: 'Disclaimers o reglas para la IA.',
      placeholder:
        'Ej: No dar diagnósticos médicos. Precios sujetos a confirmación. No reservar sin abono.',
      hint: 'Reglas duras que la IA nunca debe romper.',
    },
  ]

  const preguntasProductos: Pregunta[] = [
    {
      campo: 'nombre',
      tipo: 'input',
      pregunta: '¿Nombre del negocio?',
      placeholder: 'Ej: Tienda Online de Belleza Leavid',
      required: true,
      hint: 'Nombre comercial visible.',
    },
    {
      campo: 'descripcion',
      tipo: 'textarea',
      pregunta: 'Describe brevemente el negocio (1–3 líneas).',
      placeholder: 'Ej: Tienda de skincare natural con envíos a todo el país.',
      required: true,
      hint: 'Elevator pitch: qué vendes y tu diferencial.',
    },
    {
      campo: 'faq',
      tipo: 'textarea',
      pregunta: 'FAQs (usa formato P:… / R:…).',
      placeholder:
        'Ej:\nP: ¿Hacen envíos nacionales?\nR: Sí, a todo el país.\nP: ¿Cambios?\nR: Dentro de 30 días.',
      hint: 'Políticas de envíos, cambios, garantía.',
    },
    {
      campo: 'horarios',
      tipo: 'textarea',
      pregunta: '¿Horario de atención?',
      placeholder: 'Ej: Lun–Vie 9:00–17:00 (hora local)',
      hint: 'Si es 24/7, aclara tiempos de despacho.',
    },
    {
      campo: 'disclaimers',
      tipo: 'textarea',
      pregunta: 'Disclaimers globales (reglas generales).',
      placeholder: 'Ej: Precios pueden variar sin aviso. No dar consejos médicos.',
      hint: 'Límites y políticas que la IA debe respetar.',
    },
  ]

  const preguntas = useMemo(
    () => (businessType === 'productos' ? preguntasProductos : preguntasServicios),
    [businessType],
  )
  const totalSteps = useMemo(
    () => (businessType === 'productos' ? preguntas.length + 1 : preguntas.length),
    [businessType, preguntas.length],
  )

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

  // DELETE persistente + optimista
  async function deleteProducto(idx: number) {
    const prod = productos[idx]
    if (!prod) return
    setProductos((arr) => arr.filter((_, i) => i !== idx)) // optimista
    if (!prod.id) return // era nuevo

    try {
      await axios.delete(`${API_URL}/api/products/${prod.id}`, { headers: getAuthHeaders() })
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'No se pudo eliminar el producto.')
      await loadCatalog()
    }
  }

  // EDIT inline handlers
  function startEdit(idx: number) {
    setEditingIndex(idx)
    setEditDraft(JSON.parse(JSON.stringify(productos[idx])))
    setEditNewImgUrl('')
    setEditNewImgAlt('')
  }
  function cancelEdit() {
    setEditingIndex(null)
    setEditDraft(null)
    setEditNewImgUrl('')
    setEditNewImgAlt('')
  }
  function updateDraft<K extends keyof Producto>(campo: K, val: Producto[K]) {
    if (!editDraft) return
    setEditDraft({ ...editDraft, [campo]: val })
  }

  function addDraftImage() {
    if (!editDraft) return
    const url = editNewImgUrl.trim()
    if (!url) return
    const alt = editNewImgAlt.trim() || undefined
    setEditDraft({
      ...editDraft,
      imagenes: [...(editDraft.imagenes || []), { url, alt }],
    })
    setEditNewImgUrl('')
    setEditNewImgAlt('')
  }

  async function removeDraftImageAt(i: number) {
    if (!editDraft) return
    const img = editDraft.imagenes[i]
    setEditDraft({ ...editDraft, imagenes: editDraft.imagenes.filter((_, idx) => idx !== i) })
    if (editDraft.id && img?.id) {
      try {
        await axios.delete(`${API_URL}/api/products/${editDraft.id}/images/${img.id}`, {
          headers: getAuthHeaders(),
        })
      } catch {
        // silencio: la UI ya quitó la imagen, al refrescar catálogo quedará consistente
      }
    }
  }

  async function saveEdit() {
    if (editingIndex === null || !editDraft) return
    setSavingEdit(true)
    try {
      // 1) Actualiza campos del producto
      if (editDraft.id) {
        await axios.put(
          `${API_URL}/api/products/${editDraft.id}`,
          {
            nombre: editDraft.nombre,
            descripcion: editDraft.descripcion,
            beneficios: editDraft.beneficios,
            caracteristicas: editDraft.caracteristicas,
            precioDesde: editDraft.precioDesde ?? null,
          },
          { headers: getAuthHeaders() },
        )
      }

      // 2) Crea imágenes nuevas (sin id)
      if (editDraft.id) {
        const nuevas = (editDraft.imagenes || []).filter((im) => !im.id)
        for (const img of nuevas) {
          await axios.post(
            `${API_URL}/api/products/${editDraft.id}/images`,
            { url: img.url, alt: img.alt || '' },
            { headers: getAuthHeaders() },
          )
        }
      }

      // 3) Refresca catálogo para sincronizar IDs y estado
      await loadCatalog()
      setEditingIndex(null)
      setEditDraft(null)
      setEditNewImgUrl('')
      setEditNewImgAlt('')
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'No se pudo guardar la edición.')
    } finally {
      setSavingEdit(false)
    }
  }

  // Carga catálogo
  async function loadCatalog() {
    try {
      setReloading(true)
      const { data } = await axios.get(`${API_URL}/api/products`, { headers: getAuthHeaders() })
      const mapped: Producto[] = (Array.isArray(data) ? data : []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre ?? '',
        descripcion: p.descripcion ?? '',
        beneficios: p.beneficios ?? '',
        caracteristicas: p.caracteristicas ?? '',
        precioDesde: p.precioDesde ?? null,
        imagenes: (p.imagenes || []).map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || '',
        })),
      }))
      setProductos(mapped)
      setCatalogLoaded(true)
    } catch (e) {
      console.error('[loadCatalog] error:', e)
      setCatalogLoaded(false)
    } finally {
      setReloading(false)
    }
  }

  // Abrir modal → hidrata form y carga catálogo si procede
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
      setProductos([])
      setCatalogLoaded(false)
    }
    setStep(0)
    setErrorMsg(null)
  }, [open])

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

      // 1) Config
      await axios.put(
        `${API_URL}/api/config`,
        { ...form, businessType },
        { headers: getAuthHeaders() },
      )

      // 2) Productos nuevos (sin id)
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

      if (businessType === 'productos') {
        await loadCatalog()
      }

      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando cambios.')
    } finally {
      setSaving(false)
    }
  }

  // UI
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
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold">{preguntaActual.pregunta}</h2>
                    {preguntaActual.hint && <Hint text={preguntaActual.hint} />}
                  </div>

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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-semibold">Catálogo (crear / editar)</h2>
                      <Hint text="Agrega 1–5 productos clave para que la IA tenga contexto." />
                    </div>
                    <button
                      onClick={loadCatalog}
                      disabled={reloading}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-60"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> {reloading ? 'Actualizando…' : 'Actualizar'}
                    </button>
                  </div>

                  {/* Form producto nuevo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                    <div className="space-y-1">
                      <label className="text-sm text-slate-300 flex items-center gap-1">
                        Nombre * <Hint text="Nombre del producto tal como lo vendes." />
                      </label>
                      <input
                        value={nuevoProd.nombre}
                        onChange={(e) => setNuevoProd({ ...nuevoProd, nombre: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                        placeholder="Ej: Serum hidratante 30ml"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-slate-300 flex items-center gap-1">
                        Precio desde (opcional) <Hint text="Precio referencial. La IA dirá 'desde'." />
                      </label>
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
                        placeholder="Ej: 49900"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm text-slate-300 flex items-center gap-1">
                          Descripción <Hint text="1–2 líneas sobre qué es y para qué sirve." />
                        </label>
                        <textarea
                          rows={3}
                          value={nuevoProd.descripcion}
                          onChange={(e) => setNuevoProd({ ...nuevoProd, descripcion: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                          placeholder="Ej: Serum ligero de rápida absorción con hidratación profunda."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-slate-300 flex items-center gap-1">
                          Beneficios (uno por línea){' '}
                          <Hint text="Cada beneficio en su propia línea para mostrarse como viñeta." />
                        </label>
                        <textarea
                          rows={3}
                          value={nuevoProd.beneficios}
                          onChange={(e) => setNuevoProd({ ...nuevoProd, beneficios: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                          placeholder={'Ej:\n- Hidratación intensa\n- Suaviza líneas finas\n- Mejora la textura'}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-sm text-slate-300 flex items-center gap-1">
                          Características (una por línea){' '}
                          <Hint text="Atributos técnicos: tamaño, material, ingredientes, etc." />
                        </label>
                        <textarea
                          rows={3}
                          value={nuevoProd.caracteristicas}
                          onChange={(e) =>
                            setNuevoProd({ ...nuevoProd, caracteristicas: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                          placeholder={'Ej:\n- 30ml\n- Apto piel sensible\n- Sin fragancias'}
                        />
                      </div>
                    </div>

                    {/* Imágenes nuevo */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm text-slate-300 flex items-center gap-1">
                        Imágenes (URL){' '}
                        <Hint text="Pega URLs directas (Cloudinary, S3, CDN). Alt es opcional." />
                      </label>
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
                            <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-700">
                              <ImgWithFallback
                                src={img.url}
                                alt={img.alt || ''}
                                className="w-full h-28 object-cover"
                                loading="lazy"
                              />
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

                  {/* Listado / Edición */}
                  {!!productos.length && (
                    <div className="space-y-2">
                      <h3 className="text-sm text-slate-300">
                        Productos actuales / a guardar ({productos.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {productos.map((p, idx) => (
                          <div
                            key={`${p.id ?? 'nuevo'}-${idx}`}
                            className={`rounded-2xl border border-slate-700 bg-slate-800/60 p-3 ${
                              isEditing(idx) ? 'ring-1 ring-blue-500/40' : ''
                            }`}
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
                              <div className="flex items-center gap-1">
                                {isEditing(idx) ? (
                                  <>
                                    <button
                                      onClick={saveEdit}
                                      disabled={savingEdit}
                                      className="p-1.5 rounded-lg hover:bg-emerald-700/30 disabled:opacity-60"
                                      title="Guardar cambios"
                                    >
                                      {savingEdit ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                                      ) : (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                      )}
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      disabled={savingEdit}
                                      className="p-1.5 rounded-lg hover:bg-red-700/30 disabled:opacity-60"
                                      title="Cancelar edición"
                                    >
                                      <XCircle className="w-4 h-4 text-red-300" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEdit(idx)}
                                      className="p-1.5 rounded-lg hover:bg-slate-700"
                                      title="Editar"
                                    >
                                      <PencilLine className="w-4 h-4 text-slate-200" />
                                    </button>
                                    <button
                                      onClick={() => deleteProducto(idx)}
                                      className="p-1.5 rounded-lg hover:bg-slate-700"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="w-4 h-4 text-slate-200" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Vista normal / Edición */}
                            {!isEditing(idx) ? (
                              <>
                                {p.descripcion && (
                                  <div className="mt-2 text-xs text-slate-300 whitespace-pre-line">
                                    {p.descripcion}
                                  </div>
                                )}
                                {p.beneficios && (
                                  <div className="mt-2">
                                    <div className="text-xs text-slate-400 mb-1">Beneficios:</div>
                                    <ul className="list-disc pl-5 text-xs text-slate-300">
                                      {p.beneficios
                                        .split('\n')
                                        .map((b) => b.trim())
                                        .filter(Boolean)
                                        .map((b, i) => (
                                          <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                  </div>
                                )}
                                {p.caracteristicas && (
                                  <div className="mt-2">
                                    <div className="text-xs text-slate-400 mb-1">Características:</div>
                                    <ul className="list-disc pl-5 text-xs text-slate-300">
                                      {p.caracteristicas
                                        .split('\n')
                                        .map((c) => c.trim())
                                        .filter(Boolean)
                                        .map((c, i) => (
                                          <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                  </div>
                                )}

                                {p.imagenes?.length ? (
                                  <div className="mt-2 grid grid-cols-3 gap-2">
                                    {p.imagenes.map((img, i) => (
                                      <ImgWithFallback
                                        key={i}
                                        src={img.url}
                                        alt={img.alt || ''}
                                        className="w-full h-16 object-cover rounded-lg"
                                        loading="lazy"
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="mt-2 h-16 rounded-lg border border-slate-700 flex items-center justify-center text-[11px] text-slate-400">
                                    Sin imágenes
                                  </div>
                                )}
                              </>
                            ) : (
                              // — EDITOR INLINE —
                              <div className="mt-3 space-y-2">
                                <input
                                  value={editDraft?.nombre || ''}
                                  onChange={(e) => updateDraft('nombre', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
                                  placeholder="Nombre"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    value={editDraft?.precioDesde ?? ''}
                                    onChange={(e) =>
                                      updateDraft('precioDesde', e.target.value ? Number(e.target.value) : null)
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
                                    placeholder="Precio desde"
                                  />
                                  <input
                                    value={editDraft?.descripcion || ''}
                                    onChange={(e) => updateDraft('descripcion', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
                                    placeholder="Descripción corta"
                                  />
                                </div>
                                <textarea
                                  rows={3}
                                  value={editDraft?.beneficios || ''}
                                  onChange={(e) => updateDraft('beneficios', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
                                  placeholder={'Beneficios (uno por línea)'}
                                />
                                <textarea
                                  rows={3}
                                  value={editDraft?.caracteristicas || ''}
                                  onChange={(e) => updateDraft('caracteristicas', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
                                  placeholder={'Características (una por línea)'}
                                />

                                {/* CRUD imágenes del draft */}
                                <div className="space-y-2">
                                  <div className="text-xs text-slate-400">Imágenes</div>
                                  {editDraft?.imagenes?.length ? (
                                    <div className="grid grid-cols-3 gap-2">
                                      {editDraft.imagenes.map((img, i) => (
                                        <div key={`${img.id ?? 'new'}-${i}`} className="relative">
                                          <ImgWithFallback
                                            src={img.url}
                                            alt={img.alt || ''}
                                            className="w-full h-16 object-cover rounded-lg border border-slate-700"
                                          />
                                          <button
                                            onClick={() => removeDraftImageAt(i)}
                                            className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900 border border-slate-700"
                                            title="Quitar imagen"
                                          >
                                            <ImageMinus className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-14 rounded-lg border border-dashed border-slate-700 text-[11px] text-slate-400 flex items-center justify-center">
                                      Sin imágenes
                                    </div>
                                  )}

                                  {/* Agregar nueva imagen a un producto en edición */}
                                  <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                                    <input
                                      value={editNewImgUrl}
                                      onChange={(e) => setEditNewImgUrl(e.target.value)}
                                      placeholder="https://res.cloudinary.com/..."
                                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
                                    />
                                    <input
                                      value={editNewImgAlt}
                                      onChange={(e) => setEditNewImgAlt(e.target.value)}
                                      placeholder="Alt (opcional)"
                                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs"
                                    />
                                    <button
                                      onClick={addDraftImage}
                                      className="px-2 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs inline-flex items-center gap-1"
                                    >
                                      <ImagePlus className="w-3.5 h-3.5" /> Agregar
                                    </button>
                                  </div>

                                  {/* Preview inmediato del input nuevo (si hay URL) */}
                                  {editNewImgUrl.trim() && (
                                    <div className="pt-1">
                                      <div className="text-[11px] text-slate-400 mb-1">
                                        Vista previa de la nueva imagen
                                      </div>
                                      <ImgWithFallback
                                        src={editNewImgUrl.trim()}
                                        alt={editNewImgAlt || ''}
                                        className="w-full h-16 object-cover rounded-lg border border-slate-700"
                                      />
                                    </div>
                                  )}
                                </div>
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
                    ? 'Consejo: agrega 1–5 productos clave para que la IA tenga buen contexto.'
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
