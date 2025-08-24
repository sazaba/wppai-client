'use client'

import { memo, useMemo } from 'react'
import { HelpCircle } from 'lucide-react'

export type BusinessType = 'servicios' | 'productos'

export interface ConfigForm {
  nombre: string
  descripcion: string
  servicios: string
  faq: string
  horarios: string
  disclaimers: string
  businessType: BusinessType
}

type Props = {
  value: ConfigForm
  businessType: BusinessType
  onChange: (patch: Partial<ConfigForm>) => void
}

type Pregunta = {
  campo: keyof ConfigForm
  tipo: 'input' | 'textarea'
  label: string
  placeholder?: string
  required?: boolean
  hint?: string
}

/** Tooltip/Hint minimal */
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

function Field({
  q,
  val,
  onChange,
}: {
  q: Pregunta
  val: string
  onChange: (v: string) => void
}) {
  const id = `field-${q.campo}`
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-200">
          {q.label} {q.required ? <span className="text-rose-400">*</span> : null}
        </label>
        {q.hint ? <Hint text={q.hint} /> : null}
      </div>

      {q.tipo === 'textarea' ? (
        <textarea
          id={id}
          rows={5}
          value={val}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder}
          className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-500/40 text-sm"
          aria-required={q.required || undefined}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={val}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder}
          className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-500/40 text-sm"
          aria-required={q.required || undefined}
        />
      )}
    </div>
  )
}

function BusinessFormBase({ value, businessType, onChange }: Props) {
  const preguntasServicios: Pregunta[] = [
    { campo: 'nombre', tipo: 'input', label: 'Nombre del negocio', placeholder: 'Ej: Clínica Dental Sonrisa Sana', required: true, hint: 'Nombre comercial como lo verán tus clientes.' },
    { campo: 'descripcion', tipo: 'textarea', label: 'Descripción breve (1–3 líneas)', placeholder: 'Ej: Centro odontológico especializado en estética y salud dental.', required: true, hint: 'Qué haces y para quién.' },
    { campo: 'servicios', tipo: 'textarea', label: 'Servicios (uno por línea)', placeholder: 'Ej:\n- Limpieza dental\n- Ortodoncia\n- Blanqueamiento', hint: 'Cada línea será una viñeta.' },
    { campo: 'faq', tipo: 'textarea', label: 'FAQs (P:… / R:…)', placeholder: 'Ej:\nP: ¿Fines de semana?\nR: Sí, 8–14h.\nP: ¿Pago?\nR: Efectivo y tarjeta.', hint: 'Reduce preguntas repetidas.' },
    { campo: 'horarios', tipo: 'textarea', label: 'Horario de atención', placeholder: 'Ej: Lun–Vie 8–18 / Sáb 8–14 / Dom cerrado', hint: 'Incluye festivos si aplica.' },
    { campo: 'disclaimers', tipo: 'textarea', label: 'Disclaimers / reglas para la IA', placeholder: 'Ej: No dar diagnósticos. Precios sujetos a confirmación.', hint: 'Reglas duras que la IA no debe romper.' },
  ]

  const preguntasProductos: Pregunta[] = [
    { campo: 'nombre', tipo: 'input', label: 'Nombre del negocio', placeholder: 'Ej: Tienda Leavid', required: true, hint: 'Nombre comercial visible.' },
    { campo: 'descripcion', tipo: 'textarea', label: 'Descripción breve (1–3 líneas)', placeholder: 'Ej: Skincare natural con envíos nacionales.', required: true, hint: 'Elevator pitch.' },
    { campo: 'faq', tipo: 'textarea', label: 'FAQs (P:… / R:…)', placeholder: 'Ej:\nP: ¿Envíos?\nR: A todo el país.\nP: ¿Cambios?\nR: 30 días.', hint: 'Políticas clave.' },
    { campo: 'horarios', tipo: 'textarea', label: 'Horario de atención', placeholder: 'Ej: Lun–Vie 9–17', hint: 'Si es 24/7, acláralo.' },
    { campo: 'disclaimers', tipo: 'textarea', label: 'Disclaimers globales', placeholder: 'Ej: Precios pueden variar. No consejos médicos.', hint: 'Límites y políticas.' },
  ]

  const preguntas = useMemo<Pregunta[]>(
    () => (businessType === 'productos' ? preguntasProductos : preguntasServicios),
    [businessType]
  )

  return (
    <div className="space-y-4">
      {preguntas.map((q) => (
        <Field
          key={q.campo}
          q={q}
          val={String(value[q.campo] ?? '')}
          onChange={(v) => onChange({ [q.campo]: v } as Partial<ConfigForm>)}
        />
      ))}
    </div>
  )
}

const BusinessForm = memo(BusinessFormBase)
export default BusinessForm
