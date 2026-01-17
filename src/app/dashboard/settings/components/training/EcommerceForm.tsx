'use client'

import React, { useEffect, useState, memo } from 'react'
import { 
  Store, Truck, CreditCard, Sparkles, ShieldCheck, Save, 
  ShoppingBag, CheckCircle2, AlertCircle, HelpCircle, Loader2
} from 'lucide-react'
import Swal from 'sweetalert2'
import clsx from 'clsx'

// Tipos y Servicio
import { EcommerceConfigForm, DEFAULTS_ECOMMERCE } from './types'
import { getEcommerceConfig, saveEcommerceConfig } from '@/services/ecommerce.service'

// --- Componentes UI Reutilizables (estilo AgentForm) ---

function Hint({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center group align-middle ml-2">
      <HelpCircle aria-hidden className="w-3.5 h-3.5 text-slate-400 cursor-help" />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[280px] rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-xs px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {text}
        {/* Triangulito */}
        <span className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45"></span>
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

// --- Componente Principal ---

interface EcommerceFormProps {
  onClose?: () => void
}

function EcommerceFormBase({ onClose }: EcommerceFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EcommerceConfigForm>(DEFAULTS_ECOMMERCE)

  // Cargar datos
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

  // Guardar datos
  const handleSave = async () => {
    setSaving(true)
    try {
      await saveEcommerceConfig(form)
      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'Tu tienda ha sido actualizada correctamente.',
        background: '#0f172a', // slate-900
        color: '#e2e8f0', // slate-200
        confirmButtonColor: '#6366f1' // indigo-500
      })
      if (onClose) onClose()
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

  // Inputs Helpers
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Header y Toggle Principal */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-pink-500" />
            Módulo E-commerce
          </h2>
          <p className="text-sm text-slate-400 mt-1">Activa las funciones de venta, carrito y catálogo en tu IA.</p>
        </div>
        
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          
          {/* Identidad */}
          <Section title="Identidad de la Tienda" subtitle="Cómo se presenta tu negocio ante los clientes." icon={Store}>
            <TextInput 
              label="Nombre de la Tienda" 
              value={form.storeName || ''} 
              onChange={v => setForm({...form, storeName: v})}
              placeholder="Ej: Moda Urbana SAS"
            />
            <div className="w-1/3">
              <TextInput 
                label="Moneda" 
                value={form.currency || 'COP'} 
                onChange={v => setForm({...form, currency: v})}
                placeholder="COP"
                hint="Código ISO (USD, MXN, COP)"
              />
            </div>
          </Section>

          {/* Logística */}
          <Section title="Logística y Envíos" subtitle="Información clave para que la IA responda sobre despachos." icon={Truck}>
            <div className="grid grid-cols-2 gap-4">
              <TextInput 
                label="Costo de Envío" 
                value={form.shippingCost || ''} 
                onChange={v => setForm({...form, shippingCost: v})}
                placeholder="Ej: $15.000 o 'Gratis'"
              />
              <TextInput 
                label="Tiempo de Entrega" 
                value={form.deliveryTimeEstimate || ''} 
                onChange={v => setForm({...form, deliveryTimeEstimate: v})}
                placeholder="Ej: 2-3 días hábiles"
              />
            </div>
            <TextArea 
              label="Dirección de Recogida" 
              value={form.pickupAddress || ''} 
              onChange={v => setForm({...form, pickupAddress: v})}
              placeholder="Si tienes punto físico, pon la dirección y horario aquí. Si no, déjalo vacío."
              hint="La IA usará esto solo si el cliente pregunta por recoger en tienda."
            />
          </Section>

          {/* Pagos */}
          <Section title="Pagos Manuales" subtitle="Datos para transferencias o depósitos." icon={CreditCard}>
            <TextArea 
              label="Instrucciones de Pago" 
              value={form.manualPaymentInfo || ''} 
              onChange={v => setForm({...form, manualPaymentInfo: v})}
              rows={4}
              mono
              placeholder={`Bancolombia Ahorros: 000-123-456\nNequi: 300-123-4567\nTitular: Mi Empresa\nEnviar comprobante al chat.`}
              hint="Esto se enviará al cliente textualmente cuando decida comprar."
            />
          </Section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          
          {/* Cerebro IA */}
          <div className="rounded-2xl border border-pink-500/20 bg-slate-900/40 p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[80px] pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
            
            <div className="mb-6 flex items-start gap-3 border-b border-pink-500/10 pb-4 relative z-10">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-100 font-semibold tracking-tight text-lg">Cerebro Vendedor</h3>
                <p className="text-sm text-slate-400 mt-1">Configura cómo la IA cierra las ventas.</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex items-center mb-3">
                  <label className="text-sm font-medium text-slate-300">Estilo de Venta</label>
                  <Hint text="Define la personalidad del vendedor." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'asesor', label: 'Asesor', desc: 'Amable, paciente y educativo.' },
                    { id: 'vendedor_agresivo', label: 'Persuasivo', desc: 'Enfocado en cerrar rápido.' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      // @ts-ignore - Ignoramos error si el string no calza exacto por ahora
                      onClick={() => setForm({...form, aiSellingStyle: style.id})}
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
                <div className="flex items-center gap-2 mb-2">
                   <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                     Instrucciones de Cierre (El 90% Manual)
                   </label>
                </div>
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-3 flex gap-3 items-start">
                   <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-200/90 leading-relaxed">
                     Cuando el cliente quiera pagar, la IA pedirá estos datos. 
                     <strong> Solo cuando el usuario los entregue, la IA marcará la venta como "Lista".</strong>
                   </p>
                </div>

                <TextArea 
                  label=""
                  value={form.closingInstructions || ''}
                  onChange={v => setForm({...form, closingInstructions: v})}
                  rows={5}
                  placeholder="Ej: Por favor envíame: 1. Foto del comprobante. 2. Nombre completo. 3. Dirección exacta y ciudad. 4. Teléfono de quien recibe."
                />
              </div>
            </div>
          </div>

          {/* Políticas */}
          <Section title="Garantías y Políticas" subtitle="Reglas claras para evitar reclamos." icon={ShieldCheck}>
            <TextArea 
              label="Política de Garantía" 
              value={form.warrantyPolicy || ''} 
              onChange={v => setForm({...form, warrantyPolicy: v})}
              placeholder="Ej: 30 días por defectos de fábrica."
            />
            <TextArea 
              label="Política de Devolución" 
              value={form.returnPolicy || ''} 
              onChange={v => setForm({...form, returnPolicy: v})}
              placeholder="Ej: No aceptamos cambios en ropa interior o productos abiertos."
            />
          </Section>

        </div>
      </div>

      {/* Footer Flotante de Guardado */}
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  )
}

export default memo(EcommerceFormBase)