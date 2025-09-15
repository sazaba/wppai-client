"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock,
  MapPin,
  User,
  Building2,
  Check,
  X,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

/* ============== helpers UI ============== */
function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function Button(
  { className, variant = "primary", ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }
) {
  const base =
    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent";
  const variants = {
    primary:
      // mejor contraste en dark + look premium
      "text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-gradient-to-tr dark:from-indigo-600 dark:to-violet-600 " +
      "dark:hover:from-indigo-500 dark:hover:to-violet-500 dark:text-white focus:ring-zinc-700 dark:focus:ring-indigo-500",
    ghost:
      "bg-transparent text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-white/5 " +
      "focus:ring-zinc-300 dark:focus:ring-zinc-700",
    outline:
      "border border-zinc-300 text-zinc-900 hover:bg-zinc-50 " +
      "dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-white/5 focus:ring-zinc-300 dark:focus:ring-zinc-700",
  } as const;
  return <button className={cx(base, variants[variant], className)} {...props} />;
}

function Badge({ children, color = "zinc" }: { children: React.ReactNode; color?: "zinc" | "green" | "yellow" | "red" | "blue" }) {
  const map: Record<string, string> = {
    zinc: "bg-zinc-200/70 text-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-200",
    green: "bg-green-200/70 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    yellow: "bg-yellow-200/70 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    red: "bg-red-200/70 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    blue: "bg-blue-200/70 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  };
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", map[color])}>{children}</span>;
}

function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        {children}
      </motion.div>
    </div>
  );
}

/* ============== tipos ============== */
export type Appointment = {
  id: number;
  empresaId: number;
  sedeId: number;
  serviceId: number;
  providerId?: number | null;
  conversationId?: number | null;
  source: "ai" | "agent" | "client";
  status: "pending" | "confirmed" | "rescheduled" | "cancelled" | "completed" | "no_show";
  customerName: string;
  customerPhone: string;
  notas?: string | null;
  startAt: string;
  endAt: string;
  serviceName: string;
  durationMin: number;
  timezone: string;
};
export type Sede = { id: number; nombre: string; timezone: string };
export type Service = { id: number; nombre: string; duracionMin: number };
export type Provider = { id: number; nombre: string };

/* ============== utils fechas ============== */
const ZULU = (d: Date) => d.toISOString();
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, 1);
function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const res = new Date(d);
  res.setDate(d.getDate() + diff);
  res.setHours(0, 0, 0, 0);
  return res;
}
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const formatDayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hhmm = (date: Date) => new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);

function statusColor(s: Appointment["status"]) {
  switch (s) {
    case "confirmed": return "green";
    case "pending": return "yellow";
    case "rescheduled": return "blue";
    case "cancelled": return "zinc";
    case "completed": return "green";
    case "no_show": return "red";
    default: return "zinc";
  }
}

/* ============== API helpers ============== */
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function apiPut<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ============== componente ============== */
export default function AppointmentsCalendar({ empresaId }: { empresaId: number }) {
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedSede, setSelectedSede] = useState<number | "all">("all");
  const [selectedService, setSelectedService] = useState<number | "all">("all");
  const [selectedProvider, setSelectedProvider] = useState<number | "all">("all");
  const [textQuery, setTextQuery] = useState("");
  const [events, setEvents] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // filtros
  useEffect(() => {
    (async () => {
      try {
        const [s, sv, p] = await Promise.all([
          apiGet<Sede[]>(`/api/sedes?empresaId=${empresaId}`),
          apiGet<Service[]>(`/api/services?empresaId=${empresaId}`),
          apiGet<Provider[]>(`/api/providers?empresaId=${empresaId}`),
        ]);
        setSedes(s); setServices(sv); setProviders(p);
      } catch (e) { console.error(e); }
    })();
  }, [empresaId]);

  // citas del mes visible
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const from = ZULU(startOfWeek(startOfMonth(current)));
        const to = ZULU(addDays(startOfWeek(endOfMonth(current)), 6));
        const params = new URLSearchParams({ empresaId: String(empresaId), from, to });
        if (selectedSede !== "all") params.append("sedeId", String(selectedSede));
        if (selectedService !== "all") params.append("serviceId", String(selectedService));
        if (selectedProvider !== "all") params.append("providerId", String(selectedProvider));
        const data = await apiGet<Appointment[]>(`/api/appointments?${params.toString()}`);
        setEvents(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [empresaId, current, selectedSede, selectedService, selectedProvider]);

  const monthMatrix = useMemo(() => {
    const start = startOfWeek(startOfMonth(current));
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [current]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    const filtered = events.filter((e) => {
      const q = (e.customerName + " " + e.customerPhone + " " + e.serviceName).toLowerCase();
      return textQuery ? q.includes(textQuery.toLowerCase()) : true;
    });
    for (const ev of filtered) {
      const k = formatDayKey(new Date(ev.startAt));
      (map[k] ||= []).push(ev);
    }
    for (const k of Object.keys(map)) map[k].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
    return map;
  }, [events, textQuery]);

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="w-full h-full">
      <div className="mx-auto h-full max-w-[1600px] p-4 md:p-6 lg:p-8">
        {/* Surface header premium */}
        <div className="mb-4 rounded-2xl border border-white/5 bg-white/60 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 md:mb-6 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* izquierda: navegación + mes visible */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setCurrent(addMonths(current, -1))} aria-label="Mes anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => setCurrent(addMonths(current, +1))} aria-label="Mes siguiente">
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="rounded-xl px-3 py-1.5 text-base font-semibold text-zinc-900 dark:text-white">
                {current.toLocaleString("es-CO", { month: "long", year: "numeric" })}
              </div>

              <Button variant="outline" className="ml-2" onClick={() => setCurrent(startOfMonth(new Date()))}>
                Hoy
              </Button>
            </div>

            {/* derecha: filtros */}
            <div className="flex flex-wrap items-center gap-2">
              {/* search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder="Buscar: nombre, teléfono, servicio"
                  className="w-72 rounded-2xl border border-zinc-300 bg-white px-9 py-2 text-sm text-zinc-900 placeholder-zinc-400
                             focus:outline-none focus:ring-2 focus:ring-zinc-900
                             dark:w-80 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-500"
                />
              </div>

              {/* select premium */}
              <Select
                value={String(selectedSede)}
                onChange={(v) => setSelectedSede(v === "all" ? "all" : Number(v))}
                options={[{ value: "all", label: "Todas las sedes" }, ...sedes.map(s => ({ value: String(s.id), label: s.nombre }))]}
              />
              <Select
                value={String(selectedService)}
                onChange={(v) => setSelectedService(v === "all" ? "all" : Number(v))}
                options={[{ value: "all", label: "Todos los servicios" }, ...services.map(s => ({ value: String(s.id), label: s.nombre }))]}
              />
              <Select
                value={String(selectedProvider)}
                onChange={(v) => setSelectedProvider(v === "all" ? "all" : Number(v))}
                options={[{ value: "all", label: "Todos los profesionales" }, ...providers.map(p => ({ value: String(p.id), label: p.nombre }))]}
              />

              <Button className="ml-1">
                <Plus className="h-4 w-4" /> Nueva cita
              </Button>
            </div>
          </div>
        </div>

        {/* Weekdays siempre visibles con buen contraste */}
        <div className="mb-2 grid grid-cols-7 gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {weekDays.map((w) => <div key={w} className="px-1">{w}</div>)}
        </div>

        {/* Month grid responsive */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {monthMatrix.map((day, idx) => {
            const inMonth = day.getMonth() === current.getMonth();
            const k = formatDayKey(day);
            const dayEvents = eventsByDay[k] || [];
            return (
              <div
                key={idx}
                className={cx(
                  "min-h-[120px] rounded-2xl border p-3 shadow-sm transition-all",
                  "bg-zinc-50/80 border-zinc-200 hover:shadow-md",
                  "dark:bg-zinc-900/60 dark:border-zinc-800",
                  !inMonth && "opacity-80"
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className={cx(
                    "text-sm font-semibold",
                    inMonth ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-500",
                    isSameDay(day, new Date()) && "text-zinc-900 dark:text-white"
                  )}>
                    {day.getDate()}
                  </div>
                  <div className="flex gap-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        title={ev.status}
                        className={cx("h-2 w-2 rounded-full", {
                          green: "bg-green-500",
                          yellow: "bg-yellow-400",
                          red: "bg-red-500",
                          blue: "bg-blue-500",
                          zinc: "bg-zinc-400 dark:bg-zinc-600",
                        }[statusColor(ev.status) as string])}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedAppt(ev)}
                      className="w-full rounded-xl border border-zinc-200 bg-white/80 px-2 py-1.5 text-left text-xs hover:bg-white
                                 dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-800"
                    >
                      <div className="flex items-center gap-1 text-zinc-800 dark:text-zinc-100">
                        <Clock className="h-3 w-3" /> {hhmm(new Date(ev.startAt))} · {ev.serviceName}
                      </div>
                      <div className="truncate text-[11px] text-zinc-600 dark:text-zinc-400">
                        <User className="mr-1 inline h-3 w-3" /> {ev.customerName}
                      </div>
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">+{dayEvents.length - 3} más…</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* loading */}
      {loading && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-white/40 backdrop-blur-sm dark:bg-zinc-900/40">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl bg-white px-4 py-3 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <CalendarIcon className="h-4 w-4" /> Cargando citas…
            </div>
          </motion.div>
        </div>
      )}

      {/* modal */}
      <Dialog open={!!selectedAppt} onClose={() => setSelectedAppt(null)}>
        {selectedAppt && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedAppt.serviceName}</div>
              <Badge color={statusColor(selectedAppt.status)}>{selectedAppt.status}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200"><Clock className="h-4 w-4" /> {hhmm(new Date(selectedAppt.startAt))} – {hhmm(new Date(selectedAppt.endAt))}</div>
              <div className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200"><User className="h-4 w-4" /> {selectedAppt.customerName} · {selectedAppt.customerPhone}</div>
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"><Building2 className="h-4 w-4" /> Sede ID: {selectedAppt.sedeId}</div>
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"><MapPin className="h-4 w-4" /> Conversación: {selectedAppt.conversationId ?? "—"}</div>
            </div>
            {selectedAppt.notas && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
                {selectedAppt.notas}
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedAppt(null)}><X className="h-4 w-4" /> Cerrar</Button>
              <Button
                onClick={async () => {
                  try {
                    const next = selectedAppt.status === "confirmed" ? "completed" : "confirmed";
                    const updated = await apiPut<Appointment>(`/api/appointments/${selectedAppt.id}/status`, { status: next });
                    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
                    setSelectedAppt(updated);
                  } catch (e) { console.error(e); }
                }}
              >
                <Check className="h-4 w-4" /> {selectedAppt.status === "confirmed" ? "Marcar completada" : "Confirmar"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ============== Select premium (sin lib externa) ============== */
function Select({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none rounded-2xl border border-zinc-300 bg-white px-3 py-2 pr-9 text-sm text-zinc-900
          shadow-sm transition focus:outline-none focus:ring-2 focus:ring-zinc-900
          dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-500
        "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
    </div>
  );
}
