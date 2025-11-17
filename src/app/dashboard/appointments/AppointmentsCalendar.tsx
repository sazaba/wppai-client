"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Plus,
  Clock, Check, X, Edit, Trash
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ---------- helpers ---------- */
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const fmtKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const hhmm = (d: Date) => new Intl.DateTimeFormat("es-CO",{hour:"2-digit",minute:"2-digit",hour12:false}).format(d);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/** "YYYY-MM-DDTHH:mm" -> ISO (Bogotá -05:00 por defecto) */
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

/** ISO -> "YYYY-MM-DDTHH:mm" (Bogotá -05:00 por defecto) */
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
  background: "linear-gradient(180deg,#0B0C14 0%, #0F1020 100%)",
  color: "#E5E7EB",
  iconColor: "#A78BFA",
  showClass: { popup: "swal2-noanimation" },
  hideClass: { popup: "" },
  buttonsStyling: false,
  customClass: {
    popup: "rounded-2xl border border-white/10 shadow-[0_20px_60px_-20px_rgba(80,70,200,.4)]",
    title: "text-xl font-semibold tracking-tight",
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
/** Evita iniciar drag cuando el click viene de un control interactivo (botón, icono, etc.) */
const isNoDragTarget = (el: EventTarget | null) => {
  const node = el as HTMLElement | null;
  return !!node?.closest('[data-nodrag]');
};

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
const snap15 = (m:number) => Math.round(m/15)*15;

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

/* ---------- Count styles (month view) ---------- */
/* ---------- Count styles (month view) ---------- */
function countTone(n: number) {
  if (n === 0) {
    return {
      badge: "bg-zinc-900/90 text-zinc-300 ring-white/10",
      glow: "from-transparent via-transparent to-transparent",
      dot: "bg-zinc-500",
    };
  }
  if (n <= 2) {
    return {
      badge:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.45)]",
      glow: "from-emerald-500/35 via-emerald-500/15 to-transparent",
      dot: "bg-emerald-400",
    };
  }
  if (n <= 5) {
    return {
      badge:
        "bg-gradient-to-r from-sky-500 to-indigo-500 text-white ring-sky-400/60 shadow-[0_0_22px_rgba(59,130,246,0.5)]",
      glow: "from-sky-500/35 via-indigo-500/20 to-transparent",
      dot: "bg-sky-400",
    };
  }
  return {
    badge:
      "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white ring-fuchsia-400/60 shadow-[0_0_24px_rgba(236,72,153,0.55)]",
    glow: "from-fuchsia-500/35 via-rose-500/18 to-transparent",
    dot: "bg-rose-400",
  };
}


function getWeekStart(d: Date) {
  const w = d.getDay(); // 0=Dom..6=Sab
  const mondayDiff = (w === 0 ? -6 : 1) - w;
  const m = new Date(d);
  m.setDate(d.getDate() + mondayDiff);
  m.setHours(0,0,0,0);
  return m;
}

/* =========================================================
   Layout de solapamientos (tipo Google Calendar)
   ========================================================= */

type LayoutBox = { top: number; height: number; leftPct: number; widthPct: number };

function assignColumnsInCluster(cluster: Appointment[]) {
  const columnsEnd: number[] = [];
  const colIndex: Record<number, number> = {};
  const byStart = [...cluster].sort((a,b)=>+new Date(a.startAt)-+new Date(b.startAt));

  for (const ev of byStart) {
    const s = +new Date(ev.startAt);
    const e = +new Date(ev.endAt);
    let placed = false;
    for (let i=0;i<columnsEnd.length;i++) {
      if (s >= columnsEnd[i]) {
        colIndex[ev.id] = i;
        columnsEnd[i] = e;
        placed = true;
        break;
      }
    }
    if (!placed) {
      colIndex[ev.id] = columnsEnd.length;
      columnsEnd.push(e);
    }
  }
  return { colIndex, totalCols: columnsEnd.length };
}

function buildDayLayout(dayEvents: Appointment[]): Record<number, LayoutBox> {
  const sorted = [...dayEvents].sort((a,b)=>+new Date(a.startAt)-+new Date(b.startAt));
  const clusters: Appointment[][] = [];
  let curr: Appointment[] = [];
  let currEnd = -Infinity;

  for (const ev of sorted) {
    const s = +new Date(ev.startAt);
    const e = +new Date(ev.endAt);
    if (curr.length === 0 || s < currEnd) {
      curr.push(ev);
      currEnd = Math.max(currEnd, e);
    } else {
      clusters.push(curr);
      curr = [ev];
      currEnd = e;
    }
  }
  if (curr.length) clusters.push(curr);

  const layout: Record<number, LayoutBox> = {};
  for (const cluster of clusters) {
    const { colIndex, totalCols } = assignColumnsInCluster(cluster);
    for (const ev of cluster) {
      const s = new Date(ev.startAt);
      const e = new Date(ev.endAt);
      const top    = minutesFromStart(s) * PX_PER_MIN;
      const height = Math.max(24, ((e.getTime() - s.getTime()) / 60000) * PX_PER_MIN);
      const col = colIndex[ev.id] ?? 0;
      const widthPct = 100 / totalCols;
      const leftPct  = (col * 100) / totalCols;
      layout[ev.id] = { top, height, leftPct, widthPct };
    }
  }
  return layout;
}

/* =========================================================
   Drag & Drop + Resize (top/bottom) + Ghost semanal
   ========================================================= */

/** Variantes del estado de interacción para tipado seguro */
type DragMoveDay = {
  mode: "move";
  view: "day";
  id: number;
  durationMin: number;
  originMin: number;
  startMin: number;
  currentMin: number;
  dayDate: Date;
};

type DragMoveWeek = {
  mode: "move";
  view: "week";
  id: number;
  durationMin: number;
  originMin: number;
  startMin: number;
  currentMin: number;
  weekStart: Date;
  originDayIdx: number;
  currentDayIdx: number;
};

type DragResizeBottomDay = {
  mode: "resize";
  view: "day";
  id: number;
  durationMin: number;
  minDuration: number;
  originBottomMin: number;
  currentBottomMin: number;
  startMinFixed: number;
  dayDate: Date;
};

type DragResizeBottomWeek = {
  mode: "resize";
  view: "week";
  id: number;
  durationMin: number;
  minDuration: number;
  originBottomMin: number;
  currentBottomMin: number;
  startMinFixed: number;
  weekStart: Date;
  dayIdx: number;
};

type DragResizeTopDay = {
  mode: "resizeTop";
  view: "day";
  id: number;
  minDuration: number;
  originTopMin: number;
  currentTopMin: number;
  bottomMinFixed: number;
  dayDate: Date;
};

type DragResizeTopWeek = {
  mode: "resizeTop";
  view: "week";
  id: number;
  minDuration: number;
  originTopMin: number;
  currentTopMin: number;
  bottomMinFixed: number;
  weekStart: Date;
  dayIdx: number;
};

type DragState =
  | DragMoveDay
  | DragMoveWeek
  | DragResizeBottomDay
  | DragResizeBottomWeek
  | DragResizeTopDay
  | DragResizeTopWeek;

function getMinutesFromPointer(container: HTMLDivElement, clientY: number) {
  const rect = container.getBoundingClientRect();
  const y = clientY - rect.top;
  const rawMin = clamp(Math.round(y / PX_PER_MIN), 0, TOTAL_MIN);
  return snap15(rawMin);
}
function findWeekColumnIndex(columns: (HTMLDivElement | null)[], clientX: number, clientY: number) {
  for (let i=0;i<columns.length;i++) {
    const el = columns[i];
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
      return i;
    }
  }
  return null;
}

/* ---------- Component ---------- */
export default function AppointmentsCalendar({ empresaId }: { empresaId?: number }) {
  const { token, usuario } = useAuth();
  const effEmpresaId = empresaId ?? usuario?.empresaId;

  const [current, setCurrent] = useState(() => new Date());
  const [events, setEvents] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // loader durante PUT
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const [createPrefill, setCreatePrefill] = useState<{ startISO?: string; durationMin?: number }>({});

  const [view, setView] = useState<ViewMode>("month");
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => getWeekStart(new Date()));

  const dayContainerRef = useRef<HTMLDivElement | null>(null);
  const weekColumnRefs = useRef<(HTMLDivElement | null)[]>([]);
  weekColumnRefs.current = [];

  const [drag, setDrag] = useState<DragState | null>(null);

  // matriz mes
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

  // semana actual
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

  /* ---------- Load appointments ---------- */
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

  /* ---------- DnD: mover ---------- */
  function beginDrag_day(ev: Appointment, containerEl: HTMLDivElement | null, dayDate: Date, e: React.MouseEvent) {
    if (!containerEl) return;
    e.preventDefault();
    const s = new Date(ev.startAt);
    const en = new Date(ev.endAt);
    const durationMin = Math.max(15, Math.round((en.getTime() - s.getTime())/60000));
    const startMin = minutesFromStart(s);
    const originMin = getMinutesFromPointer(containerEl, e.clientY);

    document.body.style.userSelect = "none";
    setDrag({
      mode: "move",
      view: "day",
      id: ev.id,
      durationMin,
      originMin,
      startMin,
      currentMin: startMin,
      dayDate
    });
  }
  function beginDrag_week(ev: Appointment, columns: (HTMLDivElement | null)[], weekStart: Date, currentDayIdx: number, e: React.MouseEvent) {
    e.preventDefault();
    const s = new Date(ev.startAt);
    const en = new Date(ev.endAt);
    const durationMin = Math.max(15, Math.round((en.getTime() - s.getTime())/60000));
    const startMin = minutesFromStart(s);
    let originMin = startMin;
    const el = columns[currentDayIdx];
    if (el) originMin = getMinutesFromPointer(el, e.clientY);

    document.body.style.userSelect = "none";
    setDrag({
      mode: "move",
      view: "week",
      id: ev.id,
      durationMin,
      originMin,
      startMin,
      currentMin: startMin,
      weekStart,
      originDayIdx: currentDayIdx,
      currentDayIdx
    });
  }

  /* ---------- Resize BOTTOM ---------- */
  function beginResize_day(ev: Appointment, containerEl: HTMLDivElement | null, dayDate: Date, e: React.MouseEvent) {
    if (!containerEl) return;
    e.preventDefault(); e.stopPropagation();
    const s = new Date(ev.startAt);
    const en = new Date(ev.endAt);
    const durationMin = Math.max(15, Math.round((en.getTime() - s.getTime())/60000));
    const startMin = minutesFromStart(s);
    const bottomMin = startMin + durationMin;
    const originBottomMin = getMinutesFromPointer(containerEl, e.clientY);

    document.body.style.userSelect = "none";
    setDrag({
      mode: "resize",
      view: "day",
      id: ev.id,
      durationMin,
      minDuration: 15,
      originBottomMin,
      currentBottomMin: bottomMin,
      startMinFixed: startMin,
      dayDate
    });
  }
  function beginResize_week(ev: Appointment, colEl: HTMLDivElement | null, weekStart: Date, dayIdx: number, e: React.MouseEvent) {
    if (!colEl) return;
    e.preventDefault(); e.stopPropagation();
    const s = new Date(ev.startAt);
    const en = new Date(ev.endAt);
    const durationMin = Math.max(15, Math.round((en.getTime() - s.getTime())/60000));
    const startMin = minutesFromStart(s);
    const bottomMin = startMin + durationMin;
    const originBottomMin = getMinutesFromPointer(colEl, e.clientY);

    document.body.style.userSelect = "none";
    setDrag({
      mode: "resize",
      view: "week",
      id: ev.id,
      durationMin,
      minDuration: 15,
      originBottomMin,
      currentBottomMin: bottomMin,
      startMinFixed: startMin,
      weekStart,
      dayIdx
    });
  }

  /* ---------- Resize TOP (nuevo) ---------- */
  function beginResizeTop_day(ev: Appointment, containerEl: HTMLDivElement | null, dayDate: Date, e: React.MouseEvent) {
    if (!containerEl) return;
    e.preventDefault(); e.stopPropagation();
    const s = new Date(ev.startAt);
    const en = new Date(ev.endAt);
    const durationMin = Math.max(15, Math.round((en.getTime() - s.getTime())/60000));
    const startMin = minutesFromStart(s);
    const bottomMinFixed = startMin + durationMin;
    const originTopMin = getMinutesFromPointer(containerEl, e.clientY);

    document.body.style.userSelect = "none";
    setDrag({
      mode: "resizeTop",
      view: "day",
      id: ev.id,
      minDuration: 15,
      originTopMin,
      currentTopMin: startMin,
      bottomMinFixed,
      dayDate
    });
  }
  function beginResizeTop_week(ev: Appointment, colEl: HTMLDivElement | null, weekStart: Date, dayIdx: number, e: React.MouseEvent) {
    if (!colEl) return;
    e.preventDefault(); e.stopPropagation();
    const s = new Date(ev.startAt);
    const en = new Date(ev.endAt);
    const durationMin = Math.max(15, Math.round((en.getTime() - s.getTime())/60000));
    const startMin = minutesFromStart(s);
    const bottomMinFixed = startMin + durationMin;
    const originTopMin = getMinutesFromPointer(colEl, e.clientY);

    document.body.style.userSelect = "none";
    setDrag({
      mode: "resizeTop",
      view: "week",
      id: ev.id,
      minDuration: 15,
      originTopMin,
      currentTopMin: startMin,
      bottomMinFixed,
      weekStart,
      dayIdx
    });
  }

  /* ---------- Global mouse handlers ---------- */
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!drag) return;

      if (drag.mode === "move") {
        if (drag.view === "day") {
          const container = dayContainerRef.current;
          if (!container) return;
          const pointerMin = getMinutesFromPointer(container, e.clientY);
          const deltaMin = pointerMin - drag.originMin;
          const newStartMin = clamp(snap15(drag.startMin + deltaMin), 0, TOTAL_MIN - drag.durationMin);
          setDrag(prev => prev && prev.mode==="move" && prev.view==="day" ? { ...prev, currentMin: newStartMin } : prev);
        } else {
          const idx = findWeekColumnIndex(weekColumnRefs.current, e.clientX, e.clientY);
          const colIdx = (idx ?? drag.currentDayIdx);
          const el = weekColumnRefs.current[colIdx];
          if (!el) return;

          const pointerMin = getMinutesFromPointer(el, e.clientY);
          const deltaMin = pointerMin - drag.originMin;
          const newStartMin = clamp(snap15(drag.startMin + deltaMin), 0, TOTAL_MIN - drag.durationMin);

          setDrag(prev =>
            prev && prev.mode==="move" && prev.view==="week"
              ? { ...prev, currentMin: newStartMin, currentDayIdx: colIdx }
              : prev
          );
        }
      } else if (drag.mode === "resize") {
        // BOTTOM
        if (drag.view === "day") {
          const container = dayContainerRef.current;
          if (!container) return;
          const pointerMin = getMinutesFromPointer(container, e.clientY);
          const rawBottom = snap15(pointerMin);
          const minBottom = drag.startMinFixed + drag.minDuration;
          const cappedBottom = clamp(rawBottom, minBottom, TOTAL_MIN);
          setDrag(prev =>
            prev && prev.mode==="resize" && prev.view==="day"
              ? { ...prev, currentBottomMin: cappedBottom, durationMin: cappedBottom - prev.startMinFixed }
              : prev
          );
        } else {
          const el = weekColumnRefs.current[drag.dayIdx];
          if (!el) return;
          const pointerMin = getMinutesFromPointer(el, e.clientY);
          const rawBottom = snap15(pointerMin);
          const minBottom = drag.startMinFixed + drag.minDuration;
          const cappedBottom = clamp(rawBottom, minBottom, TOTAL_MIN);
          setDrag(prev =>
            prev && prev.mode==="resize" && prev.view==="week"
              ? { ...prev, currentBottomMin: cappedBottom, durationMin: cappedBottom - prev.startMinFixed }
              : prev
          );
        }
      } else if (drag.mode === "resizeTop") {
        // TOP
        if (drag.view === "day") {
          const container = dayContainerRef.current;
          if (!container) return;
          const pointerMin = getMinutesFromPointer(container, e.clientY);
          const rawTop = snap15(pointerMin);
          const maxTop = drag.bottomMinFixed - drag.minDuration;
          const cappedTop = clamp(rawTop, 0, maxTop);
          setDrag(prev =>
            prev && prev.mode==="resizeTop" && prev.view==="day"
              ? { ...prev, currentTopMin: cappedTop }
              : prev
          );
        } else {
          const el = weekColumnRefs.current[drag.dayIdx];
          if (!el) return;
          const pointerMin = getMinutesFromPointer(el, e.clientY);
          const rawTop = snap15(pointerMin);
          const maxTop = drag.bottomMinFixed - drag.minDuration;
          const cappedTop = clamp(rawTop, 0, maxTop);
          setDrag(prev =>
            prev && prev.mode==="resizeTop" && prev.view==="week"
              ? { ...prev, currentTopMin: cappedTop }
              : prev
          );
        }
      }
    }

    async function onUp() {
      if (!drag) return;

      const fmtCO = (iso?: string) => iso ? new Date(iso).toLocaleString("es-CO",{ dateStyle:"medium", timeStyle:"short" }) : "";

      const currentEv = events.find(x=>x.id===drag.id);
      if (!currentEv) { setDrag(null); document.body.style.userSelect = ""; return; }

      if (drag.mode === "move") {
        let baseDate: Date;
        if (drag.view === "day") {
          baseDate = new Date(drag.dayDate);
        } else {
          baseDate = new Date(drag.weekStart);
          baseDate.setDate(baseDate.getDate() + (drag.currentDayIdx ?? drag.originDayIdx));
        }
        baseDate.setHours(START_HOUR,0,0,0);
        baseDate.setMinutes(drag.currentMin);

        const y = baseDate.getFullYear();
        const m = String(baseDate.getMonth()+1).padStart(2,"0");
        const ddd = String(baseDate.getDate()).padStart(2,"0");
        const HH = String(baseDate.getHours()).padStart(2,"0");
        const MM = String(baseDate.getMinutes()).padStart(2,"0");

        const newLocal = `${y}-${m}-${ddd}T${HH}:${MM}`;
        const { iso: startAtISO, dateLocal } = localToISOWithOffset(newLocal, -300);
        const endLocal = new Date(dateLocal.getTime() + drag.durationMin * 60_000);
        const endLocalStr = `${endLocal.getFullYear()}-${String(endLocal.getMonth()+1).padStart(2,"0")}-${String(endLocal.getDate()).padStart(2,"0")}T${String(endLocal.getHours()).padStart(2,"0")}:${String(endLocal.getMinutes()).padStart(2,"0")}`;
        const { iso: endAtISO } = localToISOWithOffset(endLocalStr, -300);

        const oldLbl  = `${fmtCO(currentEv.startAt)} – ${fmtCO(currentEv.endAt)}`;
        const newLbl  = `${fmtCO(startAtISO)} – ${fmtCO(endAtISO)}`;

        document.body.style.userSelect = "";
        setDrag(null);

        const client = currentEv.customerName ?? "Cliente";
        const service = currentEv.serviceName ? ` · ${currentEv.serviceName}` : "";
        const html = `
          <div class="grid gap-3">
            <div class="rounded-xl p-3 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-transparent border border-white/10">
              <div class="text-sm text-white/80">Cita</div>
              <div class="text-base font-semibold">${client}${service}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="rounded-lg border border-white/10 p-3 bg-white/5">
                <div class="text-[11px] uppercase tracking-wide text-white/60 mb-1">Antes</div>
                <div class="text-sm font-medium">${oldLbl}</div>
              </div>
              <div class="rounded-lg border border-indigo-400/40 p-3 bg-indigo-500/10 ring-1 ring-indigo-400/40">
                <div class="text-[11px] uppercase tracking-wide text-indigo-200 mb-1">Después</div>
                <div class="text-sm font-semibold text-indigo-100">${newLbl}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 border border-white/15">Reprogramación</span>
              <span class="text-white/60 text-xs">Se conserva la misma duración</span>
            </div>
          </div>
        `;
        const confirm = await DarkSwal.fire({
          icon: "question",
          title: "¿Confirmar reprogramación?",
          html,
          showCancelButton: true,
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
        });
        if (!confirm.isConfirmed) return;

        try {
          setSaving(true);
          await updateAppointment(currentEv.id, { startAt: startAtISO, endAt: endAtISO });
        } finally {
          setSaving(false);
        }
      } else if (drag.mode === "resize") {
        // BOTTOM: cambia endAt
        let baseDate: Date;
        if (drag.view === "day") {
          baseDate = new Date(drag.dayDate);
        } else {
          baseDate = new Date(drag.weekStart);
          baseDate.setDate(baseDate.getDate() + drag.dayIdx);
        }
        baseDate.setHours(START_HOUR,0,0,0);
        baseDate.setMinutes(drag.startMinFixed);

        const startLocalStr = `${baseDate.getFullYear()}-${String(baseDate.getMonth()+1).padStart(2,"0")}-${String(baseDate.getDate()).padStart(2,"0")}T${String(baseDate.getHours()).padStart(2,"0")}:${String(baseDate.getMinutes()).padStart(2,"0")}`;
        const { iso: startAtISO, dateLocal } = localToISOWithOffset(startLocalStr, -300);

        const endLocal = new Date(dateLocal.getTime() + drag.durationMin * 60_000);
        const endLocalStr = `${endLocal.getFullYear()}-${String(endLocal.getMonth()+1).padStart(2,"0")}-${String(endLocal.getDate()).padStart(2,"0")}T${String(endLocal.getHours()).padStart(2,"0")}:${String(endLocal.getMinutes()).padStart(2,"0")}`;
        const { iso: endAtISO } = localToISOWithOffset(endLocalStr, -300);

        const fmtCO = (iso?: string) => iso ? new Date(iso).toLocaleString("es-CO",{ dateStyle:"medium", timeStyle:"short" }) : "";
        const oldLbl  = `${fmtCO(currentEv.startAt)} – ${fmtCO(currentEv.endAt)}`;
        const newLbl  = `${fmtCO(startAtISO)} – ${fmtCO(endAtISO)}`;

        document.body.style.userSelect = "";
        setDrag(null);

        const client = currentEv.customerName ?? "Cliente";
        const service = currentEv.serviceName ? ` · ${currentEv.serviceName}` : "";
        const html = `
          <div class="grid gap-3">
            <div class="rounded-xl p-3 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-transparent border border-white/10">
              <div class="text-sm text-white/80">Cita</div>
              <div class="text-base font-semibold">${client}${service}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="rounded-lg border border-white/10 p-3 bg-white/5">
                <div class="text-[11px] uppercase tracking-wide text-white/60 mb-1">Antes</div>
                <div class="text-sm font-medium">${oldLbl}</div>
              </div>
              <div class="rounded-lg border border-indigo-400/40 p-3 bg-indigo-500/10 ring-1 ring-indigo-400/40">
                <div class="text-[11px] uppercase tracking-wide text-indigo-200 mb-1">Después</div>
                <div class="text-sm font-semibold text-indigo-100">${newLbl}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 border border-white/15">Cambio de duración</span>
              <span class="text-white/60 text-xs">${drag.durationMin} min totales</span>
            </div>
          </div>
        `;
        const confirm = await DarkSwal.fire({
          icon: "question",
          title: "¿Aplicar nueva duración?",
          html,
          showCancelButton: true,
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
        });
        if (!confirm.isConfirmed) return;

        try {
          setSaving(true);
          await updateAppointment(currentEv.id, { startAt: startAtISO, endAt: endAtISO });
        } finally {
          setSaving(false);
        }
      } else if (drag.mode === "resizeTop") {
        // TOP: cambia startAt y mantiene fijo el end (final fijo)
        let baseDate: Date;
        if (drag.view === "day") {
          baseDate = new Date(drag.dayDate);
        } else {
          baseDate = new Date(drag.weekStart);
          baseDate.setDate(baseDate.getDate() + drag.dayIdx);
        }
        // el final fijo:
        const endBase = new Date(baseDate);
        endBase.setHours(START_HOUR,0,0,0);
        endBase.setMinutes(drag.bottomMinFixed);

        const startBase = new Date(baseDate);
        startBase.setHours(START_HOUR,0,0,0);
        startBase.setMinutes(drag.currentTopMin);

        const startLocalStr = `${startBase.getFullYear()}-${String(startBase.getMonth()+1).padStart(2,"0")}-${String(startBase.getDate()).padStart(2,"0")}T${String(startBase.getHours()).padStart(2,"0")}:${String(startBase.getMinutes()).padStart(2,"0")}`;
        const endLocalStr   = `${endBase.getFullYear()}-${String(endBase.getMonth()+1).padStart(2,"0")}-${String(endBase.getDate()).padStart(2,"0")}T${String(endBase.getHours()).padStart(2,"0")}:${String(endBase.getMinutes()).padStart(2,"0")}`;

        const { iso: startAtISO } = localToISOWithOffset(startLocalStr, -300);
        const { iso: endAtISO }   = localToISOWithOffset(endLocalStr, -300);

        const fmtCO = (iso?: string) => iso ? new Date(iso).toLocaleString("es-CO",{ dateStyle:"medium", timeStyle:"short" }) : "";
        const oldLbl  = `${fmtCO(currentEv.startAt)} – ${fmtCO(currentEv.endAt)}`;
        const newLbl  = `${fmtCO(startAtISO)} – ${fmtCO(endAtISO)}`;

        document.body.style.userSelect = "";
        setDrag(null);

        const client = currentEv.customerName ?? "Cliente";
        const service = currentEv.serviceName ? ` · ${currentEv.serviceName}` : "";
        const html = `
          <div class="grid gap-3">
            <div class="rounded-xl p-3 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-transparent border border-white/10">
              <div class="text-sm text-white/80">Cita</div>
              <div class="text-base font-semibold">${client}${service}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="rounded-lg border border-white/10 p-3 bg-white/5">
                <div class="text-[11px] uppercase tracking-wide text-white/60 mb-1">Antes</div>
                <div class="text-sm font-medium">${oldLbl}</div>
              </div>
              <div class="rounded-lg border border-indigo-400/40 p-3 bg-indigo-500/10 ring-1 ring-indigo-400/40">
                <div class="text-[11px] uppercase tracking-wide text-indigo-200 mb-1">Después</div>
                <div class="text-sm font-semibold text-indigo-100">${newLbl}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 border border-white/15">Inicio modificado</span>
              <span class="text-white/60 text-xs">El fin se mantuvo fijo</span>
            </div>
          </div>
        `;
        const confirm = await DarkSwal.fire({
          icon: "question",
          title: "¿Aplicar cambio de inicio?",
          html,
          showCancelButton: true,
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
        });
        if (!confirm.isConfirmed) return;

        try {
          setSaving(true);
          await updateAppointment(currentEv.id, { startAt: startAtISO, endAt: endAtISO });
        } finally {
          setSaving(false);
        }
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, events]); // eslint-disable-line

  /* ---------- UI ---------- */
  const monthTitle = current.toLocaleString("es-CO",{month:"long", year:"numeric"});
  const weekTitle = (() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const sameMonth = start.getMonth() === end.getMonth();
    const opts = { day:"numeric" } as const;
    theStart: {
    }
    const s = start.toLocaleDateString("es-CO", sameMonth ? opts : { ...opts, month:"short" });
    const e = end.toLocaleDateString("es-CO", { day:"numeric", month:"short" });
    const y = end.getFullYear();
    return `${s} – ${e} ${y}`;
  })();

  /* ---------- helpers de creación con doble clic ---------- */
  const openCreateAt = (date: Date, durationMin = 30) => {
    const y = date.getFullYear(), m = date.getMonth()+1, d = date.getDate();
    const H = String(date.getHours()).padStart(2,"0");
    const M = String(date.getMinutes()).padStart(2,"0");
    const startISO = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}T${H}:${M}`;
    setCreatePrefill({ startISO, durationMin });
    setShowCreate(true);
  };

  return (
    <div className="w-full h-full">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
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

              <div className="rounded-xl px-3 py-1.5 text-base font-semibold capitalize">
                {view === "month" && monthTitle}
                {view === "week"  && weekTitle}
                {view === "day"   && selectedDay.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </div>

              <Button variant="outline" onClick={()=>{
                const now=new Date();
                setCurrent(new Date());
                setSelectedDay(now);
                setSelectedWeekStart(getWeekStart(now));
              }}>
                Hoy
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant={view==='month'?'primary':'outline'} onClick={()=>setView('month')}>Mes</Button>
              <Button variant={view==='week'?'primary':'outline'}  onClick={()=>{
                setSelectedWeekStart(getWeekStart(selectedDay));
                setView('week');
              }}>Semana</Button>
              <Button variant={view==='day'?'primary':'outline'}   onClick={()=>setView('day')}>Día</Button>
              <Button onClick={()=>{ setCreatePrefill({}); setShowCreate(true); }}>
                <Plus className="h-4 w-4"/> Nueva cita
              </Button>
            </div>
          </div>
        </div>

        {/* Cabeceras mes */}
        {view === 'month' && (
          <div className="mb-2 grid grid-cols-7 gap-3 text-xs font-medium text-white/80">
            {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((w)=> <div key={w} className="px-1">{w}</div>)}
          </div>
        )}

        {/* Grid Mes */}
        {view === 'month' && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
            {daysMonth.map((day, i) => {
              const k = fmtKey(day);
              const inMonth = day.getMonth() === current.getMonth();
              const count = (eventsByDay[k] || []).length;
              const isToday = isSameYMD(day, new Date());
              const tone = countTone(count);

              return (
                <div
                  key={i}
                  onClick={() => { setSelectedDay(day); setSelectedWeekStart(getWeekStart(day)); setView('day'); }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    const base = new Date(day);
                    base.setHours(9, 0, 0, 0);
                    const y = base.getFullYear();
                    const m = String(base.getMonth() + 1).padStart(2, "0");
                    const d = String(base.getDate()).padStart(2, "0");
                    const H = String(base.getHours()).padStart(2, "0");
                    const M = String(base.getMinutes()).padStart(2, "0");
                    const startISO = `${y}-${m}-${d}T${H}:${M}`;
                    setCreatePrefill({ startISO, durationMin: 30 });
                    setShowCreate(true);
                  }}
                  className={cx(
                    "relative min-h-[150px] rounded-2xl overflow-hidden cursor-pointer group",
                    "border border-white/10 bg-gradient-to-b from-slate-950 to-slate-800",
                    "hover:border-white/20 transition-colors",
                    !inMonth && "opacity-60",
                    isToday && "ring-2 ring-indigo-400/70"
                  )}
                  title={`${count} ${count === 1 ? "cita" : "citas"}`}
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div className={cx(
                      "absolute -top-24 -right-24 h-56 w-56 rounded-full blur-2xl opacity-80",
                      "bg-gradient-to-br",
                      tone.glow
                    )}/>
                  </div>
                  <div className="relative z-10 flex items-start justify-between p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold leading-none select-none text-white">
                        {day.getDate()}
                      </span>
                      {!inMonth && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/10">
                          fuera
                        </span>
                      )}
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                          hoy
                        </span>
                      )}
                    </div>
                    <div
  className={cx(
    "inline-flex items-center gap-1.5 rounded-full px-3 h-7 text-[11px] font-semibold",
    "backdrop-blur-md ring-1 shadow-lg shadow-black/40",
    tone.badge
  )}
>
  <span className={cx("h-2 w-2 rounded-full", tone.dot)} />
  <span className="leading-none tabular-nums">{count}</span>
  <span className="hidden sm:inline leading-none opacity-85">
    {count === 1 ? "cita" : "citas"}
  </span>
</div>

                  </div>
                  <div className="relative z-10 mx-3 border-t border-white/10" />
                  <div className="relative z-10 p-3 pt-2 text-[11px] text-white/60">
                    <div className="flex items-center justify-between">
                      <span className="opacity-80">Doble clic para agendar</span>
                      <div className="flex -space-x-1.5">
  {[...Array(Math.min(count, 6))].map((_, idx) => (
    <span
      key={idx}
      className={cx(
        "h-2 w-2 rounded-full border border-white/40 shadow-sm",
        count <= 2
          ? "bg-emerald-400"
          : count <= 5
          ? "bg-sky-400"
          : "bg-rose-400"
      )}
    />
  ))}
</div>

                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute inset-0 bg-white/5" />
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
                  const hiliteMove = drag?.mode === "move" && drag.view === "week" && drag.currentDayIdx === i;
                  const hiliteResizeB = drag?.mode === "resize" && drag.view === "week" && drag.dayIdx === i;
                  const hiliteResizeT = drag?.mode === "resizeTop" && drag.view === "week" && drag.dayIdx === i;
                  return (
                    <div key={i}
                      className={cx(
                        "px-2 py-1 rounded-lg border bg-white/5 capitalize text-center transition",
                        "border-white/10",
                        isToday && "ring-2 ring-indigo-400/70",
                        (hiliteMove || hiliteResizeB || hiliteResizeT) && "border-indigo-400/40 bg-indigo-500/10"
                      )}
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
              <div
                ref={dayContainerRef}
                className="relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
                style={{ height: TOTAL_MIN * PX_PER_MIN }}
                onDoubleClick={(e)=>{
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const minutes = Math.max(0, Math.min(TOTAL_MIN, Math.round(y / PX_PER_MIN)));
                  const start = new Date(selectedDay);
                  start.setHours(START_HOUR,0,0,0);
                  start.setMinutes(start.getMinutes() + minutes);
                  start.setMinutes(Math.round(start.getMinutes()/15)*15, 0, 0);
                  openCreateAt(start, 30);
                }}
                title="Doble clic para agendar"
              >
                {hourTicks.map((_,i)=>(
                  <div key={i}
                    className={cx("absolute left-0 right-0 border-t", i===0 ? "border-white/20" : "border-white/10")}
                    style={{ top: ((i*60) * PX_PER_MIN) }}
                  />
                ))}

                {(() => {
                  const layout = buildDayLayout(eventsForSelectedDay);
                  const GAP_PX = 4;
                  return eventsForSelectedDay.map(ev=>{
                    const s = new Date(ev.startAt);
                    const e = new Date(ev.endAt);
                    const box = layout[ev.id];
                    const left = `calc(${box.leftPct}% + ${GAP_PX}px)`;
                    const width = `calc(${box.widthPct}% - ${GAP_PX * 2}px)`;
                    const isMoving = drag?.mode==="move" && drag.id===ev.id && drag.view==="day";
                    const isResizingB = drag?.mode==="resize" && drag.id===ev.id && drag.view==="day";
                    const isResizingT = drag?.mode==="resizeTop" && drag.id===ev.id && drag.view==="day";
                    const topPx = (isMoving ? drag.currentMin : Math.round(box.top / PX_PER_MIN)) * PX_PER_MIN;

                    let heightPx = box.height;
                    if (isResizingB) heightPx = Math.max(24, drag.durationMin * PX_PER_MIN);
                    if (isResizingT) {
                      const bottomMin = minutesFromStart(e);
                      const topMin = drag.currentTopMin;
                      heightPx = Math.max(24, (bottomMin - topMin) * PX_PER_MIN);
                    }

                    const startForLabel = new Date(selectedDay);
                    startForLabel.setHours(START_HOUR,0,0,0);
                    startForLabel.setMinutes(isResizingT ? drag.currentTopMin : (topPx / PX_PER_MIN));
                    const endForLabel = new Date(startForLabel);
                    endForLabel.setMinutes(isResizingB ? (startForLabel.getMinutes() + drag.durationMin) : Math.round(heightPx / PX_PER_MIN) + startForLabel.getMinutes());

                    return (
                      <div
                        key={ev.id}
                        className={cx(
                          "absolute rounded-xl border text-xs shadow bg-violet-600/20 border-violet-500/40 text-white backdrop-blur select-none",
                          "cursor-grab active:cursor-grabbing",
                          (isMoving || isResizingB || isResizingT) && "ring-2 ring-indigo-400/70 z-20"
                        )}
                        style={{ top: isResizingT ? drag.currentTopMin * PX_PER_MIN : topPx, height: heightPx, left, width }}
                        title={spanLabel(s,e)}
                        onMouseDown={(e)=>{ 
                          if (isNoDragTarget(e.target)) return; 
                          beginDrag_day(ev, dayContainerRef.current, selectedDay, e);
                        }}
                        
                      >
                        {/* Handle superior (resizeTop) */}
                        <div
                          onMouseDown={(e)=>beginResizeTop_day(ev, dayContainerRef.current, selectedDay, e)}
                          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize"
                          title="Arrastra para cambiar la hora de inicio (fin fijo)"
                        >
                          <div className="mx-auto mb-0.5 h-1 w-12 rounded-full bg-white/40 hover:bg-white/70" />
                        </div>

                        <div className="flex items-center justify-between px-2 py-1">
                          <div className="truncate">
                            <span className="mr-2 inline-flex items-center gap-1 text-[11px] opacity-90">
                              <Clock className="h-3 w-3"/>{spanLabel(startForLabel, endForLabel)}
                            </span>
                            <strong>{ev.customerName}</strong>
                            {ev.serviceName ? <> · <span className="opacity-90">{ev.serviceName}</span></> : null}
                          </div>
                          <div className="ml-2 shrink-0 flex gap-1">
                          <button data-nodrag title="Editar" onClick={(evt)=>{ evt.stopPropagation(); setEditing(ev); }}>
  <Edit className="h-3.5 w-3.5 text-indigo-300"/>
</button>
<button data-nodrag title="Eliminar" onClick={(evt)=>{ evt.stopPropagation(); deleteAppointment(ev.id); }}>
  <Trash className="h-3.5 w-3.5 text-red-300"/>
</button>

                          </div>
                        </div>
                        {ev.notas && <div className="px-2 pb-1 pr-12 opacity-80 line-clamp-2">{ev.notas}</div>}

                        {/* Handle inferior (resize bottom) */}
                        <div
                          onMouseDown={(e)=>beginResize_day(ev, dayContainerRef.current, selectedDay, e)}
                          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
                          title="Arrastra para cambiar duración"
                        >
                          <div className="mx-auto mt-0.5 h-1 w-12 rounded-full bg-white/40 hover:bg-white/60" />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Vista Semana (con ghost y resize top/bottom) */}
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
                const layout = buildDayLayout(dayEvents);
                const GAP_PX = 4;
                const hiliteMove = drag?.mode === "move" && drag.view === "week" && drag.currentDayIdx === idx;
                const hiliteResizeB = drag?.mode === "resize" && drag.view === "week" && drag.dayIdx === idx;
                const hiliteResizeT = drag?.mode === "resizeTop" && drag.view === "week" && drag.dayIdx === idx;

                return (
                  <div
                    key={idx}
                    ref={(el)=>{ weekColumnRefs.current[idx] = el }}
                    className={cx(
                      "relative rounded-2xl border overflow-hidden transition",
                      "border-white/10 bg-white/5",
                      (hiliteMove || hiliteResizeB || hiliteResizeT) && "border-indigo-400/40 bg-indigo-500/10"
                    )}
                    style={{ height: TOTAL_MIN * PX_PER_MIN }}
                    onDoubleClick={(e)=>{
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const minutes = Math.max(0, Math.min(TOTAL_MIN, Math.round(y / PX_PER_MIN)));
                      const start = new Date(day);
                      start.setHours(START_HOUR,0,0,0);
                      start.setMinutes(start.getMinutes() + minutes);
                      start.setMinutes(Math.round(start.getMinutes()/15)*15, 0, 0);
                      openCreateAt(start, 30);
                    }}
                    title="Doble clic para agendar"
                  >
                    {/* líneas horarias */}
                    {hourTicks.map((_,i)=>(
                      <div key={i}
                        className={cx("absolute left-0 right-0 border-t", i===0 ? "border-white/20" : "border-white/10")}
                        style={{ top: ((i*60) * PX_PER_MIN) }}
                      />
                    ))}

                    {/* eventos */}
                    {dayEvents.map(ev=>{
                      const s = new Date(ev.startAt);
                      const e = new Date(ev.endAt);
                      const box = layout[ev.id];
                      const left = `calc(${box.leftPct}% + ${GAP_PX}px)`;
                      const width = `calc(${box.widthPct}% - ${GAP_PX * 2}px)`;

                      const thisIdx = idx;
                      const isMoving = drag?.mode==="move" && drag.id===ev.id && drag.view==="week";
                      const isResizingB = drag?.mode==="resize" && drag.id===ev.id && drag.view==="week" && drag.dayIdx === thisIdx;
                      const isResizingT = drag?.mode==="resizeTop" && drag.id===ev.id && drag.view==="week" && drag.dayIdx === thisIdx;

                      const topMin = isMoving && drag.currentDayIdx === thisIdx
                        ? drag.currentMin
                        : Math.round(box.top / PX_PER_MIN);

                      let heightMin = Math.max(15, Math.round(box.height / PX_PER_MIN));
                      if (isResizingB) heightMin = Math.max(15, drag.durationMin);
                      if (isResizingT) {
                        const bottomMin = minutesFromStart(e);
                        heightMin = Math.max(15, bottomMin - drag.currentTopMin);
                      }

                      const topPx = (isResizingT ? drag.currentTopMin : topMin) * PX_PER_MIN;
                      const heightPx = heightMin * PX_PER_MIN;

                      const startForLabel = new Date(day);
                      startForLabel.setHours(START_HOUR,0,0,0);
                      startForLabel.setMinutes(isResizingT ? drag.currentTopMin : topMin);
                      const endForLabel = new Date(startForLabel);
                      endForLabel.setMinutes(startForLabel.getMinutes() + heightMin);

                      return (
                        <div
                          key={ev.id}
                          className={cx(
                            "absolute rounded-xl border text-[11px] shadow bg-indigo-600/20 border-indigo-400/40 text-white backdrop-blur select-none",
                            "cursor-grab active:cursor-grabbing",
                            (isMoving || isResizingB || isResizingT) && "ring-2 ring-indigo-400/70 z-20"
                          )}
                          style={{ top: topPx, height: heightPx, left, width }}
                          title={spanLabel(s,e)}
                          onMouseDown={(e)=>{ 
                            if (isNoDragTarget(e.target)) return; 
                            beginDrag_week(ev, weekColumnRefs.current, selectedWeekStart, thisIdx, e);
                          }}
                          
                        >
                          {/* Handle superior (resizeTop) */}
                          <div
                            onMouseDown={(e)=>beginResizeTop_week(ev, weekColumnRefs.current[thisIdx], selectedWeekStart, thisIdx, e)}
                            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize"
                            title="Arrastra para cambiar la hora de inicio (fin fijo)"
                          >
                            <div className="mx-auto mb-0.5 h-1 w-12 rounded-full bg-white/40 hover:bg-white/70" />
                          </div>

                          <div className="flex items-center justify-between px-2 py-1">
                            <div className="truncate">
                              <strong>{ev.customerName}</strong>
                              {ev.serviceName ? <> · <span className="opacity-90">{ev.serviceName}</span></> : null}
                            </div>
                            <div className="ml-1 shrink-0 flex gap-1">
                            <button data-nodrag title="Editar" onClick={(evt)=>{ evt.stopPropagation(); setEditing(ev); }}>
  <Edit className="h-3.5 w-3.5 text-indigo-200"/>
</button>
<button data-nodrag title="Eliminar" onClick={(evt)=>{ evt.stopPropagation(); deleteAppointment(ev.id); }}>
  <Trash className="h-3.5 w-3.5 text-red-300"/>
</button>

                            </div>
                          </div>
                          <div className="px-2 pb-1 opacity-80">{spanLabel(startForLabel, endForLabel)}</div>

                          {/* Handle inferior (resize bottom) */}
                          <div
                            onMouseDown={(e)=>beginResize_week(ev, weekColumnRefs.current[thisIdx], selectedWeekStart, thisIdx, e)}
                            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
                            title="Arrastra para cambiar duración"
                          >
                            <div className="mx-auto mt-0.5 h-1 w-12 rounded-full bg-white/40 hover:bg-white/70" />
                          </div>
                        </div>
                      );
                    })}

                    {/* GHOST mover entre días */}
                    {drag?.mode === "move" && drag.view === "week" && drag.currentDayIdx === idx && (
                      <div
                        className="absolute left-1 right-1 rounded-xl border-2 border-dashed border-indigo-300/70 bg-indigo-300/10 text-white pointer-events-none shadow-lg animate-pulse"
                        style={{ top: drag.currentMin * PX_PER_MIN, height: Math.max(24, drag.durationMin * PX_PER_MIN) }}
                      >
                        <div className="px-2 py-1 text-[11px] font-medium opacity-90">
                          {(() => {
                            const start = new Date(day);
                            start.setHours(START_HOUR,0,0,0);
                            start.setMinutes(drag.currentMin);
                            const end = new Date(start);
                            end.setMinutes(start.getMinutes() + drag.durationMin);
                            return spanLabel(start, end);
                          })()}
                        </div>
                      </div>
                    )}

                    {/* GHOST resize bottom */}
                    {drag?.mode === "resize" && drag.view === "week" && drag.dayIdx === idx && (
                      <div
                        className="absolute left-1 right-1 rounded-xl border-2 border-dashed border-indigo-300/70 bg-indigo-300/10 text-white pointer-events-none shadow-lg animate-pulse"
                        style={{ top: drag.startMinFixed * PX_PER_MIN, height: Math.max(24, drag.durationMin * PX_PER_MIN) }}
                      >
                        <div className="px-2 py-1 text-[11px] font-medium opacity-90">
                          {(() => {
                            const start = new Date(day);
                            start.setHours(START_HOUR,0,0,0);
                            start.setMinutes(drag.startMinFixed);
                            const end = new Date(start);
                            end.setMinutes(start.getMinutes() + drag.durationMin);
                            return spanLabel(start, end);
                          })()}
                        </div>
                      </div>
                    )}

                    {/* GHOST resize top */}
                    {drag?.mode === "resizeTop" && drag.view === "week" && drag.dayIdx === idx && (
                      <div
                        className="absolute left-1 right-1 rounded-xl border-2 border-dashed border-indigo-300/70 bg-indigo-300/10 text-white pointer-events-none shadow-lg animate-pulse"
                        style={{ top: drag.currentTopMin * PX_PER_MIN, height: Math.max(24, (drag.bottomMinFixed - drag.currentTopMin) * PX_PER_MIN) }}
                      >
                        <div className="px-2 py-1 text-[11px] font-medium opacity-90">
                          {(() => {
                            const start = new Date(day);
                            start.setHours(START_HOUR,0,0,0);
                            start.setMinutes(drag.currentTopMin);
                            const end = new Date(day);
                            end.setHours(START_HOUR,0,0,0);
                            end.setMinutes(drag.bottomMinFixed);
                            return spanLabel(start, end);
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Loading overlay de carga inicial */}
      {loading && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/20 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl bg-zinc-900 px-4 py-3 text-white shadow-xl border border-white/10">
            <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Cargando citas…</div>
          </motion.div>
        </div>
      )}

      {/* Loader durante PUT de reprogramación/duración/inicio */}
      {saving && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl bg-zinc-900 px-4 py-3 text-white shadow-xl border border-white/10">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Guardando cambios…
            </div>
          </motion.div>
        </div>
      )}

      {/* Crear cita */}
      <Dialog open={showCreate} onClose={()=>setShowCreate(false)}>
        <CreateForm
          initialStartISO={createPrefill.startISO}
          initialDurationMin={createPrefill.durationMin ?? 30}
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
  initialStartISO,
  initialDurationMin = 30,
  onSave, onCancel
}:{
  initialStartISO?: string;
  initialDurationMin?: number;
  onSave:(d:{name:string;phone:string;service:string;sede?:string;provider?:string;startISO:string;durationMin?:number;notes?:string;})=>Promise<void>|void;
  onCancel:()=>void;
}) {
  const [form, setForm] = useState({
    name:"", phone:"", service:"", sede:"", provider:"",
    startISO: initialStartISO ?? "", durationMin: initialDurationMin, notes:""
  });

  useEffect(()=>{ setForm(f=>({ ...f, startISO: initialStartISO ?? f.startISO, durationMin: initialDurationMin })); }, [initialStartISO, initialDurationMin]);

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
  const [start,setStart] = useState(() => isoToLocalYMDHM(appt.startAt, -300));
  const [notes,setNotes] = useState(appt.notas ?? "");

  return (
    <form
      onSubmit={async (e)=>{ e.preventDefault(); await onSave({
        customerName:name, customerPhone:phone, serviceName:service,
        startAt:start,
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
