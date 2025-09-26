// client/src/app/dashboard/settings/estetica/EsteticaForm.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useEsteticaConfig } from "./useEsteticaConfig";

/* ================= Tipos exportados (UI) ================= */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type ApptVertical = "odontologica" | "estetica" | "spa" | "custom";

export type AppointmentDay = {
  day: Weekday;
  isOpen: boolean;
  start1: string | null;
  end1: string | null;
  start2: string | null;
  end2: string | null;
};

/** Valor del formulario (UI) */
export type AppointmentConfigValue = {
  appointmentEnabled: boolean;
  appointmentVertical: ApptVertical;
  appointmentVerticalCustom?: string | null;
  appointmentTimezone: string;
  appointmentBufferMin: number;
  appointmentPolicies?: string;
  appointmentReminders: boolean;

  // Servicios se gestionan en la pestaña “Servicios”

  location?: {
    name?: string | null;
    address?: string | null;
    mapsUrl?: string | null;
    parkingInfo?: string | null;
    virtualLink?: string | null;
    instructionsArrival?: string | null;
  };

  rules?: {
    bookingWindowDays?: number | null;
    maxDailyAppointments?: number | null;
    cancellationWindowHours?: number | null;
    noShowPolicy?: string | null;
    depositRequired?: boolean | null;
    depositAmount?: number | null;
    blackoutDates?: string[] | null;
    overlapStrategy?: string | null;
  };

  reminders?: {
    schedule?: Array<{ offsetHours: number; channel: string }> | null;
    templateId?: string | null;
    postBookingMessage?: string | null;
  };

  kb?: {
    businessOverview?: string | null;
    faqsText?: string | null;
    freeText?: string | null;
  };

  hours?: AppointmentDay[];
};

type Props = {
  value: AppointmentConfigValue;
  onChange: (patch: Partial<AppointmentConfigValue>) => void;
};

/* ================= Helpers locales del Form ================= */
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

function clampBuffer(n: number) {
  if (!Number.isFinite(n)) return 10;
  if (n < 0) return 0;
  if (n > 240) return 240;
  return Math.round(n);
}

/* =============== Pequeños helpers de UI (solo estilos) =============== */
function Section({
  title,
  subtitle,
  children,
}: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-sm">
      <div className="px-5 py-4 border-b border-slate-800/70">
        <div className="text-sm font-semibold tracking-wide">{title}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
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
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-sm font-medium">{label}</div>
        {help && <div className="text-[11px] text-slate-400">{help}</div>}
      </div>
      {children}
    </label>
  );
}

function InputBase(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2",
        "text-sm outline-none focus:ring-2 focus:ring-violet-600/60 focus:border-violet-500/40",
        "placeholder:text-slate-500",
        props.className || "",
      ].join(" ")}
    />
  );
}
function TextareaBase(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2",
        "text-sm outline-none focus:ring-2 focus:ring-violet-600/60 focus:border-violet-500/40",
        "placeholder:text-slate-500",
        props.className || "",
      ].join(" ")}
    />
  );
}
function SelectBase(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2",
        "text-sm outline-none focus:ring-2 focus:ring-violet-600/60 focus:border-violet-500/40",
        props.className || "",
      ].join(" ")}
    />
  );
}

function Toggle({
  checked,
  onClick,
  label,
}: { checked: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className={[
        "relative inline-flex h-7 w-14 items-center rounded-full border transition",
        checked
          ? "bg-emerald-500/90 border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
          : "bg-slate-700 border-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-6 w-6 transform rounded-full bg-white transition",
          checked ? "translate-x-7" : "translate-x-1",
        ].join(" ")}
      />
      {label && <span className="ml-3 text-sm">{label}</span>}
    </button>
  );
}

/* =================== FORM UI (presentacional) =================== */
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

  // Inicializa reglas por defecto (solo UI)
  useEffect(() => {
    const r = value.rules ?? {};
    const toSet: Partial<NonNullable<typeof value.rules>> = {};
    let changed = false;

    if (r.bookingWindowDays == null) {
      toSet.bookingWindowDays = 30; // días hacia adelante
      changed = true;
    }
    if (r.cancellationWindowHours == null) {
      toSet.cancellationWindowHours = 12;
      changed = true;
    }
    if (r.maxDailyAppointments == null) {
      toSet.maxDailyAppointments = 0; // 0 = sin límite
      changed = true;
    }
    if (r.depositRequired == null) {
      toSet.depositRequired = false;
      changed = true;
    }

    if (changed) patchNested("rules", toSet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* ====== 1) Activar agenda (IA Estética) ====== */}
      <Section
        title="Activar agenda con IA (Estética)"
        subtitle="La IA responde a tus clientes, propone horarios disponibles y puede confirmar citas automáticamente."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-sm font-medium">Habilitar agenda automática</div>
              <div className="text-xs text-slate-400">Puedes desactivarla en cualquier momento.</div>
            </div>
            <Toggle
              checked={value.appointmentEnabled}
              onClick={() => patch("appointmentEnabled", !value.appointmentEnabled)}
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Field
              label="Tipo de negocio (vertical)"
              help="Usamos esto para ajustar el tono y las respuestas."
            >
              <SelectBase
                value={value.appointmentVertical}
                onChange={(e) => patch("appointmentVertical", e.target.value as ApptVertical)}
              >
                <option value="odontologica">Clínica Odontológica</option>
                <option value="estetica">Clínica Estética</option>
                <option value="spa">Spa</option>
                <option value="custom">Otra (especifica abajo)</option>
              </SelectBase>
            </Field>

            {value.appointmentVertical === "custom" && (
              <InputBase
                type="text"
                placeholder="Ej: Clínica Láser, Nutrición, Barbería…"
                value={value.appointmentVerticalCustom ?? ""}
                onChange={(e) => patch("appointmentVerticalCustom", e.target.value)}
                aria-label="Vertical personalizada"
                className="mt-2"
              />
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Field label="Zona horaria (IANA)" help="Ejemplo: America/Bogota">
              <InputBase
                type="text"
                placeholder="America/Bogota"
                value={value.appointmentTimezone}
                onChange={(e) => patch("appointmentTimezone", e.target.value)}
              />
            </Field>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Field label="Tiempo entre citas (minutos)" help="Tiempo de limpieza o preparación. 0–240.">
              <InputBase
                type="number"
                min={0}
                max={240}
                value={value.appointmentBufferMin}
                onChange={(e) => patch("appointmentBufferMin", clampBuffer(parseInt(e.target.value, 10)))}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* ====== 2) Políticas ====== */}
      <Section
        title="Políticas visibles para el cliente"
        subtitle="Se muestran en el proceso de reserva y la IA las usa para responder con claridad."
      >
        <TextareaBase
          rows={4}
          placeholder="Ej: Llega 10 min antes. Reprogramaciones con 12 h de antelación. El depósito se descuenta del valor del servicio."
          value={value.appointmentPolicies || ""}
          onChange={(e) => patch("appointmentPolicies", e.target.value)}
        />
      </Section>

      {/* ====== 3) Ubicación / logística ====== */}
      <Section
        title="Ubicación y logística"
        subtitle="Información práctica que se envía al cliente junto a su cita."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputBase
            type="text"
            placeholder="Nombre del lugar (ej: Clínica Centro)"
            value={value.location?.name ?? ""}
            onChange={(e) => patchNested("location", { name: e.target.value })}
          />
          <InputBase
            type="text"
            placeholder="Dirección (ej: Cra 10 # 20-30, Piso 2)"
            value={value.location?.address ?? ""}
            onChange={(e) => patchNested("location", { address: e.target.value })}
          />
          <InputBase
            type="text"
            placeholder="Link de Google Maps"
            value={value.location?.mapsUrl ?? ""}
            onChange={(e) => patchNested("location", { mapsUrl: e.target.value })}
          />
          <InputBase
            type="text"
            placeholder="Link de videollamada (si aplica)"
            value={value.location?.virtualLink ?? ""}
            onChange={(e) => patchNested("location", { virtualLink: e.target.value })}
          />
          <TextareaBase
            rows={3}
            placeholder="¿Hay parqueadero? ¿Documentos en recepción? ¿Cómo llegar?"
            value={value.location?.parkingInfo ?? ""}
            onChange={(e) => patchNested("location", { parkingInfo: e.target.value })}
            className="sm:col-span-2"
          />
          <TextareaBase
            rows={3}
            placeholder="Indicaciones de llegada para el cliente"
            value={value.location?.instructionsArrival ?? ""}
            onChange={(e) => patchNested("location", { instructionsArrival: e.target.value })}
            className="sm:col-span-2"
          />
        </div>
      </Section>

      {/* ====== 4) Reglas ====== */}
      <Section
        title="Reglas de agenda"
        subtitle="La IA y el sistema respetarán estos límites al ofrecer o confirmar citas."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Reservar hasta (días adelante)" help="¿Con cuánta anticipación aceptas reservas?">
            <InputBase
              type="number"
              min={0}
              value={value.rules?.bookingWindowDays ?? 30}
              onChange={(e) =>
                patchNested("rules", { bookingWindowDays: parseInt(e.target.value || "0", 10) })
              }
            />
          </Field>

          <Field label="Citas máximas por día" help="0 = Sin límite">
            <InputBase
              type="number"
              min={0}
              value={value.rules?.maxDailyAppointments ?? 0}
              onChange={(e) =>
                patchNested("rules", { maxDailyAppointments: parseInt(e.target.value || "0", 10) })
              }
            />
          </Field>

          <Field label="Ventana para cancelar (horas)" help="Tiempo mínimo antes de la cita para cancelar.">
            <InputBase
              type="number"
              min={0}
              value={value.rules?.cancellationWindowHours ?? 12}
              onChange={(e) =>
                patchNested("rules", {
                  cancellationWindowHours: parseInt(e.target.value || "0", 10),
                })
              }
            />
          </Field>

          <Field label="Política de inasistencia (No-show)">
            <TextareaBase
              rows={3}
              placeholder="Ej: Si no asistes sin avisar, se cobrará $X o se pierde el depósito."
              value={value.rules?.noShowPolicy ?? ""}
              onChange={(e) => patchNested("rules", { noShowPolicy: e.target.value })}
              className="sm:col-span-3"
            />
          </Field>

          <div className="sm:col-span-3 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                id="depositRequired"
                type="checkbox"
                checked={!!value.rules?.depositRequired}
                onChange={(e) => patchNested("rules", { depositRequired: e.target.checked })}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span className="text-sm">Requerir depósito</span>
            </label>

            <div className="min-w-[240px]">
              <Field label="Monto del depósito" help="En la moneda del negocio. Opcional.">
                <InputBase
                  type="number"
                  min={0}
                  step="0.01"
                  value={value.rules?.depositAmount ?? ""}
                  onChange={(e) =>
                    patchNested("rules", {
                      depositAmount: e.target.value === "" ? null : parseFloat(e.target.value),
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </div>
      </Section>

      {/* ====== 5) Mensajes ====== */}
      <Section
        title="Mensajes al cliente"
        subtitle="Plantillas para recordatorios y texto que se envía tras la confirmación."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputBase
            type="text"
            placeholder="ID de plantilla de recordatorio (WhatsApp)"
            value={value.reminders?.templateId ?? ""}
            onChange={(e) => patchNested("reminders", { templateId: e.target.value })}
          />
          <TextareaBase
            rows={3}
            placeholder="Mensaje posterior a la reserva (se envía tras confirmar)."
            value={value.reminders?.postBookingMessage ?? ""}
            onChange={(e) => patchNested("reminders", { postBookingMessage: e.target.value })}
          />
        </div>
      </Section>

      {/* ====== 6) Knowledge base ====== */}
      <Section
        title="Knowledge base del negocio"
        subtitle="Información que la IA utiliza para comunicarse y resolver dudas."
      >
        <div className="grid grid-cols-1 gap-4">
          <TextareaBase
            rows={3}
            placeholder="Resumen del negocio (qué hacen, a quién atienden, tono de comunicación...)"
            value={value.kb?.businessOverview ?? ""}
            onChange={(e) => patchNested("kb", { businessOverview: e.target.value })}
          />
          <TextareaBase
            rows={3}
            placeholder={`FAQs (opcional). Puedes pegar JSON: [{"q":"¿Atienden niños?","a":"Sí, desde 6 años"}]`}
            value={value.kb?.faqsText ?? ""}
            onChange={(e) => patchNested("kb", { faqsText: e.target.value })}
          />
          <TextareaBase
            rows={4}
            placeholder="Información libre adicional para la IA (casos especiales, excepciones, etc.)"
            value={value.kb?.freeText ?? ""}
            onChange={(e) => patchNested("kb", { freeText: e.target.value })}
          />
        </div>
      </Section>

      {/* ====== 7) Horario semanal ====== */}
      <Section
        title="Horario semanal"
        subtitle="Indica los tramos en los que atiendes. El primer bloque es obligatorio; el segundo es opcional."
      >
        <div className="divide-y divide-slate-800">
          {hours.map((h) => (
            <div
              key={h.day}
              className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              {/* Col 1: Día + toggle */}
              <div className="sm:col-span-3 flex items-center justify-between sm:justify-start gap-3">
                <div className="text-sm font-medium">{DAY_LABEL[h.day]}</div>
                <Toggle checked={h.isOpen} onClick={() => toggleDay(h.day)} />
              </div>

              {/* Col 2: Rangos */}
              <div
                className={[
                  "sm:col-span-9 grid grid-cols-2 sm:grid-cols-8 gap-2",
                  !h.isOpen ? "opacity-60" : "",
                ].join(" ")}
              >
                {/* Bloque 1 */}
                <div className="col-span-2 sm:col-span-2 flex items-center gap-2">
                  <div className="text-[11px] text-slate-400 w-10">Inicio</div>
                  <InputBase
                    type="time"
                    value={h.start1 || ""}
                    disabled={!h.isOpen}
                    onChange={(e) => updateTime(h.day, "start1", e.target.value)}
                  />
                </div>
                <div className="col-span-2 sm:col-span-2 flex items-center gap-2">
                  <div className="text-[11px] text-slate-400 w-10">Fin</div>
                  <InputBase
                    type="time"
                    value={h.end1 || ""}
                    disabled={!h.isOpen}
                    onChange={(e) => updateTime(h.day, "end1", e.target.value)}
                  />
                </div>

                {/* Bloque 2 (opcional) */}
                <div className="col-span-2 sm:col-span-2 flex items-center gap-2">
                  <div className="text-[11px] text-slate-400 w-10">Inicio</div>
                  <InputBase
                    type="time"
                    value={h.start2 || ""}
                    disabled={!h.isOpen}
                    onChange={(e) => updateTime(h.day, "start2", e.target.value)}
                    placeholder="--:--"
                  />
                </div>
                <div className="col-span-2 sm:col-span-2 flex items-center gap-2">
                  <div className="text:[11px] text-slate-400 w-10">Fin</div>
                  <InputBase
                    type="time"
                    value={h.end2 || ""}
                    disabled={!h.isOpen}
                    onChange={(e) => updateTime(h.day, "end2", e.target.value)}
                    placeholder="--:--"
                  />
                </div>

                {/* Nota */}
                <div className="col-span-2 sm:col-span-8 text-xs text-slate-500 self-center">
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

  if (loading) {
    return (
      <div className="p-6 text-slate-300">
        Cargando…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Estética — Configuración</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ajusta tu agenda, políticas y mensajes. Los cambios aplican inmediatamente.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reload}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 transition text-sm"
          >
            Revertir
          </button>
          <button
            onClick={async () => {
              try {
                await save();
                alert("Configuración y horarios guardados");
              } catch (e: any) {
                alert(e?.message || "Error al guardar");
              }
            }}
            disabled={saving}
            className={[
              "px-4 py-2 rounded-xl text-sm text-white",
              "bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed",
              "shadow-lg shadow-violet-900/30",
            ].join(" ")}
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      <EsteticaForm value={value} onChange={(patch) => setValue((prev) => ({ ...prev, ...patch }))} />
    </div>
  );
}
