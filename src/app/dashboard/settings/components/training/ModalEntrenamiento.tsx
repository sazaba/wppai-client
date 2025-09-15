'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { X } from 'lucide-react'

import TypeTabs, { type EditorTab } from './TypeTabs'
import BusinessForm from './BusinessForm'
import CatalogPanel from './CatalogPanel'
import AgentForm from './AgentForm'
import AppointmentForm, {
  type AppointmentDay,
  type Weekday,
  type AppointmentConfigValue,
  type Vertical,
  type ProviderInput,
} from './AppointmentForm'

import { fetchAppointmentConfig } from '@/lib/appointments'

import type {
  Producto,
  ImagenProducto,
  ModalEntrenamientoProps,
  BusinessType,
  ConfigForm,
  AiMode,
  AgentSpecialty,
} from './types'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '') as string

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** 👉 Extiende el formulario base con los campos de citas */
type FormState = ConfigForm & {
  appointmentEnabled: boolean
  appointmentVertical: Vertical
  appointmentTimezone: string
  appointmentBufferMin: number
  appointmentPolicies?: string
  appointmentReminders: boolean
  /** horas de atención (7 días) */
  hours?: AppointmentDay[]
  /** profesional principal (opcional) */
  provider?: ProviderInput | null
}

const moneyOrEmpty = (v: unknown): number | '' => (typeof v === 'number' ? v : '')

/* ===== helpers de horas ===== */
const ORDER: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function hoursFromDb(rows: AppointmentDay[] | undefined | null): AppointmentDay[] {
  const base = new Map<Weekday, AppointmentDay>()
  for (const d of ORDER) {
    base.set(d, { day: d, isOpen: false, start1: null, end1: null, start2: null, end2: null })
  }
  if (Array.isArray(rows)) {
    for (const r of rows) {
      const k = r.day as Weekday
      if (!ORDER.includes(k)) continue
      base.set(k, {
        day: k,
        isOpen: !!r.isOpen,
        start1: r.start1 ?? null,
        end1: r.end1 ?? null,
        start2: r.start2 ?? null,
        end2: r.end2 ?? null,
      })
    }
  }
  return ORDER.map((d) => base.get(d)!)
}

/** Construye el payload para POST /api/appointments/config */
function buildAppointmentPayloadFromForm(form: FormState) {
  const hours = hoursFromDb(form.hours)
  return {
    appointment: {
      enabled: !!form.appointmentEnabled,
      vertical: form.appointmentVertical,
      timezone: form.appointmentTimezone || 'America/Bogota',
      bufferMin: Number.isFinite(form.appointmentBufferMin) ? form.appointmentBufferMin : 10,
      policies: form.appointmentPolicies || '',
      reminders: !!form.appointmentReminders,
    },
    hours: hours.map((h) => ({
      day: h.day,
      isOpen: !!h.isOpen,
      start1: h.isOpen ? h.start1 : null,
      end1: h.isOpen ? h.end1 : null,
      start2: h.isOpen ? h.start2 : null,
      end2: h.isOpen ? h.end2 : null,
    })),
    extras: {
      // sincronizamos con config general por si quieres usarlo en el prompt del agente
      servicios: form.servicios || '',
      agentDisclaimers: form.agentDisclaimers || '',
    },
    provider: form.provider ?? null,
  }
}

export default function ModalEntrenamiento({
  trainingActive,
  onClose,
  initialConfig,
}: ModalEntrenamientoProps) {
  const [open, setOpen] = useState<boolean>(trainingActive)
  useEffect(() => setOpen(trainingActive), [trainingActive])

  // UI
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reloading, setReloading] = useState(false)

  // Tabs
  const initialBT = (initialConfig?.businessType as BusinessType) || 'servicios'
  const [tab, setTab] = useState<EditorTab>('servicios')

  // Pasos (solo productos)
  const [step, setStep] = useState(0)
  const totalSteps = useMemo(() => (tab === 'productos' ? 2 : 1), [tab])
  const isCatalogStep = tab === 'productos' && step === 1
  const next = () => setStep((s) => (s < totalSteps - 1 ? s + 1 : s))
  const back = () => setStep((s) => (s > 0 ? s - 1 : s))

  // Form principal + agenda
  const [businessType, setBusinessType] = useState<BusinessType>(initialBT)

  const emptyForm: FormState = {
    // base
    nombre: initialConfig?.nombre || '',
    descripcion: initialConfig?.descripcion || '',
    servicios: initialConfig?.servicios || '',
    faq: initialConfig?.faq || '',
    horarios: initialConfig?.horarios || '',
    disclaimers: initialConfig?.disclaimers || '',
    businessType: initialBT,

    // IA / Agente
    aiMode: (initialConfig?.aiMode as AiMode) || (initialBT === 'productos' ? 'ecommerce' : 'agente'),
    agentSpecialty: (initialConfig?.agentSpecialty as AgentSpecialty) || 'generico',
    agentPrompt: initialConfig?.agentPrompt || '',
    agentScope: initialConfig?.agentScope || '',
    agentDisclaimers: initialConfig?.agentDisclaimers || '',

    // operación
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

    // envío
    envioTipo: initialConfig?.envioTipo || '',
    envioEntregaEstimado: initialConfig?.envioEntregaEstimado || '',
    envioCostoFijo: moneyOrEmpty(initialConfig?.envioCostoFijo),
    envioGratisDesde: moneyOrEmpty(initialConfig?.envioGratisDesde),

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
      typeof initialConfig?.escalarSiNoConfia === 'boolean' ? initialConfig!.escalarSiNoConfia : true,
    escalarPalabrasClave: initialConfig?.escalarPalabrasClave || '',
    escalarPorReintentos: Number(initialConfig?.escalarPorReintentos || 0),

    // citas / agenda
    appointmentEnabled: (initialConfig as any)?.appointmentEnabled ?? false,
    appointmentVertical: ((initialConfig as any)?.appointmentVertical as Vertical) ?? 'none',
    appointmentTimezone: (initialConfig as any)?.appointmentTimezone ?? 'America/Bogota',
    appointmentBufferMin: (initialConfig as any)?.appointmentBufferMin ?? 10,
    appointmentPolicies: (initialConfig as any)?.appointmentPolicies ?? '',
    appointmentReminders: (initialConfig as any)?.appointmentReminders ?? true,
    hours: undefined, // se hidrata al abrir "citas"
    provider: null,   // idem
  }

  const [form, setForm] = useState<FormState>(emptyForm)

  // Catálogo
  const [productos, setProductos] = useState<Producto[]>([])
  const [catalogLoaded, setCatalogLoaded] = useState(false)

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

  const close = () => {
    setOpen(false)
    onClose?.()
  }

  // Upload imagen
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

  async function handleUploadAt(idx: number, file: File) {
    const prod = productos[idx]
    if (!prod?.id) return
    try {
      setUploadingCardIndex(idx)
      return await uploadImageFile(prod.id, file)
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'No se pudo subir la imagen.')
      throw e
    } finally {
      setUploadingCardIndex(null)
    }
  }

  async function deleteImageOnCard(
    productId: number,
    imageId: number,
    cardIndex: number,
    imageIndex: number
  ) {
    // Optimista
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
        } as any,
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

  // fetch catálogo
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
        imagenes: (p.imagenes || []).map((img: any) => ({ id: img.id, url: img.url, alt: img.alt || '' })),
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

  // Apertura → resetea
  useEffect(() => {
    if (!open) return
    setBusinessType((initialConfig?.businessType as BusinessType) || 'servicios')
    setForm({ ...emptyForm })
    setStep(0)
    setErrorMsg(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Carga agenda cuando entras a la pestaña "citas"
  async function loadAppointmentConfigIntoForm() {
    try {
      const data = await fetchAppointmentConfig()

      // Tipos del backend (todo opcional porque puede venir vacío)
      type BackendAppointmentConfig = {
        appointmentEnabled?: boolean
        appointmentVertical?: Vertical
        appointmentTimezone?: string
        appointmentBufferMin?: number
        appointmentPolicies?: string
        appointmentReminders?: boolean
      }

      const cfg = (data?.config ?? {}) as BackendAppointmentConfig
      const p  = (data?.provider ?? null) as (ProviderInput & { id?: number }) | null

      setForm((f) => ({
        ...f,
        appointmentEnabled: !!cfg.appointmentEnabled,
        appointmentVertical: (cfg.appointmentVertical as Vertical) ?? 'none',
        appointmentTimezone: cfg.appointmentTimezone ?? 'America/Bogota',
        appointmentBufferMin: Number.isFinite(cfg.appointmentBufferMin!)
          ? (cfg.appointmentBufferMin as number)
          : 10,
        appointmentPolicies: cfg.appointmentPolicies ?? '',
        appointmentReminders: cfg.appointmentReminders ?? true,
        hours: hoursFromDb(data?.hours as AppointmentDay[] | null | undefined),


        // hidratar provider solo si existe
        provider: p
          ? {
              id: p.id,
              nombre: p.nombre ?? '',
              email: p.email ?? '',
              phone: p.phone ?? '',
              cargo: p.cargo ?? '',
              colorHex: p.colorHex ?? '',
              activo: typeof p.activo === 'boolean' ? p.activo : true,
            }
          : null,
      }))
    } catch (e: any) {
      console.error('[settings] fetchAppointmentConfig error:', e)
      setErrorMsg(e?.response?.data?.error || e?.message || 'No se pudo cargar la agenda')
    }
  }

  // Cambio de tab
  async function handleChangeTab(nextTab: EditorTab) {
    setTab(nextTab)
    setStep(0)
    setErrorMsg(null)
    if (nextTab === 'productos') {
      setBusinessType('productos')
      setForm((f) => ({ ...f, businessType: 'productos', aiMode: 'ecommerce' }))
      if (!catalogLoaded) await loadCatalog()
    } else if (nextTab === 'servicios') {
      setBusinessType('servicios')
      setForm((f) => ({ ...f, businessType: 'servicios', aiMode: 'agente' }))
    } else if (nextTab === 'agente') {
      setForm((f) => ({ ...f, aiMode: 'agente' }))
    } else if (nextTab === 'citas') {
      // 🚀 hidrata la agenda al entrar
      await loadAppointmentConfigIntoForm()
    }
  }

  // Guardados
  async function guardarTodo() {
    try {
      setSaving(true)
      setErrorMsg(null)

      // 1) Si estamos en Citas, persistimos también la agenda (config + hours) en su endpoint
      if (tab === 'citas') {
        const appointmentPayload = buildAppointmentPayloadFromForm(form)
        await axios.post(`${API_URL}/api/appointments/config`, appointmentPayload as any, {
          headers: getAuthHeaders(),
        })
      }

      // 2) Guardamos SIEMPRE la config general
      const payload: any = { ...form, businessType }
      if (payload.envioCostoFijo === '') payload.envioCostoFijo = null
      if (payload.envioGratisDesde === '') payload.envioGratisDesde = null
      payload.aiMode = tab === 'productos' ? ('ecommerce' as AiMode) : payload.aiMode

      await axios.put(`${API_URL}/api/config`, payload, { headers: getAuthHeaders() })

      if (tab === 'productos') await loadCatalog()
      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando cambios.')
    } finally {
      setSaving(false)
    }
  }

  async function guardarAgente() {
    try {
      setSaving(true)
      setErrorMsg(null)
      const payload = {
        aiMode: 'agente' as AiMode,
        agentSpecialty: form.agentSpecialty,
        agentPrompt: form.agentPrompt ?? '',
        agentScope: form.agentScope ?? '',
        agentDisclaimers: form.agentDisclaimers ?? '',
      }
      await axios.put(`${API_URL}/api/config/agent`, payload, { headers: getAuthHeaders() })
      close()
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Error guardando el agente.')
    } finally {
      setSaving(false)
    }
  }

  // Render
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
                  {tab === 'productos' ? (
                    <span className="text-slate-400 text-sm">Paso {step + 1} de {totalSteps}</span>
                  ) : null}
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
                <TypeTabs value={tab} onChange={handleChangeTab} loading={reloading} />
              </div>

              {/* contenido */}
              {tab === 'agente' ? (
                <AgentForm
                  value={{
                    aiMode: form.aiMode,
                    agentSpecialty: form.agentSpecialty,
                    agentPrompt: form.agentPrompt,
                    agentScope: form.agentScope,
                    agentDisclaimers: form.agentDisclaimers,
                  }}
                  onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                />
              ) : tab === 'productos' && isCatalogStep ? (
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
                    if (!prod || !prod.id) return
                    const imgIdx = (prod.imagenes || []).findIndex((im) => im.id === imageId)
                    if (imgIdx >= 0) void deleteImageOnCard(prod.id, imageId, idx, imgIdx)
                  }}
                  uploadingIndex={uploadingCardIndex}
                  savingIndex={savingIndex}
                />
              ) : tab === 'productos' && !isCatalogStep ? (
                <BusinessForm
                  value={form}
                  businessType={'productos'}
                  onChange={(patch) => setForm((f) => ({ ...f, ...patch, businessType: 'productos' }))}
                />
              ) : tab === 'citas' ? (
                <AppointmentForm
                  value={{
                    appointmentEnabled: form.appointmentEnabled,
                    appointmentVertical: form.appointmentVertical,
                    appointmentTimezone: form.appointmentTimezone,
                    appointmentBufferMin: form.appointmentBufferMin,
                    appointmentPolicies: form.appointmentPolicies,
                    appointmentReminders: form.appointmentReminders,
                    hours: form.hours,
                    provider: form.provider, // 👈 pasamos provider al form
                  } as AppointmentConfigValue}
                  onChange={(patch) => setForm((f) => ({ ...f, ...(patch as Partial<FormState>) }))}
                />
              ) : (
                // servicios
                <BusinessForm
                  value={form}
                  businessType={'servicios'}
                  onChange={(patch) => setForm((f) => ({ ...f, ...patch, businessType: 'servicios' }))}
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
                  {tab === 'productos'
                    ? (isCatalogStep ? 'Sube fotos y organiza tu catálogo.' : 'Crea el producto y luego súbele sus fotos.')
                    : tab === 'agente'
                    ? 'Configura el modo y el perfil del agente.'
                    : tab === 'citas'
                    ? 'Configura tu agenda y políticas de atención.'
                    : 'Completa la info clave del negocio.'}
                </div>

                <div className="flex items-center gap-2">
                  {tab === 'productos' && step > 0 ? (
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

                  {tab === 'agente' ? (
                    <button
                      onClick={guardarAgente}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm disabled:opacity-60"
                      type="button"
                    >
                      {saving ? 'Guardando…' : 'Guardar agente'}
                    </button>
                  ) : tab === 'productos' && !isCatalogStep ? (
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
