'use client'

import { memo, useMemo, useCallback } from 'react'
import { HelpCircle } from 'lucide-react'

export type BusinessType = 'servicios' | 'productos'

export interface ConfigForm {
  // Datos base
  nombre: string
  descripcion: string
  servicios: string
  faq: string
  horarios: string
  disclaimers: string
  businessType: BusinessType

  // 🔽 Reglas de escalamiento
  escalarSiNoConfia: boolean
  escalarPalabrasClave: string      // coma-separado
  escalarPorReintentos: number      // 0 = desactivado
}

type Props = {
  value: ConfigForm
  businessType: BusinessType
  onChange: (patch: Partial<ConfigForm>) => void
}

/* ===================== UI Helpers ===================== */

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
        {subtitle ? (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

/** Tooltip/Hint minimal */
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

/* ===================== Campos ===================== */

type InputKind = 'text' | 'textarea' | 'number' | 'checkbox'

type Pregunta =
  | {
      campo: keyof ConfigForm
      tipo: Extract<InputKind, 'text' | 'textarea'>
      label: string
      placeholder?: string
      required?: boolean
      hint?: string
    }
  | {
      campo: keyof ConfigForm
      tipo: Extract<InputKind, 'number'>
      label: string
      placeholder?: string
      required?: boolean
      min?: number
      max?: number
      hint?: string
    }
  | {
      campo: keyof ConfigForm
      tipo: Extract<InputKind, 'checkbox'>
      label: string
      hint?: string
    }

function Field({
  q,
  val,
  onChange,
}: {
  q: Pregunta
  val: any
  onChange: (v: any) => void
}) {
  const id = `field-${String(q.campo)}`
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-200 cursor-pointer"
        >
          {q.label} {'required' in q && q.required ? <span className="text-rose-400">*</span> : null}
        </label>
        {'hint' in q && q.hint ? <Hint text={q.hint!} /> : null}
      </div>

      {/* Inputs */}
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
          value={Number.isFinite(val) ? String(val) : String(val ?? '')}
          onChange={(e) => {
            const n = e.target.value === '' ? '' : Number(e.target.value)
            onChange(Number.isFinite(n as number) ? Number(n) : 0)
          }}
          min={'min' in q && q.min !== undefined ? q.min : undefined}
          max={'max' in q && q.max !== undefined ? q.max : undefined}
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
        // text
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

/* ===================== Formulario ===================== */

function BusinessFormBase({ value, businessType, onChange }: Props) {
  // Preguntas base por tipo de negocio
  const preguntasServicios: Pregunta[] = [
    {
      campo: 'nombre',
      tipo: 'text',
      label: 'Nombre del negocio',
      placeholder: 'Ej: Clínica Dental Sonrisa Sana',
      required: true,
      hint: 'Nombre comercial como lo verán tus clientes.',
    },
    {
      campo: 'descripcion',
      tipo: 'textarea',
      label: 'Descripción breve (1–3 líneas)',
      placeholder: 'Ej: Centro odontológico especializado en estética y salud dental.',
      required: true,
      hint: 'Qué haces y para quién.',
    },
    {
      campo: 'servicios',
      tipo: 'textarea',
      label: 'Servicios (uno por línea)',
      placeholder: 'Ej:\n- Limpieza dental\n- Ortodoncia\n- Blanqueamiento',
      hint: 'Cada línea será una viñeta.',
    },
    {
      campo: 'faq',
      tipo: 'textarea',
      label: 'FAQs (P:… / R:…)',
      placeholder:
        'Ej:\nP: ¿Fines de semana?\nR: Sí, 8–14h.\nP: ¿Pago?\nR: Efectivo y tarjeta.',
      hint: 'Reduce preguntas repetidas.',
    },
    {
      campo: 'horarios',
      tipo: 'textarea',
      label: 'Horario de atención',
      placeholder: 'Ej: Lun–Vie 8–18 / Sáb 8–14 / Dom cerrado',
      hint: 'Incluye festivos si aplica.',
    },
    {
      campo: 'disclaimers',
      tipo: 'textarea',
      label: 'Disclaimers / reglas para la IA',
      placeholder: 'Ej: No dar diagnósticos. Precios sujetos a confirmación.',
      hint: 'Reglas duras que la IA no debe romper.',
    },
  ]

  const preguntasProductos: Pregunta[] = [
    {
      campo: 'nombre',
      tipo: 'text',
      label: 'Nombre del negocio',
      placeholder: 'Ej: Tienda Leavid',
      required: true,
      hint: 'Nombre comercial visible.',
    },
    {
      campo: 'descripcion',
      tipo: 'textarea',
      label: 'Descripción breve (1–3 líneas)',
      placeholder: 'Ej: Skincare natural con envíos nacionales.',
      required: true,
      hint: 'Elevator pitch.',
    },
    {
      campo: 'faq',
      tipo: 'textarea',
      label: 'FAQs (P:… / R:…)',
      placeholder: 'Ej:\nP: ¿Envíos?\nR: A todo el país.\nP: ¿Cambios?\nR: 30 días.',
      hint: 'Políticas clave.',
    },
    {
      campo: 'horarios',
      tipo: 'textarea',
      label: 'Horario de atención',
      placeholder: 'Ej: Lun–Vie 9–17',
      hint: 'Si es 24/7, acláralo.',
    },
    {
      campo: 'disclaimers',
      tipo: 'textarea',
      label: 'Disclaimers globales',
      placeholder: 'Ej: Precios pueden variar. No consejos médicos.',
      hint: 'Límites y políticas.',
    },
  ]

  // Preguntas de escalamiento (aplican para ambos tipos)
  const preguntasEscalamiento: Pregunta[] = [
    {
      campo: 'escalarSiNoConfia',
      tipo: 'checkbox',
      label: 'Escalar si la IA tiene baja confianza',
      hint: 'Si está activo, cuando la IA no esté segura, se pasa a agente humano automáticamente.',
    },
    {
      campo: 'escalarPalabrasClave',
      tipo: 'textarea',
      label: 'Palabras clave para escalar (coma-separadas)',
      placeholder: 'Ej: humano, queja, reclamo, devolución, garantía, supervisor',
      hint: 'Si el cliente menciona alguna, se escala a un agente.',
    },
    {
      campo: 'escalarPorReintentos',
      tipo: 'number',
      label: 'Escalar después de X reintentos fallidos',
      placeholder: 'Ej: 3',
      min: 0,
      hint: '0 desactiva esta regla. Recomendado: 2–3.',
    },
  ]

  const preguntas = useMemo<Pregunta[]>(
    () => [
      ...(businessType === 'productos' ? preguntasProductos : preguntasServicios),
    ],
    [businessType]
  )

  // Handlers tipados
  const handlePatch = useCallback(
    (campo: keyof ConfigForm, v: any) => {
      // Normaliza tipos de los campos nuevos
      if (campo === 'escalarSiNoConfia') {
        onChange({ [campo]: Boolean(v) } as Partial<ConfigForm>)
        return
      }
      if (campo === 'escalarPorReintentos') {
        const n = typeof v === 'number' ? v : Number(v)
        onChange({ [campo]: Number.isFinite(n) ? n : 0 } as Partial<ConfigForm>)
        return
      }
      onChange({ [campo]: v } as Partial<ConfigForm>)
    },
    [onChange]
  )

  return (
    <div className="space-y-6">
      <Section
        title="Datos del negocio"
        subtitle="Esta información alimenta al asistente y define su contexto."
      >
        {preguntas.map((q) => (
          <Field
            key={q.campo as string}
            q={q}
            val={value[q.campo] as any}
            onChange={(v) => handlePatch(q.campo, v)}
          />
        ))}
      </Section>

      <Section
        title="Reglas de escalamiento"
        subtitle="Controla cuándo el asistente debe pasar la conversación a un agente humano."
      >
        {preguntasEscalamiento.map((q) => (
          <Field
            key={q.campo as string}
            q={q}
            val={value[q.campo] as any}
            onChange={(v) => handlePatch(q.campo, v)}
          />
        ))}
        {/* Sugerencias rápidas */}
        <div className="text-[11px] text-slate-400 pt-1">
          <p>
            <span className="font-medium text-slate-300">Sugerencia: </span>
            Deja <span className="text-slate-200">“Escalar si no confía”</span> activado para evitar
            alucinaciones o respuestas ambiguas. Usa palabras clave como{' '}
            <em>humano, queja, reclamo, devolución, garantía, supervisor</em>.
          </p>
        </div>
      </Section>
    </div>
  )
}

const BusinessForm = memo(BusinessFormBase)
export default BusinessForm
