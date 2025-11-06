"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Plus,
  Clock, Check, X, Edit, Trash
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

// SweetAlert2 dark premium
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ---------- helpers ---------- */
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const fmtKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const hhmm = (d: Date) => new Intl.DateTimeFormat("es-CO",{hour:"2-digit",minute:"2-digit",hour12:false}).format(d);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/** "YYYY-MM-DDTHH:mm" -> ISO con offset fijo (ej: -05:00) */
function localToISOWithOffset(local: string, offsetMinutes = -300): { iso: string; dateLocal: Date } {
  const [y, m, rest] = local.split("-");
  const [d, hm] = (rest || "").split("T");
  const [H, M] = (hm || "").split(":");
  const dateLocal = new Date(Number(y), Number(m) - 1, Number(d), Number(H || 0), Number(M || 0), 0, 0);

  const sign = offsetMinutes <= 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  const oh = String(Math.floor(abs / 60)).padStart(2, "0");
  const om = String(abs % 60).padStart(2, "0");
  const tz = `${sign}${oh}:${om}`;

  const yyyy = dateLocal.getFullYear();
  const MM = String(dateLocal.getMonth() + 1).padStart(2, "0");
  const dd = String(dateLocal.getDate()).padStart(2, "0");
  const HH = String(dateLocal.getHours()).padStart(2, "0");
  const mm = String(dateLocal.getMinutes()).padStart(2, "0");
  return { iso: `${yyyy}-${MM}-${dd}T${HH}:${mm}:00${tz}`, dateLocal };
}

/** ISO -> "YYYY-MM-DDTHH:mm" en offset (Bogotá -05:00 por defecto) */
function isoToLocalYMDHM(iso: string, offsetMinutes = -300): string {
  const t = new Date(iso).getTime();
  const shifted = new Date(t + offsetMinutes * 60_000);
  const yyyy = shifted.getUTCFullYear();
  const MM = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  const HH = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
}

/* ---------- SweetAlert dark premium ---------- */
const DarkSwal = Swal.mixin({
  background: "#0B0C14",
  color: "#E5E7EB",
  iconColor: "#A78BFA",
  showClass: { popup: "swal2-noanimation" },
  hideClass: { popup: "" },
  buttonsStyling: false,
  customClass: {
    popup: "rounded-2xl border border-white/10 shadow-2xl",
    title: "text-lg font-semibold",
    htmlContainer: "text-sm text-gray-200",
    confirmButton:
      "inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-400",
    cancelButton:
      "inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-white/15 text-white/90 hover:bg-white/5 ml-2",
  },
});
const alertSuccess = (title: string, text?: string) => DarkSwal.fire({ icon:"success", title, text, confirmButtonText:"Aceptar" });
const alertError = (title: string, html?: string) => DarkSwal.fire({ icon:"error", title, html, confirmButtonText:"Entendido" });
const extractErrorMessage = (err: unknown) => {
  const raw = err instanceof Error ? err.message : String(err);
  try { const j = JSON.parse(raw); return j?.message || j?.error || j?.details || j?.msg || raw; } catch { return raw; }
};

/* ---------- UI Primitives ---------- */
function Button(
  { className, variant="primary", ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" | "danger" }
){
  const base = "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-0";
  const variants = {
    primary: "text-white bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:opacity-90 focus:ring-indigo-400",
    ghost:   "text-white/90 hover:bg-white/10",
    outline: "border border-white/15 text-white hover:bg-white/5",
    danger:  "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
  } as const;
  return <button className={cx(base, variants[variant], className)} {...props} />;
}

function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl">
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- Inputs ---------- */
function Input(
  { label, type="text", value, onChange, placeholder }:
  { label:string; type?:string; value:string; onChange:(v:string)=>void; placeholder?:string }
){
  return (
    <label className="space-y-1">
      <span className="text-xs text-white/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white
                   placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}
function TextArea(
  { label, value, onChange, placeholder }:
  { label:string; value:string; onChange:(v:string)=>void; placeholder?:string }
){
  return (
    <label className="space-y-1 sm:col-span-2">
      <span className="text-xs text-white/80">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white
                   placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

/* ---------- Types ---------- */
export type Appointment = {
  id: number;
  empresaId: number;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  sedeName?: string | null;
  providerName?: string | null;
  startAt: string; // ISO
  endAt: string;
  notas?: string | null;
  status?: "pending" | "confirmed" | "rescheduled" | "cancelled" | "completed" | "no_show";
};

/* ---------- API helpers ---------- */
async function api<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
const qs = (params: Record<string, any>) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.append(k, String(v));
  });
  return u.toString();
};

/* ---------- Time & view helpers ---------- */
type ViewMode = "month" | "week" | "day";
const START_HOUR = 6;
const END_HOUR = 21;
const TOTAL_MIN = (END_HOUR - START_HOUR) * 60;
const PX_PER_MIN = 1;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function isSameYMD(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function minutesFromStart(d: Date) {
  const m = (d.getHours() - START_HOUR) * 60 + d.getMinutes();
  return clamp(m, 0, TOTAL_MIN);
}
function spanLabel(a: Date, b: Date) {
  const fmt = new Intl.DateTimeFormat("es-CO",{hour:"2-digit",minute:"2-digit",hour12:false});
  return `${fmt.format(a)}–${fmt.format(b)}`;
}
function getWeekStart(d: Date) {
  const w = d.getDay(); // 0=Dom..6=Sab
  const mondayDiff = (w === 0 ? -6 : 1) - w;
  const m = new Date(d);
  m.setDate(d.getDate() + mondayDiff);
  m.setHours(0,0,0,0);
  return m;
}

/* ---------- Component ---------- */
export default function AppointmentsCalendar({ empresaId }: { empresaId?: number }) {
  const { token, usuario } = useAuth();
  const effEmpresaId = empresaId ?? usuario?.empresaId;

  const [current, setCurrent] = useState(() => new Date());
  const [events, setEvents] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  // vistas
  const [view, setView] = useState<ViewMode>("month");
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => getWeekStart(new Date()));

  // matrix 7x6 lunes-primero
  const daysMonth = useMemo(() => {
    const first = new Date(current.getFullYear(), current.getMonth(), 1);
    const mondayStart = getWeekStart(first);
    return Array.from({length:42},(_,i)=> {
      const d = new Date(mondayStart);
      d.setDate(mondayStart.getDate()+i);
      d.setHours(0,0,0,0);
      return d;
    });
  },[current]);

  // semana actual (Lun-Dom)
  const weekDays = useMemo(()=> {
    return Array.from({length:7},(_,i)=>{
      const d=new Date(selectedWeekStart);
      d.setDate(selectedWeekStart.getDate()+i);
      d.setHours(0,0,0,0);
      return d;
    });
  },[selectedWeekStart]);

  const eventsByDay = useMemo(()=>{
    const map: Record<string, Appointment[]> = {};
    for (const e of events) {
      const k = fmtKey(new Date(e.startAt));
      (map[k] ||= []).push(e);
    }
    for (const k of Object.keys(map)) map[k].sort((a,b)=>+new Date(a.startAt)-+new Date(b.startAt));
    return map;
  },[events]);

  const eventsForSelectedDay = useMemo(() => {
    return events
      .filter(ev => isSameYMD(new Date(ev.startAt), selectedDay))
      .sort((a,b) => +new Date(a.startAt) - +new Date(b.startAt));
  }, [events, selectedDay]);

  const eventsForWeek = useMemo(() => {
    const end = new Date(selectedWeekStart); end.setDate(end.getDate()+7);
    return events.filter(ev=>{
      const s=new Date(ev.startAt);
      return s>=selectedWeekStart && s<end;
    });
  },[events, selectedWeekStart]);

  const hourTicks = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date(); base.setHours(START_HOUR,0,0,0);
    for (let i=0;i<=END_HOUR-START_HOUR;i++){
      const d = new Date(base);
      d.setHours(START_HOUR + i);
      arr.push(d);
    }
    return arr;
  }, []);

  /* ---------- Load appointments from backend ---------- */
  useEffect(() => {
    if (!effEmpresaId || !token) return;
    const first = new Date(current.getFullYear(), current.getMonth(), 1);
    const last  = new Date(current.getFullYear(), current.getMonth()+1, 0);
    const from  = new Date(first); from.setHours(0,0,0,0);
    const to    = new Date(last);  to.setHours(23,59,59,999);

    (async () => {
      try {
        setLoading(true);
        const query = qs({ empresaId: effEmpresaId, from: from.toISOString(), to: to.toISOString() });
        const data = await api<Appointment[]>(`/api/appointments?${query}`, { method: "GET" }, token);
        setEvents(data);
      } catch (e) {
        console.error("[appointments load]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [current, effEmpresaId, token]);

  /* ---------- CRUD ---------- */
  async function addAppointment(data: {
    name: string; phone: string;
    service: string; sede?: string; provider?: string;
    startISO: string; durationMin?: number; notes?: string;
  }) {
    if (!effEmpresaId || !token) return;
    try {
      const { iso: startAtISO, dateLocal } = localToISOWithOffset(data.startISO, -300);
      const durationMin = Number.isFinite(data.durationMin as number) ? (data.durationMin as number) : 30;
      const endLocal = new Date(dateLocal.getTime() + durationMin * 60_000);
      const { iso: endAtISO } = localToISOWithOffset(
        `${endLocal.getFullYear()}-${String(endLocal.getMonth()+1).padStart(2,"0")}-${String(endLocal.getDate()).padStart(2,"0")}T${String(endLocal.getHours()).padStart(2,"0")}:${String(endLocal.getMinutes()).padStart(2,"0")}`,
        -300
      );

      const body = {
        empresaId: effEmpresaId,
        customerName: data.name,
        customerPhone: data.phone,
        serviceName: data.service,
        notas: data.notes || null,
        startAt: startAtISO,
        endAt: endAtISO,
        timezone: "America/Bogota",
      };

      const created = await api<Appointment>(`/api/appointments?${qs({ empresaId: effEmpresaId })}`, {
        method: "POST",
        body: JSON.stringify(body),
      }, token);

      setEvents((prev) => [...prev, created]);
      await alertSuccess("Cita creada",
        `${created.customerName} • ${new Date(created.startAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}`);
      return created;
    } catch (err) {
      const msg = extractErrorMessage(err);
      await alertError("No se pudo agendar la cita", `<pre style="text-align:left;white-space:pre-wrap;">${msg}</pre>`);
      throw err;
    }
  }

  async function updateAppointment(id: number, patch: Partial<Appointment>) {
    if (!effEmpresaId || !token) return;
    try {
      const updated = await api<Appointment>(`/api/appointments/${id}?${qs({ empresaId: effEmpresaId })}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      }, token);
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      await alertSuccess("Cita actualizada",
        `${updated.customerName} • ${new Date(updated.startAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}`);
      return updated;
    } catch (err) {
      const msg = extractErrorMessage(err);
      await alertError("No se pudo actualizar la cita", `<pre style="text-align:left;white-space:pre-wrap;">${msg}</pre>`);
      throw err;
    }
  }

  async function deleteAppointment(id: number) {
    if (!effEmpresaId || !token) return;
    const confirm = await DarkSwal.fire({
      icon: "warning",
      title: "Eliminar cita",
      html: '<div class="text-left text-sm">Esta acción no se puede deshacer.</div>',
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;

    try {
      await api<{ok:true}>(`/api/appointments/${id}?${qs({ empresaId: effEmpresaId })}`, { method: "DELETE" }, token);
      setEvents(prev => prev.filter(e => e.id !== id));
      await alertSuccess("Cita eliminada", "La cita fue eliminada correctamente.");
    } catch (err) {
      const msg = extractErrorMessage(err);
      await alertError("No se pudo eliminar la cita", `<pre style="text-align:left;white-space:pre-wrap;">${msg}</pre>`);
      throw err;
    }
  }

  /* ---------- UI ---------- */
  const monthTitle = current.toLocaleString("es-CO",{month:"long", year:"numeric"});
  const weekTitle = (() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const sameMonth = start.getMonth() === end.getMonth();
    const opts = { day:"numeric" } as const;
    const s = start.toLocaleDateString("es-CO", sameMonth ? opts : { ...opts, month:"short" });
    const e = end.toLocaleDateString("es-CO", { day:"numeric", month:"short" });
    const y = end.getFullYear();
    return `${s} – ${e} ${y}`;
  })();

  return (
    <div className="w-full h-full">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">

        {/* Header estilo Google */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              {/* Navegación */}
              <Button variant="ghost" aria-label="Anterior" onClick={()=>{
                if (view === "month") setCurrent(new Date(current.getFullYear(), current.getMonth()-1, 1));
                if (view === "week")  { const d=new Date(selectedWeekStart); d.setDate(d.getDate()-7); setSelectedWeekStart(getWeekStart(d)); }
                if (view === "day")   { const d=new Date(selectedDay); d.setDate(d.getDate()-1); setSelectedDay(d); }
              }}>
                <ChevronLeft className="h-4 w-4"/>
              </Button>
              <Button variant="ghost" aria-label="Siguiente" onClick={()=>{
                if (view === "month") setCurrent(new Date(current.getFullYear(), current.getMonth()+1, 1));
                if (view === "week")  { const d=new Date(selectedWeekStart); d.setDate(d.getDate()+7); setSelectedWeekStart(getWeekStart(d)); }
                if (view === "day")   { const d=new Date(selectedDay); d.setDate(d.getDate()+1); setSelectedDay(d); }
              }}>
                <ChevronRight className="h-4 w-4"/>
              </Button>

              {/* Título rango */}
              <div className="rounded-xl px-3 py-1.5 text-base font-semibold capitalize">
                {view === "month" && monthTitle}
                {view === "week"  && weekTitle}
                {view === "day"   && selectedDay.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </div>

              {/* Hoy */}
              <Button variant="outline" onClick={()=>{
                const now=new Date();
                setCurrent(new Date());
                setSelectedDay(now);
                setSelectedWeekStart(getWeekStart(now));
              }}>
                Hoy
              </Button>
            </div>

            {/* Selector de vista + acción */}
            <div className="flex items-center gap-2">
              <Button variant={view==='month'?'primary':'outline'} onClick={()=>setView('month')}>Mes</Button>
              <Button variant={view==='week'?'primary':'outline'}  onClick={()=>{
                setSelectedWeekStart(getWeekStart(selectedDay));
                setView('week');
              }}>Semana</Button>
              <Button variant={view==='day'?'primary':'outline'}   onClick={()=>setView('day')}>Día</Button>
              <Button onClick={()=>setShowCreate(true)}><Plus className="h-4 w-4"/> Nueva cita</Button>
            </div>
          </div>
        </div>

        {/* Cabeceras de días (Mes) */}
        {view === 'month' && (
          <div className="mb-2 grid grid-cols-7 gap-3 text-xs font-medium text-white/80">
            {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((w)=> <div key={w} className="px-1">{w}</div>)}
          </div>
        )}

        {/* Grid Mes */}
        {view === 'month' && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
            {daysMonth.map((day,i)=>{
              const k = fmtKey(day);
              const inMonth = day.getMonth() === current.getMonth();
              const list = eventsByDay[k] || [];
              const isToday = isSameYMD(day, new Date());
              return (
                <div
                  key={i}
                  onClick={() => { setSelectedDay(day); setSelectedWeekStart(getWeekStart(day)); setView('day'); }}
                  className={cx(
                    "min-h-[120px] rounded-2xl border p-3 shadow-sm transition cursor-pointer",
                    "bg-white text-zinc-900 border-zinc-200",
                    "dark:bg-zinc-900 dark:text-white dark:border-zinc-800",
                    !inMonth && "opacity-70",
                    isToday && "ring-2 ring-indigo-400/70"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className={cx("text-sm font-semibold", inMonth ? "" : "text-white/60")}>
                      {day.getDate()}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {list.map(ev=>(
                      <div key={ev.id}
                           className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs
                                      dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        <div className="truncate">
                          <span className="mr-1 inline-flex items-center gap-1"><Clock className="h-3 w-3"/> {hhmm(new Date(ev.startAt))}</span>
                          · {ev.customerName}
                        </div>
                        <div className="ml-2 shrink-0 flex gap-1">
                          <button title="Editar" onClick={(e)=>{ e.stopPropagation(); setEditing(ev); }}><Edit className="h-3.5 w-3.5 text-indigo-400"/></button>
                          <button title="Eliminar" onClick={(e)=>{ e.stopPropagation(); deleteAppointment(ev.id); }}><Trash className="h-3.5 w-3.5 text-red-400"/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cabecera de días (Semana/Día) */}
        {(view === "week" || view === "day") && (
          <div className="mb-2 grid grid-cols-12 text-xs font-medium text-white/80">
            <div className="col-span-2 sm:col-span-1"></div>
            <div className={cx(view==="day" ? "col-span-10 sm:col-span-11" : "col-span-10 sm:col-span-11 grid grid-cols-7 gap-3")}>
              {view==="day" ? (
                <div className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 capitalize">
                  {selectedDay.toLocaleDateString("es-CO", { weekday:"long", day:"numeric", month:"short" })}
                </div>
              ) : (
                weekDays.map((d,i)=>{
                  const isToday = isSameYMD(d,new Date());
                  return (
                    <div key={i}
                      className={cx("px-2 py-1 rounded-lg border border-white/10 bg-white/5 capitalize text-center",
                                    isToday && "ring-2 ring-indigo-400/70")}
                    >
                      {d.toLocaleDateString("es-CO",{weekday:"short"})} {d.getDate()}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Vista Día */}
        {view === 'day' && (
          <div className="grid grid-cols-12 gap-3">
            {/* Columna horas */}
            <div className="col-span-2 sm:col-span-1">
              <div style={{ height: TOTAL_MIN * PX_PER_MIN }} className="relative border-l border-white/10">
                {hourTicks.map((t,i)=>(
                  <div key={i} className="absolute left-0 -translate-y-2 text-xs text-white/70"
                    style={{ top: ((i*60) * PX_PER_MIN) }}>
                    {new Intl.DateTimeFormat('es-CO',{hour:'2-digit',minute:'2-digit',hour12:false}).format(t)}
                  </div>
                ))}
              </div>
            </div>

            {/* Columna eventos */}
            <div className="col-span-10 sm:col-span-11">
              <div className="relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
                style={{ height: TOTAL_MIN * PX_PER_MIN }}>
                {hourTicks.map((_,i)=>(
                  <div key={i}
                    className={cx("absolute left-0 right-0 border-t", i===0 ? "border-white/20" : "border-white/10")}
                    style={{ top: ((i*60) * PX_PER_MIN) }}
                  />
                ))}

                {eventsForSelectedDay.map(ev=>{
                  const s = new Date(ev.startAt);
                  const e = new Date(ev.endAt);
                  const top = minutesFromStart(s) * PX_PER_MIN;
                  const height = Math.max(24, ( (e.getTime()-s.getTime())/60000 ) * PX_PER_MIN );
                  return (
                    <div key={ev.id}
                      className="absolute left-2 right-2 sm:left-4 sm:right-6 rounded-xl border text-xs shadow
                                 bg-violet-600/20 border-violet-500/40 text-white backdrop-blur"
                      style={{ top, height }}
                      title={spanLabel(s,e)}
                    >
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="truncate">
                          <span className="mr-2 inline-flex items-center gap-1 text-[11px] opacity-90">
                            <Clock className="h-3 w-3"/>{spanLabel(s,e)}
                          </span>
                          <strong>{ev.customerName}</strong>
                          {ev.serviceName ? <> · <span className="opacity-90">{ev.serviceName}</span></> : null}
                        </div>
                        <div className="ml-2 shrink-0 flex gap-1">
                          <button title="Editar" onClick={()=>setEditing(ev)}><Edit className="h-3.5 w-3.5 text-indigo-300"/></button>
                          <button title="Eliminar" onClick={()=>deleteAppointment(ev.id)}><Trash className="h-3.5 w-3.5 text-red-300"/></button>
                        </div>
                      </div>
                      {ev.notas && <div className="px-2 pb-1 pr-12 opacity-80 line-clamp-2">{ev.notas}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Vista Semana (7 columnas, estilo Google) */}
        {view === "week" && (
          <div className="grid grid-cols-12 gap-3">
            {/* Columna horas */}
            <div className="col-span-2 sm:col-span-1">
              <div style={{ height: TOTAL_MIN * PX_PER_MIN }} className="relative border-l border-white/10">
                {hourTicks.map((t,i)=>(
                  <div key={i} className="absolute left-0 -translate-y-2 text-xs text-white/70"
                    style={{ top: ((i*60) * PX_PER_MIN) }}>
                    {new Intl.DateTimeFormat('es-CO',{hour:'2-digit',minute:'2-digit',hour12:false}).format(t)}
                  </div>
                ))}
              </div>
            </div>

            {/* 7 días */}
            <div className="col-span-10 sm:col-span-11 grid grid-cols-7 gap-3">
              {weekDays.map((day, idx)=>{
                const dayEvents = eventsForWeek.filter(ev => isSameYMD(new Date(ev.startAt), day));
                return (
                  <div key={idx}
                    className="relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
                    style={{ height: TOTAL_MIN * PX_PER_MIN }}
                    onDoubleClick={()=>{ setSelectedDay(day); setView("day"); }}
                    title="Doble clic para abrir el Día"
                  >
                    {hourTicks.map((_,i)=>(
                      <div key={i}
                        className={cx("absolute left-0 right-0 border-t", i===0 ? "border-white/20" : "border-white/10")}
                        style={{ top: ((i*60) * PX_PER_MIN) }}
                      />
                    ))}

                    {dayEvents.map(ev=>{
                      const s = new Date(ev.startAt);
                      const e = new Date(ev.endAt);
                      const top = minutesFromStart(s) * PX_PER_MIN;
                      const height = Math.max(24, ( (e.getTime()-s.getTime())/60000 ) * PX_PER_MIN );
                      return (
                        <div key={ev.id}
                          className="absolute left-1 right-1 sm:left-2 sm:right-2 rounded-xl border text-[11px] shadow
                                     bg-indigo-600/20 border-indigo-400/40 text-white backdrop-blur"
                          style={{ top, height }}
                          title={spanLabel(s,e)}
                        >
                          <div className="flex items-center justify-between px-2 py-1">
                            <div className="truncate">
                              <strong>{ev.customerName}</strong>
                              {ev.serviceName ? <> · <span className="opacity-90">{ev.serviceName}</span></> : null}
                            </div>
                            <div className="ml-1 shrink-0 flex gap-1">
                              <button title="Editar" onClick={()=>setEditing(ev)}><Edit className="h-3.5 w-3.5 text-indigo-200"/></button>
                              <button title="Eliminar" onClick={()=>deleteAppointment(ev.id)}><Trash className="h-3.5 w-3.5 text-red-300"/></button>
                            </div>
                          </div>
                          <div className="px-2 pb-1 opacity-80">{spanLabel(s,e)}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/20 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl bg-zinc-900 px-4 py-3 text-white shadow-xl border border-white/10">
            <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Cargando citas…</div>
          </motion.div>
        </div>
      )}

      {/* Crear cita */}
      <Dialog open={showCreate} onClose={()=>setShowCreate(false)}>
        <CreateForm
          onCancel={()=>setShowCreate(false)}
          onSave={async (data)=>{ await addAppointment(data); setShowCreate(false); }}
        />
      </Dialog>

      {/* Editar cita */}
      <Dialog open={!!editing} onClose={()=>setEditing(null)}>
        {editing && (
          <EditForm
            appt={editing}
            onCancel={()=>setEditing(null)}
            onSave={async (patch)=>{
              // Mantener duración original
              const startLocalStr = (patch.startAt ? patch.startAt : editing.startAt);
              const normalizedLocal = startLocalStr.includes("T") && startLocalStr.length > 16
                ? isoToLocalYMDHM(startLocalStr, -300)
                : startLocalStr.slice(0,16);

              const { dateLocal, iso: startAtISO } = localToISOWithOffset(normalizedLocal, -300);
              const durMs = new Date(editing.endAt).getTime() - new Date(editing.startAt).getTime();
              const endLocal = new Date(dateLocal.getTime() + durMs);
              const endLocalStr = `${endLocal.getFullYear()}-${String(endLocal.getMonth()+1).padStart(2,"0")}-${String(endLocal.getDate()).padStart(2,"0")}T${String(endLocal.getHours()).padStart(2,"0")}:${String(endLocal.getMinutes()).padStart(2,"0")}`;
              const { iso: endAtISO } = localToISOWithOffset(endLocalStr, -300);

              await updateAppointment(editing.id, { ...patch, startAt: startAtISO, endAt: endAtISO });
              setEditing(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

/* ---------- Formularios ---------- */
function CreateForm({
  onSave, onCancel
}:{
  onSave:(d:{name:string;phone:string;service:string;sede?:string;provider?:string;startISO:string;durationMin?:number;notes?:string;})=>Promise<void>|void;
  onCancel:()=>void;
}) {
  const [form, setForm] = useState({
    name:"", phone:"", service:"", sede:"", provider:"",
    startISO:"", durationMin:30, notes:""
  });

  return (
    <form onSubmit={async (e)=>{ e.preventDefault(); await onSave(form); }} className="space-y-4 text-white">
      <h2 className="text-lg font-semibold flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> Crear nueva cita</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Nombre cliente" value={form.name} onChange={(v)=>setForm({...form,name:v})} placeholder="Ej. Juan Pérez"/>
        <Input label="Teléfono" value={form.phone} onChange={(v)=>setForm({...form,phone:v})} placeholder="Ej. +57 300 000 0000"/>
        <Input label="Sede (opcional)" value={form.sede} onChange={(v)=>setForm({...form,sede:v})} placeholder="Ej. Sede Centro"/>
        <Input label="Profesional (opcional)" value={form.provider} onChange={(v)=>setForm({...form,provider:v})} placeholder="Ej. Dra. López"/>
        <Input label="Servicio" value={form.service} onChange={(v)=>setForm({...form,service:v})} placeholder="Ej. Blanqueamiento dental"/>
        <Input label="Fecha y hora" type="datetime-local" value={form.startISO} onChange={(v)=>setForm({...form,startISO:v})} />
        <Input label="Duración (min)" type="number" value={String(form.durationMin)} onChange={(v)=>setForm({...form,durationMin:Number(v||30)})} placeholder="30"/>
        <TextArea label="Notas (opcional)" value={form.notes} onChange={(v)=>setForm({...form,notes:v})} placeholder="Observaciones, indicaciones..."/>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}><X className="h-4 w-4"/> Cancelar</Button>
        <Button type="submit"><Check className="h-4 w-4"/> Guardar</Button>
      </div>
    </form>
  );
}

function EditForm({
  appt, onSave, onCancel
}:{
  appt: Appointment;
  onSave:(patch:Partial<Appointment>)=>Promise<void>|void;
  onCancel:()=>void;
}) {
  const [name,setName] = useState(appt.customerName);
  const [phone,setPhone] = useState(appt.customerPhone);
  const [service,setService] = useState(appt.serviceName);
  // normalizamos a pared horaria Bogotá
  const [start,setStart] = useState(() => isoToLocalYMDHM(appt.startAt, -300));
  const [notes,setNotes] = useState(appt.notas ?? "");

  return (
    <form
      onSubmit={async (e)=>{ e.preventDefault(); await onSave({
        customerName:name, customerPhone:phone, serviceName:service,
        startAt:start, // el caller convertirá a ISO preservando duración
        notas:notes
      }); }}
      className="space-y-4 text-white"
    >
      <h2 className="text-lg font-semibold flex items-center gap-2"><Edit className="h-5 w-5"/> Editar cita</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Nombre cliente" value={name} onChange={setName} placeholder="Nombre completo"/>
        <Input label="Teléfono" value={phone} onChange={setPhone} placeholder="Contacto"/>
        <Input label="Servicio" value={service} onChange={setService} placeholder="Tipo de servicio"/>
        <Input label="Fecha y hora" type="datetime-local" value={start} onChange={setStart}/>
        <TextArea label="Notas" value={notes} onChange={setNotes} placeholder="Notas internas o del cliente"/>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}><X className="h-4 w-4"/> Cancelar</Button>
        <Button type="submit"><Check className="h-4 w-4"/> Guardar cambios</Button>
      </div>
    </form>
  );
}
