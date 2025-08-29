'use client'

import { memo, useMemo, useCallback } from 'react'
import { HelpCircle } from 'lucide-react'
import type { BusinessType, ConfigForm } from './types'

type Props = {
  value: ConfigForm
  businessType: BusinessType
  onChange: (patch: Partial<ConfigForm>) => void
}

/* UI helpers */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-slate-100 font-semibold tracking-tight">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-400 mt-1">{subtitle}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Hint({ text }: { text: string }) {
  return (
    <span className="relative inline-flex items-center group align-middle">
      <HelpCircle aria-hidden className="w-3.5 h-3.5 text-slate-400" />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max max-w-[320px] rounded-md border border-slate-700 bg-slate-900 text-slate-200 text-[11px] px-2 py-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {text}
      </span>
    </span>
  )
}

type Pregunta =
  | { campo: keyof ConfigForm; tipo: 'text' | 'textarea'; label: string; placeholder?: string; required?: boolean; hint?: string }
  | { campo: keyof ConfigForm; tipo: 'number'; label: string; placeholder?: string; required?: boolean; min?: number; max?: number; hint?: string; step?: number }
  | { campo: keyof ConfigForm; tipo: 'checkbox'; label: string; hint?: string }

function Field({ q, val, onChange }: { q: Pregunta; val: any; onChange: (v: any) => void }) {
  const id = `field-${String(q.campo)}`
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-200 cursor-pointer">
          {q.label} {'required' in q && q.required ? <span className="text-rose-400">*</span> : null}
        </label>
        {'hint' in q && q.hint ? <Hint text={q.hint!} /> : null}
      </div>

      {q.tipo === 'textarea' ? (
        <textarea
          id={id}
          rows={5}
          value={String(val ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'placeholder' in q ? q.placeholder : undefined}
          className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-500/40 text-sm"
          aria-required={'required' in q && q.required ? true : undefined}
        />
      ) : q.tipo === 'number' ? (
        <input
          id={id}
          type="number"
          value={
            val === '' || typeof val === 'string'
              ? String(val ?? '')
              : Number.isFinite(val)
              ? String(val)
              : ''
          }
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') return onChange('') // permite limpiar
            const n = Number(raw)
            onChange(Number.isFinite(n) ? n : '')
          }}
          min={'min' in q && q.min !== undefined ? q.min : undefined}
          max={'max' in q && q.max !== undefined ? q.max : undefined}
          step={'step' in q && q.step !== undefined ? q.step : undefined}
          placeholder={'placeholder' in q ? q.placeholder : undefined}
          className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-500/40 text-sm"
          aria-required={'required' in q && q.required ? true : undefined}
        />
      ) : q.tipo === 'checkbox' ? (
        <div className="flex items-center gap-3">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(val)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/40"
          />
          <span className="text-xs text-slate-400">Activar / Desactivar</span>
        </div>
      ) : (
        <input
          id={id}
          type="text"
          value={String(val ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'placeholder' in q ? q.placeholder : undefined}
          className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-500/40 text-sm"
          aria-required={'required' in q && q.required ? true : undefined}
        />
      )}
    </div>
  )
}

function BusinessFormBase({ value, businessType, onChange }: Props) {
  // Base
  const preguntasServicios: Pregunta[] = [
    { campo: 'nombre', tipo: 'text', label: 'Nombre del negocio', placeholder: 'Ej: Clínica Dental Sonrisa Sana', required: true, hint: 'Nombre comercial como lo verán tus clientes.' },
    { campo: 'descripcion', tipo: 'textarea', label: 'Descripción breve (1–3 líneas)', placeholder: 'Ej: Centro odontológico especializado en estética y salud dental.', required: true, hint: 'Qué haces y para quién.' },
    { campo: 'servicios', tipo: 'textarea', label: 'Servicios (uno por línea)', placeholder: 'Ej:\n- Limpieza dental\n- Ortodoncia\n- Blanqueamiento', hint: 'Cada línea será una viñeta.' },
    { campo: 'faq', tipo: 'textarea', label: 'FAQs (P:… / R:…)', placeholder: 'Ej:\nP: ¿Fines de semana?\nR: Sí, 8–14h.\nP: ¿Pago?\nR: Efectivo y tarjeta.', hint: 'Reduce preguntas repetidas.' },
    { campo: 'horarios', tipo: 'textarea', label: 'Horario de atención', placeholder: 'Ej: Lun–Vie 8–18 / Sáb 8–14 / Dom cerrado', hint: 'Incluye festivos si aplica.' },
    { campo: 'disclaimers', tipo: 'textarea', label: 'Disclaimers / reglas para la IA', placeholder: 'Ej: No dar diagnósticos. Precios sujetos a confirmación.', hint: 'Reglas duras que la IA no debe romper.' },
  ]

  const preguntasProductos: Pregunta[] = [
    { campo: 'nombre', tipo: 'text', label: 'Nombre del negocio', placeholder: 'Ej: GlowUp Cosméticos', required: true, hint: 'Nombre comercial visible.' },
    { campo: 'descripcion', tipo: 'textarea', label: 'Descripción breve (1–3 líneas)', placeholder: 'Ej: Skincare natural con envíos nacionales.', required: true, hint: 'Elevator pitch.' },
    { campo: 'faq', tipo: 'textarea', label: 'FAQs (P:… / R:…)', placeholder: 'Ej:\nP: ¿Envíos?\nR: A todo el país.\nP: ¿Cambios?\nR: 30 días.', hint: 'Políticas clave.' },
    { campo: 'horarios', tipo: 'textarea', label: 'Horario de atención', placeholder: 'Ej: Lun–Vie 9–17', hint: 'Si es 24/7, acláralo.' },
    { campo: 'disclaimers', tipo: 'textarea', label: 'Disclaimers globales', placeholder: 'Ej: Precios pueden variar. No consejos médicos.', hint: 'Límites y políticas.' },
  ]

  // Operación (general)
  const preguntasOperacion: Pregunta[] = [
    { campo: 'enviosInfo', tipo: 'textarea', label: 'Envíos (texto libre)', placeholder: 'Ej: Envíos a todo el país 2–5 días hábiles.', hint: 'Cobertura, plazos y operador si aplica.' },
    { campo: 'metodosPago', tipo: 'textarea', label: 'Métodos de pago (texto libre)', placeholder: 'Ej: Tarjeta, transferencia, contraentrega.', hint: 'Aclarar pagos internacionales si aplica.' },
    { campo: 'tiendaFisica', tipo: 'checkbox', label: '¿Tienda física?', hint: 'Actívalo si tienes local.' },
    { campo: 'direccionTienda', tipo: 'text', label: 'Dirección tienda (opcional)', placeholder: 'Calle 123 #45-67, Bogotá', hint: 'Se usa si activaste tienda física.' },
    { campo: 'politicasDevolucion', tipo: 'textarea', label: 'Política de devoluciones', placeholder: 'Ej: Cambios y devoluciones en 30 días…' },
    { campo: 'politicasGarantia', tipo: 'textarea', label: 'Política de garantía', placeholder: 'Ej: Garantía 6 meses contra defectos de fábrica…' },
    { campo: 'promocionesInfo', tipo: 'textarea', label: 'Promociones/Descuentos', placeholder: 'Ej: 10% OFF primera compra, envíos gratis > $150k…' },
    { campo: 'canalesAtencion', tipo: 'textarea', label: 'Canales de atención', placeholder: 'Ej: WhatsApp, correo soporte@…, Lun–Vie 9–18.' },
    { campo: 'extras', tipo: 'textarea', label: 'Extras', placeholder: 'Cualquier detalle adicional que quieras que la IA conozca.' },
    { campo: 'palabrasClaveNegocio', tipo: 'text', label: 'Palabras clave del negocio', placeholder: 'Ej: serum, vitamina C, skincare, cruelty-free', hint: 'Mejora el “topic locking”. Coma-separadas.' },
  ]

  // Envíos (estructurado)
  const preguntasEnvio: Pregunta[] = [
    { campo: 'envioTipo', tipo: 'text', label: 'Tipo de envío', placeholder: 'Ej: Servientrega / Propio / Motomensajería', hint: 'Operador o método principal.' },
    { campo: 'envioEntregaEstimado', tipo: 'text', label: 'Entrega estimada', placeholder: 'Ej: 2–5 días hábiles' },
    { campo: 'envioCostoFijo', tipo: 'number', label: 'Costo fijo de envío (COP)', placeholder: 'Ej: 12000', step: 1, hint: 'Deja vacío para 0.' },
    { campo: 'envioGratisDesde', tipo: 'number', label: 'Envío gratis desde (COP)', placeholder: 'Ej: 150000', step: 1, hint: 'Deja vacío si no aplica.' },
  ]

  // Pagos (link + transferencia + QR)
  const preguntasPago: Pregunta[] = [
    { campo: 'pagoLinkGenerico', tipo: 'text', label: 'Enlace de pago (opcional)', placeholder: 'Ej: https://tucheckout.com/mi-tienda' },
    { campo: 'pagoLinkProductoBase', tipo: 'text', label: 'Enlace base por producto (opcional)', placeholder: 'Ej: https://tucheckout.com/p/' , hint: 'La IA puede construir con nombre/SKU si lo programamos luego.' },
    { campo: 'pagoNotas', tipo: 'textarea', label: 'Instrucciones de pago (texto libre)', placeholder: 'Ej: Adjunta comprobante y referencia del pedido.' },

    { campo: 'bancoNombre', tipo: 'text', label: 'Banco', placeholder: 'Ej: Bancolombia' },
    { campo: 'bancoTitular', tipo: 'text', label: 'Titular de la cuenta', placeholder: 'Ej: GLW SAS' },
    { campo: 'bancoTipoCuenta', tipo: 'text', label: 'Tipo de cuenta', placeholder: 'Ej: Ahorros / Corriente' },
    { campo: 'bancoNumeroCuenta', tipo: 'text', label: 'Número de cuenta', placeholder: 'Ej: 01234567890' },
    { campo: 'bancoDocumento', tipo: 'text', label: 'Documento/NIT', placeholder: 'Ej: 900.123.456-7' },
    { campo: 'transferenciaQRUrl', tipo: 'text', label: 'URL QR de transferencia (opcional)', placeholder: 'https://...' },
  ]

  // Post-venta
  const preguntasPostVenta: Pregunta[] = [
    { campo: 'facturaElectronicaInfo', tipo: 'text', label: 'Factura electrónica', placeholder: 'Ej: Envío de factura por email en 48h.' },
    { campo: 'soporteDevolucionesInfo', tipo: 'text', label: 'Soporte para devoluciones', placeholder: 'Ej: Escribe a soporte@midominio.com' },
  ]

  const preguntas = useMemo<Pregunta[]>(
    () => [...(businessType === 'productos' ? preguntasProductos : preguntasServicios)],
    [businessType]
  )

  const handlePatch = useCallback(
    (campo: keyof ConfigForm, v: any) => {
      if (campo === 'escalarSiNoConfia' || campo === 'tiendaFisica') {
        onChange({ [campo]: Boolean(v) } as Partial<ConfigForm>)
        return
      }
      if (campo === 'escalarPorReintentos') {
        const n = typeof v === 'number' ? v : Number(v)
        onChange({ [campo]: Number.isFinite(n) ? n : 0 } as Partial<ConfigForm>)
        return
      }
      // Decimales opcionales: si viene '' lo mantenemos como ''
      if (campo === 'envioCostoFijo' || campo === 'envioGratisDesde') {
        onChange({ [campo]: v === '' ? '' : Number(v) } as Partial<ConfigForm>)
        return
      }
      onChange({ [campo]: v } as Partial<ConfigForm>)
    },
    [onChange]
  )

  return (
    <div className="space-y-6">
      <Section title="Datos del negocio" subtitle="Esta información alimenta al asistente y define su contexto.">
        {preguntas.map((q) => (
          <Field key={q.campo as string} q={q} val={(value as any)[q.campo]} onChange={(v) => handlePatch(q.campo, v)} />
        ))}
      </Section>

      <Section title="Operación (texto libre)" subtitle="Políticas y logística que la IA puede usar en respuestas.">
        {preguntasOperacion.map((q) => (
          <Field key={q.campo as string} q={q} val={(value as any)[q.campo]} onChange={(v) => handlePatch(q.campo, v)} />
        ))}
      </Section>

      <Section title="Envíos (estructurado)" subtitle="Campos que habilitan cálculo simple de envío y respuestas más precisas.">
        {preguntasEnvio.map((q) => (
          <Field key={q.campo as string} q={q} val={(value as any)[q.campo]} onChange={(v) => handlePatch(q.campo, v)} />
        ))}
      </Section>

      <Section title="Pagos" subtitle="Link de pago (opcional), datos bancarios y QR para transferencias.">
        {preguntasPago.map((q) => (
          <Field key={q.campo as string} q={q} val={(value as any)[q.campo]} onChange={(v) => handlePatch(q.campo, v)} />
        ))}
      </Section>

      <Section title="Post-venta" subtitle="Lo que el cliente necesita después de comprar.">
        {preguntasPostVenta.map((q) => (
          <Field key={q.campo as string} q={q} val={(value as any)[q.campo]} onChange={(v) => handlePatch(q.campo, v)} />
        ))}
      </Section>

      <Section title="Reglas de escalamiento" subtitle="Cuándo el asistente pasa la conversación a un agente humano.">
        {[
          { campo: 'escalarSiNoConfia', tipo: 'checkbox', label: 'Escalar si la IA tiene baja confianza', hint: 'Se pasa a un agente cuando la IA no esté segura.' } as Pregunta,
          { campo: 'escalarPalabrasClave', tipo: 'textarea', label: 'Palabras clave para escalar (coma-separadas)', placeholder: 'Ej: humano, queja, reclamo, devolución, garantía, supervisor', hint: 'Si el cliente menciona alguna, se escala.' } as Pregunta,
          { campo: 'escalarPorReintentos', tipo: 'number', label: 'Escalar después de X reintentos fallidos', placeholder: 'Ej: 3', min: 0, hint: '0 desactiva. Recomendado: 2–3.' } as Pregunta,
        ].map((q) => (
          <Field key={q.campo as string} q={q} val={(value as any)[q.campo]} onChange={(v) => handlePatch(q.campo, v)} />
        ))}
        <div className="text-[11px] text-slate-400 pt-1">
          <p>
            <span className="font-medium text-slate-300">Sugerencia: </span>
            Deja <span className="text-slate-200">“Escalar si no confía”</span> activado para evitar alucinaciones. Usa palabras clave como <em>humano, queja, reclamo, devolución, garantía, supervisor</em>.
          </p>
        </div>
      </Section>
    </div>
  )
}

const BusinessForm = memo(BusinessFormBase)
export default BusinessForm
