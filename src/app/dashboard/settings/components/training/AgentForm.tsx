'use client'

import { memo } from 'react'
import { HelpCircle } from 'lucide-react'
import type { ConfigForm, AiMode, AgentSpecialty } from './types'

type Props = {
  value: Pick<ConfigForm, 'aiMode' | 'agentSpecialty' | 'agentPrompt' | 'agentScope' | 'agentDisclaimers'>
  onChange: (patch: Partial<ConfigForm>) => void
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

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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

function Select<T extends string>({
  value, onChange, options, placeholder,
}: {
  value: T; onChange: (v: T) => void; options: Array<{label:string; value:T}>; placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring focus:ring-blue-500/40"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

const aiModeOpts: Array<{label: string; value: AiMode}> = [
  { label: 'Agente personalizado', value: 'agente' },
  { label: 'Ecommerce (productos)', value: 'ecommerce' },
]
const specialtyOpts: Array<{label: string; value: AgentSpecialty}> = [
  { label: 'Genérico', value: 'generico' },
  { label: 'Médico', value: 'medico' },
  { label: 'Dermatología', value: 'dermatologia' },
  { label: 'Nutrición', value: 'nutricion' },
  { label: 'Psicología', value: 'psicologia' },
  { label: 'Odontología', value: 'odontologia' },
]

function AgentFormBase({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Section title="Configuración del agente" subtitle="Define el modo y el perfil del agente.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-sm font-medium text-slate-200">Modo</label>
              <Hint text="Puedes dejarlo en 'agente' aunque tu negocio venda productos." />
            </div>
            <Select<AiMode>
              value={value.aiMode}
              onChange={(v) => onChange({ aiMode: v })}
              options={aiModeOpts}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-sm font-medium text-slate-200">Especialidad</label>
              <Hint text="Ajusta el tono y alcance de respuestas." />
            </div>
            <Select<AgentSpecialty>
              value={value.agentSpecialty}
              onChange={(v) => onChange({ agentSpecialty: v })}
              options={specialtyOpts}
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-sm font-medium text-slate-200">Instrucciones (prompt)</label>
              <Hint text="Tono, objetivos, estilo. Ej: sé empático, da pasos claros…" />
            </div>
            <textarea
              rows={4}
              value={value.agentPrompt ?? ''}
              onChange={(e) => onChange({ agentPrompt: e.target.value })}
              placeholder="Ej: Saluda por el nombre, sé breve (2–5 líneas), ofrece opciones claras…"
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring focus:ring-blue-500/40"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-sm font-medium text-slate-200">Ámbito (scope)</label>
              <Hint text="Qué sí atiende y qué no." />
            </div>
            <textarea
              rows={3}
              value={value.agentScope ?? ''}
              onChange={(e) => onChange({ agentScope: e.target.value })}
              placeholder="Ej: Orientación general; NO diagnósticos, NO prescripción, NO urgencias."
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring focus:ring-blue-500/40"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-sm font-medium text-slate-200">Disclaimers</label>
              <Hint text="Mensajes de responsabilidad que el asistente puede incluir." />
            </div>
            <textarea
              rows={3}
              value={value.agentDisclaimers ?? ''}
              onChange={(e) => onChange({ agentDisclaimers: e.target.value })}
              placeholder="Ej: Esta información no reemplaza una consulta profesional…"
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring focus:ring-blue-500/40"
            />
          </div>
        </div>
      </Section>
    </div>
  )
}

const AgentForm = memo(AgentFormBase)
export default AgentForm
