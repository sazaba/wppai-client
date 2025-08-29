'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { X } from 'lucide-react'

import TypeTabs from './TypeTabs'
import BusinessForm from './BusinessForm'
import CatalogPanel from './CatalogPanel'
import type {
  Producto,
  ImagenProducto,
  ModalEntrenamientoProps,
  BusinessType,
  ConfigForm,
} from './types'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string

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

  // UI
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reloading, setReloading] = useState(false)

  // Form negocio
  const [businessType, setBusinessType] = useState<BusinessType>(
    (initialConfig?.businessType as BusinessType) || 'servicios'
  )

  const emptyForm: ConfigForm = {
    // base
    nombre: initialConfig?.nombre || '',
    descripcion: initialConfig?.descripcion || '',
    servicios: initialConfig?.servicios || '',
    faq: initialConfig?.faq || '',
    horarios: initialConfig?.horarios || '',
    disclaimers: initialConfig?.disclaimers || '',
    businessType: ((initialConfig?.businessType as BusinessType) || 'servicios') as BusinessType,

    // operación (texto libre)
    enviosInfo: initialConfig?.enviosInfo || '',
    metodosPago: initialConfig?.metodosPago || '',
    tiendaFisica: typeof initialConfig?.tiendaFisica === 'boolean' ? initialConfig!.tiendaFisica : false,
    direccionTienda: initialConfig?.direccionTienda || '',
    politicasDevolucion: initialConfig?.politicasDevolucion || '',
    politicasGarantia: initialConfig?.politicasGarantia || '',
    promocionesInfo: initialConfig?.promocionesInfo || '',
    canalesAtencion: initialConfig?.canalesAtencion || '',
    extras: initialConfig?.extras || '',
    palabrasClaveNegocio: initialConfig?.palabrasClaveNegocio || '',

    // envío (estructurado)
    envioTipo: initialConfig?.envioTipo || '',
    envioEntregaEstimado: initialConfig?.envioEntregaEstimado || '',
    envioCostoFijo:
      typeof initialConfig?.envioCostoFijo === 'number'
        ? initialConfig!.envioCostoFijo
        : initialConfig?.envioCostoFijo === ''
        ? ''
        : '',
    envioGratisDesde:
      typeof initialConfig?.envioGratisDesde === 'number'
        ? initialConfig!.envioGratisDesde
        : initialConfig?.envioGratisDesde === ''
        ? ''
        : '',

    // pagos
    pagoLinkGenerico: initialConfig?.pagoLinkGenerico || '',
    pagoLinkProductoBase: initialConfig?.pagoLinkProductoBase || '',
    pagoNotas: initialConfig?.pagoNotas || '',
    bancoNombre: initialConfig?.bancoNombre || '',
    bancoTitular: initialConfig?.bancoTitular || '',
    bancoTipoCuenta: initialConfig?.bancoTipoCuenta || '',
    bancoNumeroCuenta: initialConfig?.bancoNumeroCuenta || '',
    bancoDocumento: initialConfig?.bancoDocumento || '',
    transferenciaQRUrl: initialConfig?.transferenciaQRUrl || '',

    // post-venta
    facturaElectronicaInfo: initialConfig?.facturaElectronicaInfo || '',
    soporteDevolucionesInfo: initialConfig?.soporteDevolucionesInfo || '',

    // escalamiento
    escalarSiNoConfia:
      typeof initialConfig?.escalarSiNoConfia === 'boolean'
        ? initialConfig!.escalarSiNoConfia
        : true,
    escalarPalabrasClave: initialConfig?.escalarPalabrasClave || '',
    escalarPorReintentos: Number(initialConfig?.escalarPorReintentos || 0),
  }

  const [form, setForm] = useState<ConfigForm>(emptyForm)

  // Catálogo
  const [productos, setProductos] = useState<Producto[]>([])
  const [catalogLoaded, setCatalogLoaded] = useState(false)

  // Crear nuevo
  const [nuevoProd, setNuevoProd] = useState<Producto>({
    nombre: '',
    descripcion: '',
    beneficios: '',
    caracteristicas: '',
    precioDesde: null,
    imagenes: [],
  })

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [uploadingCardIndex, setUploadingCardIndex] = useState<number | null>(null)
  const [savingIndex, setSavingIndex] = useState<number | null>(null)

  const totalSteps = useMemo(() => (businessType === 'productos' ? 2 : 1), [businessType])
  const isCatalogStep = businessType === 'productos' && step === 1

  const close = () => {
    setOpen(false)
    onClose?.()
  }
  const next = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1)
  }
  const back = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  // --- API ---
  async function uploadImageFile(productId: number, file: File, alt?: string, isPrimary?: boolean) {
    const fd = new FormData()
    fd.append('file', file)
    if (alt) fd.append('alt', alt)
    if (isPrimary) fd.append('isPrimary', 'true')

    const { data } = await axios.post(`${API_URL}/api/products/${productId}/images/upload`, fd, {
      headers: { ...getAuthHeaders() },
    })
    return { id: data?.id, url: data?.url || '', alt: alt || '' } as ImagenProducto
  }

  async function deleteImageOnCard(
    productId: number,
    imageId: number,
    cardIndex: number,
    imageIndex: number
  ) {
    setProductos((list) => {
      const copy = [...list]
      const prod = copy[cardIndex]
      if (!prod) return list
      const imgs = [...(prod.imagenes || [])]
      imgs.splice(imageIndex, 1)
      copy[cardIndex] = { ...prod, imagenes: imgs }
      return copy
    })
    try {
      await axios.delete(`${API_URL}/api/products/${productId}/images/${imageId}`, {
        headers: getAuthHeaders(),
      })
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'No se pudo eliminar la imagen.')
      await loadCatalog()
    }
  }

  async function crearProducto() {
    if (!nuevoProd.nombre.trim()) {
      setErrorMsg('El producto necesita al menos un nombre.')
      return
    }
    try {
      const { data: created } = await axios.post(
        `${API_URL}/api/products`,
        {
          nombre: nuevoProd.nombre,
          descripcion: nuevoProd.descripcion,
          beneficios: nuevoProd.beneficios,
          caracteristicas: nuevoProd.caracteristicas,
          precioDesde: nuevoProd.precioDesde ?? null,
        },
        { headers: getAuthHeaders() }
      )

      setProductos((arr) => [
        ...arr,
        {
          id: created.id,
          nombre: created.nombre,
          descripcion: created.descripcion || '',
          beneficios: created.beneficios || '',
          caracteristicas: created.caracteristicas || '',
          precioDesde: created.precioDesde ?? null,
          imagenes: [],
        },
      ])
      setNuevoProd({
        nombre: '',
        descripcion: '',
        beneficios: '',
        caracteristicas: '',
        precioDesde: null,
        imagenes: [],
      })
      setErrorMsg(null)
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'No se pudo crear el producto.')
    }
  }

  async function deleteProducto(idx: number) {
    const prod = productos[idx]
    if (!prod) return
    setProductos((arr) => arr.filter((_, i) => i !== idx))
    if (!prod.id) return
    try {
      await axios.delete(`${API_URL}/api/products/${prod.id}`, { headers: getAuthHeaders() })
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'No se pudo eliminar el producto.')
      await loadCatalog()
    }
  }

  function startEdit(idx: number) {
    setEditingIndex(idx)
  }
  function cancelEdit() {
    setEditingIndex(null)
  }

  async function saveProduct(idx: number, patch: Partial<Producto>) {
    const prod = productos[idx]
    if (!prod?.id) {
      setEditingIndex(null)
      return
    }
    try {
      setSavingIndex(idx)
      await axios.put(
        `${API_URL}/api/products/${prod.id}`,
        {
          nombre: patch.nombre ?? prod.nombre,
          descripcion: patch.descripcion ?? prod.descripcion,
          beneficios: patch.beneficios ?? prod.beneficios,
          caracteristicas: patch.caracteristicas ?? prod.caracteristicas,
          precioDesde:
            typeof patch.precioDesde !== 'undefined' ? patch.precioDesde : prod.precioDesde ?? null,
        },
        { headers: getAuthHeaders() }
      )
      setProductos((list) => {
        const copy = [...list]
        copy[idx] = { ...copy[idx], ...patch }
        return copy
      })
      setEditingIndex(null)
      setErrorMsg(null)
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'No se pudo guardar la edición.')
    } finally {
      setSavingIndex(null)
    }
  }

  // SUBIDA
  async function handleUploadAt(idx: number, file: File) {
    const prod = productos[idx]
    if (!prod?.id) return
    try {
      setUploadingCardIndex(idx)
      const created = await uploadImageFile(prod.id, file)
      return created
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'No se pudo subir la imagen.')
      throw e
    } finally {
      setUploadingCardIndex(null)
    }
  }

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

  useEffect(() => {
    if (!open) return
    const bt = (initialConfig?.businessType as BusinessType) || 'servicios'
    setBusinessType(bt)
    setForm({
      ...emptyForm,
      businessType: bt,
    })
    if (bt === 'productos') {
      void loadCatalog()
    } else {
      setProductos([])
      setCatalogLoaded(false)
    }
    setStep(0)
    setErrorMsg(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleChangeType(t: BusinessType) {
    if (t === 'productos') {
      setBusinessType('productos')
      setForm((f) => ({ ...f, businessType: 'productos' }))
      if (!catalogLoaded) await loadCatalog()
      if (step > 1) setStep(0)
    } else {
      setBusinessType('servicios')
      setForm((f) => ({ ...f, businessType: 'servicios' }))
      setProductos([])
      setCatalogLoaded(false)
      setStep(0)
    }
  }

  async function guardarTodo() {
    try {
      setSaving(true)
      setErrorMsg(null)

      // Normaliza números opcionales a null cuando vengan como ''
      const payload: any = { ...form, businessType }
      if (payload.envioCostoFijo === '') payload.envioCostoFijo = null
      if (payload.envioGratisDesde === '') payload.envioGratisDesde = null

      await axios.put(`${API_URL}/api/config`, payload, { headers: getAuthHeaders() })

      if (businessType === 'productos') await loadCatalog()
      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando cambios.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={() => {}} className="relative z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center px-3 sm:px-6">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="w-full max-w-3xl bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-2xl overflow-y-auto max-h-[92vh]"
            >
              {/* header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 rounded-lg bg-slate-800 text-xs font-medium border border-slate-700">
                    Entrenamiento de IA
                  </div>
                  <span className="text-slate-400 text-sm">Paso {step + 1} de {totalSteps}</span>
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
                  aria-label="Cerrar"
                  type="button"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>

              <div className="mb-4">
                <TypeTabs value={businessType} onChange={handleChangeType} loading={reloading} />
              </div>

              {!(businessType === 'productos' && step === 1) ? (
                <BusinessForm
                  value={form}
                  businessType={businessType}
                  onChange={(patch) => setForm((f) => ({ ...f, ...patch, businessType }))}
                />
              ) : (
                <CatalogPanel
                  productos={productos}
                  nuevoProd={nuevoProd}
                  reloading={reloading}
                  onReload={loadCatalog}
                  onChangeNuevo={(patch) => setNuevoProd((p) => ({ ...p, ...patch }))}
                  onCrear={crearProducto}
                  isEditing={(idx) => editingIndex === idx}
                  onEdit={(idx) => startEdit(idx)}
                  onDelete={(idx) => deleteProducto(idx)}
                  onSave={(idx, patch) => saveProduct(idx, patch)}
                  onCancel={() => cancelEdit()}
                  onUpload={(idx, file) => handleUploadAt(idx, file)}
                  onRemoveImage={(idx, imageId) => {
                    const prod = productos[idx]
                    if (!prod?.id || !imageId) return
                    const imgIdx = (prod.imagenes || []).findIndex((im) => im.id === imageId)
                    if (imgIdx >= 0) void deleteImageOnCard(prod.id, imageId, idx, imgIdx)
                  }}
                  uploadingIndex={uploadingCardIndex}
                  savingIndex={savingIndex}
                />
              )}

              {errorMsg && (
                <div className="mt-4 text-sm text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
                  {errorMsg}
                </div>
              )}

              {/* footer */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {businessType === 'productos'
                    ? 'Crea el producto y luego súbele sus fotos.'
                    : 'Completa la info clave para respuestas precisas.'}
                </div>
                <div className="flex items-center gap-2">
                  {step > 0 ? (
                    <button
                      onClick={back}
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm"
                      type="button"
                    >
                      Atrás
                    </button>
                  ) : (
                    <div className="hidden sm:block w-[84px]" />
                  )}
                  {businessType === 'productos' && step < 1 ? (
                    <button
                      onClick={next}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60"
                      type="button"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={guardarTodo}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-60"
                      type="button"
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
