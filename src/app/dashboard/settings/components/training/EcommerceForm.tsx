'use client'

import React, { useEffect, useState, memo } from 'react'
import { 
  Store, Truck, CreditCard, Sparkles, ShieldCheck, Save, 
  ShoppingBag, HelpCircle, Loader2, AlertCircle, Package 
} from 'lucide-react'
import Swal from 'sweetalert2'
import clsx from 'clsx'

// Tipos y Servicio
import { EcommerceConfigForm, DEFAULTS_ECOMMERCE, AiSellingStyle } from './types'
import { getEcommerceConfig, saveEcommerceConfig } from '@/services/ecommerce.service'

// 👇 IMPORTAMOS EL NUEVO COMPONENTE DE CATÁLOGO
import CatalogPanel from './CatalogPanel'

// --- Componentes UI Reutilizables ---

function Hint({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center group align-middle ml-2">
      <HelpCircle aria-hidden className="w-3.5 h-3.5 text-slate-400 cursor-help" />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[280px] rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {text}
      </span>
    </span>
  )
}

function Section({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm transition-all hover:border-slate-700/50">
      <div className="mb-6 flex items-start gap-3 border-b border-slate-800/50 pb-4">
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/50 text-indigo-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h3 className="text-slate-100 font-semibold tracking-tight text-lg">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-400 mt-1">{subtitle}</p> : null}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

const TextInput = ({ 
    label, value, onChange, placeholder, hint 
  }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, hint?: string }) => (
    <div>
      <div className="flex items-center mb-1.5">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        {hint && <Hint text={hint} />}
      </div>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
        placeholder={placeholder}
      />
    </div>
)

const TextArea = ({ 
    label, value, onChange, placeholder, hint, rows = 3, mono = false
  }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, hint?: string, rows?: number, mono?: boolean }) => (
    <div>
      <div className="flex items-center mb-1.5">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        {hint && <Hint text={hint} />}
      </div>
      <textarea 
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all resize-none",
          mono && "font-mono text-xs leading-relaxed"
        )}
        placeholder={placeholder}
      />
    </div>
)

// --- Componente Principal ---

interface EcommerceFormProps {
  onClose?: () => void
}

function EcommerceFormBase({ onClose }: EcommerceFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EcommerceConfigForm>(DEFAULTS_ECOMMERCE)
  
  // Estado para Pestañas
  const [activeTab, setActiveTab] = useState<'settings' | 'products'>('settings')

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEcommerceConfig()
        if (data && Object.keys(data).length > 0) {
          setForm({ ...DEFAULTS_ECOMMERCE, ...data })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const dataToSend = { ...form, aiMode: 'ecommerce' as const }
      await saveEcommerceConfig(dataToSend)
      
      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'Tu tienda ha sido actualizada correctamente.',
        background: '#0f172a',
        color: '#e2e8f0',
        confirmButtonColor: '#6366f1',
        toast: true,
        position: 'bottom-end',
        timer: 3000,
        showConfirmButton: false
      })
      // No cerramos el modal automáticamente si estamos en pestañas, para mejor UX
      // if (onClose) onClose() 
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la configuración.',
        background: '#0f172a',
        color: '#e2e8f0'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Cargando...</div>

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      
      {/* Header y Toggle Principal */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-pink-500" />
            Módulo E-commerce
          </h2>
          <p className="text-sm text-slate-400 mt-1">Activa las funciones de venta y gestiona tu inventario.</p>
        </div>
        
        {/* SWITCH DE ACTIVACIÓN */}
        <div className={clsx(
            "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all",
            form.isActive 
              ? "bg-pink-500/10 border-pink-500/20" 
              : "bg-slate-950 border-slate-800"
          )}>
          <span className={clsx("text-xs font-bold uppercase tracking-wider", form.isActive ? "text-pink-400" : "text-slate-500")}>
            {form.isActive ? 'Tienda Activa' : 'Desactivada'}
          </span>
          <button
            type="button"
            onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
            className={clsx(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-transparent",
              form.isActive ? 'bg-pink-500' : 'bg-slate-700'
            )}
          >
            <span className={clsx(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
              form.isActive ? 'translate-x-6' : 'translate-x-1'
            )} />
          </button>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex gap-1 mb-6 border-b border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab('settings')}
          className={clsx(
            "px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all border-b-2",
            activeTab === 'settings' 
              ? "text-pink-400 border-pink-500 bg-pink-500/5" 
              : "text-zinc-500 border-transparent hover:text-white hover:bg-white/5"
          )}
        >
          Configuración General
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={clsx(
            "px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2",
            activeTab === 'products' 
              ? "text-pink-400 border-pink-500 bg-pink-500/5" 
              : "text-zinc-500 border-transparent hover:text-white hover:bg-white/5"
          )}
        >
          <Package className="w-4 h-4" /> Catálogo de Productos
        </button>
      </div>

      {/* --- TAB 1: CONFIGURACIÓN GENERAL --- */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-6">
              <Section title="Identidad de la Tienda" subtitle="Cómo se presenta tu negocio ante los clientes." icon={Store}>
                <TextInput 
                  label="Nombre de la Tienda" 
                  value={form.storeName || ''} 
                  onChange={v => setForm(f => ({...f, storeName: v}))}
                  placeholder="Ej: Moda Urbana SAS"
                />
                
                {/* SELECTOR DE MONEDA */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Moneda</label>
                  <select
                    value={form.currency || 'COP'}
                    onChange={e => setForm(f => ({...f, currency: e.target.value}))}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </Section>

              <Section title="Logística y Envíos" subtitle="Información clave para despachos." icon={Truck}>
                <div className="grid grid-cols-2 gap-4">
                  <TextInput 
                    label="Costo de Envío" 
                    value={form.shippingCost || ''} 
                    onChange={v => setForm(f => ({...f, shippingCost: v}))}
                    placeholder="Ej: $15.000 o 'Gratis'"
                  />
                  <TextInput 
                    label="Tiempo de Entrega" 
                    value={form.deliveryTimeEstimate || ''} 
                    onChange={v => setForm(f => ({...f, deliveryTimeEstimate: v}))}
                    placeholder="Ej: 2-3 días hábiles"
                  />
                </div>
                <TextArea 
                  label="Dirección de Recogida" 
                  value={form.pickupAddress || ''} 
                  onChange={v => setForm(f => ({...f, pickupAddress: v}))}
                  placeholder="Si tienes punto físico, pon la dirección y horario aquí."
                />
              </Section>

              <Section title="Pagos Manuales" subtitle="Datos para transferencias." icon={CreditCard}>
                <TextArea 
                  label="Instrucciones de Pago" 
                  value={form.manualPaymentInfo || ''} 
                  onChange={v => setForm(f => ({...f, manualPaymentInfo: v}))}
                  rows={4}
                  mono
                  placeholder={`Bancolombia Ahorros: 000-123\nNequi: 300-123\nTitular: Mi Empresa`}
                />
              </Section>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-6">
              
              <div className="rounded-2xl border border-pink-500/20 bg-slate-900/40 p-5 shadow-sm relative overflow-hidden">
                <div className="mb-6 flex items-start gap-3 border-b border-pink-500/10 pb-4 relative z-10">
                  <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-slate-100 font-semibold tracking-tight text-lg">Cerebro Vendedor</h3>
                    <p className="text-sm text-slate-400 mt-1">Configura el estilo de venta.</p>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-3 block">Estilo de Venta</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'asesor', label: 'Asesor', desc: 'Amable y paciente.' },
                        { id: 'persuasivo', label: 'Persuasivo', desc: 'Enfocado en cerrar.' }
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setForm(f => ({...f, aiSellingStyle: style.id as AiSellingStyle}))}
                          className={clsx(
                            "p-3 rounded-xl border text-left transition-all",
                            form.aiSellingStyle === style.id 
                              ? "bg-pink-500/10 border-pink-500/50 text-white shadow-lg shadow-pink-500/10" 
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-700"
                          )}
                        >
                          <div className="font-bold text-sm">{style.label}</div>
                          <div className="text-[10px] opacity-70 mt-0.5">{style.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-2 flex gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        La IA pedirá estos datos para marcar la venta como "Lista".
                      </p>
                    </div>
                    <TextArea 
                      label="Instrucciones de Cierre"
                      value={form.closingInstructions || ''}
                      onChange={v => setForm(f => ({...f, closingInstructions: v}))}
                      rows={5}
                      placeholder="Ej: 1. Foto comprobante. 2. Nombre. 3. Dirección. 4. Teléfono."
                    />
                  </div>
                </div>
              </div>

              <Section title="Políticas" subtitle="Reglas claras." icon={ShieldCheck}>
                <TextArea 
                  label="Garantía" 
                  value={form.warrantyPolicy || ''} 
                  onChange={v => setForm(f => ({...f, warrantyPolicy: v}))}
                />
                <TextArea 
                  label="Devoluciones" 
                  value={form.returnPolicy || ''} 
                  onChange={v => setForm(f => ({...f, returnPolicy: v}))}
                />
              </Section>

            </div>
          </div>

          {/* Botón Guardar Flotante (Solo en Configuración) */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 transition-all disabled:opacity-50 hover:-translate-y-1 active:scale-95"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: CATÁLOGO DE PRODUCTOS --- */}
      {activeTab === 'products' && (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          <CatalogPanel />
        </div>
      )}

    </div>
  )
}

export default memo(EcommerceFormBase)