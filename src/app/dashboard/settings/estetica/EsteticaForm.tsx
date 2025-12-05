// client/src/app/dashboard/settings/estetica/EsteticaForm.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useEsteticaConfig } from "./useEsteticaConfig";
import Swal from "sweetalert2";

/* ================= Tipos exportados (UI) ================= */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type AppointmentDay = {
  day: Weekday;
  isOpen: boolean;
  start1: string | null;
  end1: string | null;
  start2: string | null;
  end2: string | null;
};

/** Valor del formulario (UI) — versión depurada */
export type AppointmentConfigValue = {
  appointmentTimezone: string;

  // ✅ NUEVO: Agregado para habilitar la agenda por defecto
  appointmentEnabled?: boolean;
  allowSameDayBooking?: boolean;
  appointmentMinNoticeHours?: number | null;
  appointmentMaxAdvanceDays?: number | null;

  location?: {
    name?: string | null;
    address?: string | null;
    mapsUrl?: string | null;
    parkingInfo?: string | null;
    instructionsArrival?: string | null;
  };

  kb?: {
    businessOverview?: string | null;
    faqs?: Array<{ q: string; a: string }> | null;
    faqsText?: string | null; // compat
    freeText?: string | null;
  };

  hours?: AppointmentDay[];
};

type Props = {
  value: AppointmentConfigValue;
  onChange: (patch: Partial<AppointmentConfigValue>) => void;
};

/* ================= Helpers ================= */
const ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABEL: Record<Weekday, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const isHHMM = (s?: string | null) => !!(s && HHMM.test(s));

export function normalizeHours(rows?: AppointmentDay[] | null): AppointmentDay[] {
  const base = new Map<Weekday, AppointmentDay>();
  for (const d of ORDER) {
    base.set(d, { day: d, isOpen: false, start1: null, end1: null, start2: null, end2: null });
  }
  if (Array.isArray(rows)) {
    for (const r of rows) {
      if (!ORDER.includes(r.day)) continue;
      base.set(r.day, {
        day: r.day,
        isOpen: !!r.isOpen,
        start1: r.start1 ?? null,
        end1: r.end1 ?? null,
        start2: r.start2 ?? null,
        end2: r.end2 ?? null,
      });
    }
  }
  return ORDER.map((d) => base.get(d)!);
}

/* =============== UI básicos =============== */
function Section({
  title,
  subtitle,
  children,
}: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)]">
      <div className="px-6 py-5 border-b border-white/10">
        <h2 className="text-[13px] font-semibold tracking-wider text-slate-200 uppercase">{title}</h2>
        {subtitle && <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  help,
  children,
}: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-end justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {help && <span className="text-[11px] text-slate-400">{help}</span>}
      </div>
      {children}
    </label>
  );
}

const baseControl =
  "w-full rounded-xl bg-slate-950/70 border border-white/10 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-400/40 transition";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseControl} ${props.className || ""}`} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${baseControl} ${props.className || ""}`} />;
}

function Toggle({ checked, onClick, sr }: { checked: boolean; onClick: () => void; sr?: string }) {
  return (
    <button
      type="button"
      aria-label={sr || "toggle"}
      aria-pressed={checked}
      onClick={onClick}
      className={[
        "relative inline-flex h-8 w-[68px] items-center rounded-full border transition-all",
        checked
          ? "bg-emerald-500/90 border-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,.18)]"
          : "bg-slate-700/80 border-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-7 w-7 rounded-full bg-white shadow-md transform transition",
          checked ? "translate-x-[38px]" : "translate-x-[3px]",
        ].join(" ")}
      />
    </button>
  );
}

/* =============== Editor visual de FAQs =============== */
function FAQEditor({
  items,
  onChange,
}: {
  items: Array<{ q: string; a: string }> | null | undefined;
  onChange: (next: Array<{ q: string; a: string }>) => void;
}) {
  const faqs = Array.isArray(items) ? items : [];

  function addFAQ() {
    onChange([...faqs, { q: "", a: "" }]);
  }
  function updateFAQ(idx: number, patch: Partial<{ q: string; a: string }>) {
    const next = faqs.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  }
  function removeFAQ(idx: number) {
    const next = faqs.filter((_, i) => i !== idx);
    onChange(next);
  }
  function move(idx: number, dir: -1 | 1) {
    const next = [...faqs];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {faqs.length === 0 && (
        <div className="text-[12px] text-slate-400">
          Aún no has agregado FAQs. Usa el botón <b>+ Agregar FAQ</b>.
        </div>
      )}

      {faqs.map((it, idx) => (
        <div key={idx} className="rounded-xl border border-white/10 bg-white/[.03] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[12px] text-slate-400">FAQ #{idx + 1}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                className="px-2 py-1 rounded-lg text-[12px] border border-white/10 hover:bg-white/[.06]"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                className="px-2 py-1 rounded-lg text-[12px] border border-white/10 hover:bg-white/[.06]"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeFAQ(idx)}
                className="px-2 py-1 rounded-lg text-[12px] border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
              >
                Eliminar
              </button>
            </div>
          </div>

          <Field label="Pregunta">
            <Input
              type="text"
              placeholder="Ej: ¿Atienden menores de edad?"
              value={it.q}
              onChange={(e) => updateFAQ(idx, { q: e.target.value })}
            />
          </Field>

          <div className="mt-2">
            <Field label="Respuesta">
              <Textarea
                rows={3}
                placeholder="Escribe una respuesta clara, breve y precisa."
                value={it.a}
                onChange={(e) => updateFAQ(idx, { a: e.target.value })}
              />
            </Field>
          </div>
        </div>
      ))}

      <div>
        <button
          type="button"
          onClick={addFAQ}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/30"
        >
          <span className="text-lg leading-none">＋</span>
          Agregar FAQ
        </button>
      </div>
    </div>
  );
}

/* =================== FORM UI =================== */
export function EsteticaForm({ value, onChange }: Props) {
  const hours = useMemo(() => normalizeHours(value.hours), [value.hours]);

  function patch<K extends keyof AppointmentConfigValue>(key: K, v: AppointmentConfigValue[K]) {
    onChange({ [key]: v } as Partial<AppointmentConfigValue>);
  }
  function patchNested<T extends object>(key: keyof AppointmentConfigValue, partial: Partial<T>) {
    const current = ((value as any)[key] ?? {}) as T;
    onChange({ [key]: { ...(current as any), ...partial } } as any);
  }
  function patchDay(day: Weekday, partial: Partial<AppointmentDay>) {
    const next = hours.map((h) => (h.day === day ? { ...h, ...partial } : h));
    onChange({ hours: next });
  }

  function toggleDay(d: Weekday) {
    const current = hours.find((h) => h.day === d)!;
    const nextOpen = !current.isOpen;
    patchDay(d, {
      isOpen: nextOpen,
      start1: nextOpen ? current.start1 ?? "09:00" : null,
      end1: nextOpen ? current.end1 ?? "13:00" : null,
      start2: nextOpen ? current.start2 : null,
      end2: nextOpen ? current.end2 : null,
    });
  }

  function updateTime(d: Weekday, field: keyof AppointmentDay, val: string) {
    const safe = val || "";
    if (safe && !isHHMM(safe)) return;
    patchDay(d, { [field]: safe ? safe : null } as any);
  }

  // Normaliza FAQs desde faqsText (compat)
  useEffect(() => {
    const kb = value.kb ?? {};
    if ((!kb.faqs || kb.faqs.length === 0) && kb.faqsText) {
      try {
        const parsed = JSON.parse(kb.faqsText);
        if (Array.isArray(parsed)) patchNested("kb", { faqs: parsed as any });
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setFAQs(next: Array<{ q: string; a: string }>) {
    patchNested("kb", { faqs: next, faqsText: JSON.stringify(next ?? []) });
  }

  return (
    <div className="space-y-10">
      {/* ====== 1) Zona horaria ====== */}
      <Section title="Zona horaria del negocio (IANA)" subtitle="Ejemplo: America/Bogota">
        <Field label="Zona horaria">
          <Input
            type="text"
            placeholder="America/Bogota"
            value={value.appointmentTimezone}
            onChange={(e) => patch("appointmentTimezone", e.target.value)}
          />
        </Field>
      </Section>

      {/* ====== 2) Ubicación ====== */}
      <Section title="Ubicación y logística" subtitle="Se enviará junto a la confirmación.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Nombre del lugar (ej: Clínica Centro)"
            value={value.location?.name ?? ""}
            onChange={(e) => patchNested("location", { name: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Dirección (ej: Cra 10 # 20-30, Piso 2)"
            value={value.location?.address ?? ""}
            onChange={(e) => patchNested("location", { address: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Link de Google Maps"
            value={value.location?.mapsUrl ?? ""}
            onChange={(e) => patchNested("location", { mapsUrl: e.target.value })}
            className="md:col-span-2"
          />
          <Textarea
            rows={3}
            placeholder="¿Hay parqueadero? ¿Documento en recepción? ¿Cómo llegar?"
            value={value.location?.parkingInfo ?? ""}
            onChange={(e) => patchNested("location", { parkingInfo: e.target.value })}
            className="md:col-span-2"
          />
          <Textarea
            rows={3}
            placeholder="Indicaciones de llegada para el cliente"
            value={value.location?.instructionsArrival ?? ""}
            onChange={(e) => patchNested("location", { instructionsArrival: e.target.value })}
            className="md:col-span-2"
          />
        </div>
      </Section>

      {/* ====== 3) Knowledge base ====== */}
      <Section title="Knowledge base" subtitle="La IA usa esta información para responder con tu tono.">
        <div className="grid grid-cols-1 gap-4">
          <Textarea
            rows={3}
            placeholder="Resumen del negocio (qué hacen, a quién atienden, tono…)."
            value={value.kb?.businessOverview ?? ""}
            onChange={(e) => patchNested("kb", { businessOverview: e.target.value })}
          />

          <div>
            <div className="mb-2 text-sm font-medium text-slate-200">FAQs</div>
            <FAQEditor items={value.kb?.faqs} onChange={setFAQs} />
            <div className="mt-2 text-[11px] text-slate-400">
              Se guardan como arreglo JSON interno compatible con el resumen y la BD.
            </div>
          </div>

          <Textarea
            rows={4}
            placeholder="Información libre adicional para la IA (excepciones, casos especiales, etc.)."
            value={value.kb?.freeText ?? ""}
            onChange={(e) => patchNested("kb", { freeText: e.target.value })}
          />
        </div>
      </Section>

      {/* ====== 4) Horario semanal (AppointmentHour) ====== */}
      <Section
        title="Horario semanal"
        subtitle="Define los tramos de atención. El bloque 1 es obligatorio; el bloque 2 es opcional."
      >
        <div className="divide-y divide-white/10">
          {hours.map((h) => (
            <div key={h.day} className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Día + toggle */}
              <div className="lg:col-span-3 flex items-center justify-between lg:justify-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-violet-500/15 border border-violet-400/20 grid place-items-center text-[12px] text-violet-300">
                    {DAY_LABEL[h.day].slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{DAY_LABEL[h.day]}</div>
                    <div className="text-[11px] text-slate-400">{h.isOpen ? "Abierto" : "Cerrado"}</div>
                  </div>
                </div>
                <Toggle checked={h.isOpen} onClick={() => toggleDay(h.day)} sr={`Alternar ${DAY_LABEL[h.day]}`} />
              </div>

              {/* Rangos */}
              <div className={`lg:col-span-9 grid grid-cols-2 md:grid-cols-8 gap-3 ${!h.isOpen ? "opacity-60" : ""}`}>
                {/* Bloque 1 */}
                <div className="col-span-2 md:col-span-2">
                  <Field label="Inicio" help="Bloque 1">
                    <Input
                      type="time"
                      value={h.start1 || ""}
                      disabled={!h.isOpen}
                      onChange={(e) => updateTime(h.day, "start1", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <Field label="Fin" help="Bloque 1">
                    <Input
                      type="time"
                      value={h.end1 || ""}
                      disabled={!h.isOpen}
                      onChange={(e) => updateTime(h.day, "end1", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Bloque 2 (opcional) */}
                <div className="col-span-2 md:col-span-2">
                  <Field label="Inicio" help="Bloque 2 (opcional)">
                    <Input
                      type="time"
                      value={h.start2 || ""}
                      disabled={!h.isOpen}
                      onChange={(e) => updateTime(h.day, "start2", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <Field label="Fin" help="Bloque 2 (opcional)">
                    <Input
                      type="time"
                      value={h.end2 || ""}
                      disabled={!h.isOpen}
                      onChange={(e) => updateTime(h.day, "end2", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="col-span-2 md:col-span-8 text-[12px] text-slate-400">
                  {h.isOpen ? "Bloque 1 obligatorio · Bloque 2 opcional" : "Cerrado"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* =================== Wrapper Smart =================== */
export default function EsteticaFormSmart({ empresaId }: { empresaId?: number }) {
  const { value, setValue, loading, saving, save, reload } = useEsteticaConfig(empresaId);

  // ✅ CORRECCIÓN FINAL: Usamos `prev: any` para evitar conflicto con el tipo del Hook
  useEffect(() => {
    if (loading) return;

    setValue((prev: any) => {
      // 1. Habilitar agenda si está apagada (undefined o false)
      const forceEnabled = !prev.appointmentEnabled;

      // 2. Permitir mismo día (si está false o undefined)
      const forceSameDay = !prev.allowSameDayBooking; 
      
      // 3. Quitar tiempo mínimo de aviso (si está null/undefined)
      const forceNotice = prev.appointmentMinNoticeHours == null;

      // 4. Arreglar bloqueo de fechas futuras (si es 0 o null)
      const forceAdvance = prev.appointmentMaxAdvanceDays === 0 || prev.appointmentMaxAdvanceDays == null;

      // Si todo está bien configurado, no hacemos nada para evitar loops
      if (!forceEnabled && !forceSameDay && !forceNotice && !forceAdvance) return prev;

      // Aplicamos TODAS las correcciones
      return {
        ...prev,
        appointmentEnabled: true,            // Habilitar agenda (1)
        allowSameDayBooking: true,           // Permitir hoy
        appointmentMinNoticeHours: 0,        // Sin espera mínima
        appointmentMaxAdvanceDays: 30,       // Ventana de 30 días
      };
    });
  }, [loading, setValue]);

  if (loading) {
    return (
      <div className="p-8 rounded-2xl border border-white/10 bg-slate-950/60 text-slate-300">
        Cargando…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Estética — Configuración</h1>
        <p className="text-[12px] text-slate-400">
          Ajusta zona horaria, ubicación, knowledge base y horario semanal.
        </p>
      </div>

      <EsteticaForm
        value={value}
        onChange={(patch) => setValue((prev) => ({ ...prev, ...patch }))}
      />

      <div className="sticky bottom-0 z-10 -mx-4 px-4 py-4 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            onClick={reload}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/[.04] hover:bg-white/[.07] text-sm transition"
          >
            Revertir
          </button>
          <button
            onClick={async () => {
              try {
                await save();
                await Swal.fire({
                  title: "¡Guardado!",
                  text: "Configuración y horarios guardados",
                  icon: "success",
                  confirmButtonText: "Listo",
                  background: "#0f172a",
                  color: "#e2e8f0",
                  iconColor: "#22c55e",
                  confirmButtonColor: "#7c3aed",
                  customClass: {
                    popup: "rounded-2xl border border-white/10",
                    title: "text-slate-100",
                    htmlContainer: "text-slate-300",
                    confirmButton: "rounded-xl",
                  },
                });
              } catch (e: any) {
                await Swal.fire({
                  title: "Error al guardar",
                  text: e?.message || "Ocurrió un problema guardando la configuración",
                  icon: "error",
                  confirmButtonText: "Entendido",
                  background: "#0f172a",
                  color: "#e2e8f0",
                  iconColor: "#ef4444",
                  confirmButtonColor: "#7c3aed",
                  customClass: {
                    popup: "rounded-2xl border border-white/10",
                    title: "text-slate-100",
                    htmlContainer: "text-slate-300",
                    confirmButton: "rounded-xl",
                  },
                });
              }
            }}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}