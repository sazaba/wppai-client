"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Plus,
  Clock, User, Check, X, Edit, Trash
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext"; // ⬅️ ajusta la ruta si difiere

/* ---------- helpers ---------- */
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const fmtKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const hhmm = (d: Date) => new Intl.DateTimeFormat("es-CO",{hour:"2-digit",minute:"2-digit",hour12:false}).format(d);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/** Convierte un string `YYYY-MM-DDTHH:mm` (de <input type="datetime-local" />)
 * a un ISO con offset fijo, ej: -05:00 (America/Bogota no tiene DST).
 * También retorna el Date “local” equivalente por si necesitas sumar duración.
 */
function localToISOWithOffset(local: string, offsetMinutes = -300): { iso: string; dateLocal: Date } {
  // local: "2025-09-30T10:10"
  // construimos un Date como “local puro”
  const [y, m, rest] = local.split("-");
  const [d, hm] = (rest || "").split("T");
  const [H, M] = (hm || "").split(":");
  const dateLocal = new Date(
    Number(y), Number(m) - 1, Number(d),
    Number(H || 0), Number(M || 0), 0, 0
  );
  // offset
  const sign = offsetMinutes <= 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  const oh = String(Math.floor(abs / 60)).padStart(2, "0");
  const om = String(abs % 60).padStart(2, "0");
  const tz = `${sign}${oh}:${om}`;
  // componemos ISO manual usando los componentes “locales”
  const yyyy = dateLocal.getFullYear();
  const MM = String(dateLocal.getMonth() + 1).padStart(2, "0");
  const dd = String(dateLocal.getDate()).padStart(2, "0");
  const HH = String(dateLocal.getHours()).padStart(2, "0");
  const mm = String(dateLocal.getMinutes()).padStart(2, "0");
  const ss = "00";
  return { iso: `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}${tz}`, dateLocal };
}

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
  startAt: string; // ISO con offset
  endAt: string;   // ISO con offset
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

function qs(params: Record<string, any>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.append(k, String(v));
  });
  return u.toString();
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

  // matrix 7x6 empezando en lunes
  const days = useMemo(() => {
    const first = new Date(current.getFullYear(), current.getMonth(), 1);
    const mondayStart = new Date(first);
    const w = first.getDay(); // 0 dom - 6 sab
    const diff = (w === 0 ? -6 : 1) - w;
    mondayStart.setDate(first.getDate() + diff);
    return Array.from({length:42},(_,i)=> {
      const d = new Date(mondayStart);
      d.setDate(mondayStart.getDate()+i);
      d.setHours(0,0,0,0);
      return d;
    });
  },[current]);

  const eventsByDay = useMemo(()=>{
    const map: Record<string, Appointment[]> = {};
    for (const e of events) {
      const k = fmtKey(new Date(e.startAt));
      (map[k] ||= []).push(e);
    }
    for (const k of Object.keys(map)) map[k].sort((a,b)=>+new Date(a.startAt)-+new Date(b.startAt));
    return map;
  },[events]);

  const week = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

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

  /* ---------- CRUD wired to backend ---------- */
  async function addAppointment(data: {
    name: string; phone: string;
    service: string; sede?: string; provider?: string;
    startISO: string; durationMin?: number; notes?: string;
  }) {
    if (!effEmpresaId || !token) return;

    // El input datetime-local da "YYYY-MM-DDTHH:mm" sin TZ → lo serializamos con -05:00
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
      startAt: startAtISO, // << con offset -05:00
      endAt: endAtISO,     // << con offset -05:00
      timezone: "America/Bogota",
      // sedeId, serviceId, providerId → cuando tengas catálogos reales
    };

    const created = await api<Appointment>(`/api/appointments?${qs({ empresaId: effEmpresaId })}`, {
      method: "POST",
      body: JSON.stringify(body),
    }, token);

    setEvents((prev) => [...prev, created]);
  }

  async function updateAppointment(id: number, patch: Partial<Appointment>) {
    if (!effEmpresaId || !token) return;
    const updated = await api<Appointment>(`/api/appointments/${id}?${qs({ empresaId: effEmpresaId })}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }, token);
    setEvents(prev => prev.map(e => e.id === id ? updated : e));
  }

  async function deleteAppointment(id: number) {
    if (!effEmpresaId || !token) return;
    await api<{ok:true}>(`/api/appointments/${id}?${qs({ empresaId: effEmpresaId })}`, { method: "DELETE" }, token);
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div className="w-full h-full">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
        {/* Header surface */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" aria-label="Mes anterior"
                onClick={()=>setCurrent(new Date(current.getFullYear(), current.getMonth()-1, 1))}>
                <ChevronLeft className="h-4 w-4"/>
              </Button>
              <Button variant="ghost" aria-label="Mes siguiente"
                onClick={()=>setCurrent(new Date(current.getFullYear(), current.getMonth()+1, 1))}>
                <ChevronRight className="h-4 w-4"/>
              </Button>
              <div className="rounded-xl px-3 py-1.5 text-base font-semibold">
                {current.toLocaleString("es-CO",{month:"long", year:"numeric"})}
              </div>
              <Button variant="outline" onClick={()=>setCurrent(new Date())}>Hoy</Button>
            </div>
            <div>
              <Button onClick={()=>setShowCreate(true)}>
                <Plus className="h-4 w-4"/> Nueva cita
              </Button>
            </div>
          </div>
        </div>

        {/* Weekdays */}
        <div className="mb-2 grid grid-cols-7 gap-3 text-xs font-medium text-white/80">
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((w)=> <div key={w} className="px-1">{w}</div>)}
        </div>

        {/* Grid */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {days.map((day,i)=>{
            const k = fmtKey(day);
            const inMonth = day.getMonth() === current.getMonth();
            const list = eventsByDay[k] || [];
            return (
              <div key={i}
                   className={cx(
                     "min-h-[120px] rounded-2xl border p-3 shadow-sm transition",
                     "bg-white text-zinc-900 border-zinc-200",
                     "dark:bg-zinc-900 dark:text-white dark:border-zinc-800",
                     !inMonth && "opacity-80"
                   )}>
                <div className="mb-2 flex items-center justify-between">
                  <div className={cx("text-sm font-semibold", inMonth ? "" : "text-white/60")}>
                    {day.getDate()}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {list.map(ev=>(
                    <div key={ev.id}
                         className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs
                                    dark:border-zinc-700 dark:bg-zinc-800">
                      <div className="truncate">
                        <span className="mr-1 inline-flex items-center gap-1"><Clock className="h-3 w-3"/> {hhmm(new Date(ev.startAt))}</span>
                        · {ev.customerName}
                      </div>
                      <div className="ml-2 shrink-0 flex gap-1">
                        <button title="Editar" onClick={()=>setEditing(ev)}><Edit className="h-3.5 w-3.5 text-indigo-400"/></button>
                        <button title="Eliminar" onClick={()=>deleteAppointment(ev.id)}><Trash className="h-3.5 w-3.5 text-red-400"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
              const startLocalStr = (patch.startAt ? patch.startAt : editing.startAt).slice(0,16); // "YYYY-MM-DDTHH:mm"
              const { dateLocal, iso: startAtISO } = localToISOWithOffset(startLocalStr, -300);
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

/* ---------- Formularios (universales) ---------- */
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
    <form
      onSubmit={async (e)=>{ e.preventDefault(); await onSave(form); }}
      className="space-y-4 text-white"
    >
      <h2 className="text-lg font-semibold flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> Crear nueva cita</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Nombre cliente" value={form.name}
               onChange={(v)=>setForm({...form,name:v})} placeholder="Ej. Juan Pérez"/>
        <Input label="Teléfono" value={form.phone}
               onChange={(v)=>setForm({...form,phone:v})} placeholder="Ej. +57 300 000 0000"/>
        <Input label="Sede (opcional)" value={form.sede}
               onChange={(v)=>setForm({...form,sede:v})} placeholder="Ej. Sede Centro"/>
        <Input label="Profesional (opcional)" value={form.provider}
               onChange={(v)=>setForm({...form,provider:v})} placeholder="Ej. Dra. López"/>
        <Input label="Servicio" value={form.service}
               onChange={(v)=>setForm({...form,service:v})} placeholder="Ej. Blanqueamiento dental"/>
        <Input label="Fecha y hora" type="datetime-local" value={form.startISO}
               onChange={(v)=>setForm({...form,startISO:v})} />
        <Input label="Duración (min)" type="number" value={String(form.durationMin)}
               onChange={(v)=>setForm({...form,durationMin:Number(v||30)})} placeholder="30"/>
        <TextArea label="Notas (opcional)" value={form.notes}
                  onChange={(v)=>setForm({...form,notes:v})} placeholder="Observaciones, indicaciones..."/>
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
  const [start,setStart] = useState(appt.startAt.slice(0,16)); // "YYYY-MM-DDTHH:mm"
  const [notes,setNotes] = useState(appt.notas ?? "");

  return (
    <form
      onSubmit={async (e)=>{ e.preventDefault(); await onSave({
        customerName:name, customerPhone:phone, serviceName:service,
        // OJO: el wrapper Smart rehace startAt/endAt con offset antes de enviar al backend
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
