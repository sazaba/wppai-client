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
  Edit,
  Trash,
} from "lucide-react";
import { motion } from "framer-motion";

/* ==== utils ==== */
function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ==== simple styled components ==== */
function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
}) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 focus:ring-indigo-400",
    ghost: "bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200",
    outline:
      "border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
  } as const;
  return <button className={cx(base, variants[variant], className)} {...props} />;
}

function Badge({
  children,
  color = "zinc",
}: {
  children: React.ReactNode;
  color?: "zinc" | "green" | "yellow" | "red" | "blue";
}) {
  const map: Record<string, string> = {
    zinc: "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200",
    green: "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200",
    yellow: "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200",
    red: "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200",
    blue: "bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        map[color]
      )}
    >
      {children}
    </span>
  );
}

function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ==== types ==== */
export type Appointment = {
  id: number;
  empresaId: number;
  sedeId: number;
  serviceId: number;
  providerId?: number | null;
  source: "ai" | "agent" | "client";
  status:
    | "pending"
    | "confirmed"
    | "rescheduled"
    | "cancelled"
    | "completed"
    | "no_show";
  customerName: string;
  customerPhone: string;
  notas?: string | null;
  startAt: string;
  endAt: string;
  serviceName: string;
};

/* ==== helpers ==== */
function formatDayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}
function hhmm(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/* ==== MAIN ==== */
export default function AppointmentsCalendar({ empresaId }: { empresaId: number }) {
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);

  const days: Date[] = useMemo(() => {
    const start = new Date(current.getFullYear(), current.getMonth(), 1);
    const firstDay = new Date(start);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay() + 1);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      return d;
    });
  }, [current]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const ev of events) {
      const k = formatDayKey(new Date(ev.startAt));
      (map[k] ||= []).push(ev);
    }
    return map;
  }, [events]);

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  /* fake add */
  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const appt: Appointment = {
      id: Date.now(),
      empresaId,
      sedeId: 1,
      serviceId: 1,
      source: "client",
      status: "pending",
      customerName: String(fd.get("name")),
      customerPhone: String(fd.get("phone")),
      serviceName: String(fd.get("service")),
      startAt: new Date(String(fd.get("date"))).toISOString(),
      endAt: new Date(String(fd.get("date"))).toISOString(),
    };
    setEvents((prev) => [...prev, appt]);
    setShowForm(false);
  };

  return (
    <div className="w-full space-y-4 p-4">
      {/* header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() =>
              setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {current.toLocaleString("es-CO", { month: "long", year: "numeric" })}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrent(new Date())}
          >
            Hoy
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Nueva cita
          </Button>
        </div>
      </div>

      {/* week */}
      <div className="grid grid-cols-7 gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
        {weekDays.map((w) => (
          <div key={w} className="px-2 py-1 text-center">{w}</div>
        ))}
      </div>

      {/* days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const key = formatDayKey(day);
          const dayEvents = eventsByDay[key] || [];
          const inMonth = day.getMonth() === current.getMonth();
          return (
            <div
              key={idx}
              className={cx(
                "min-h-[120px] rounded-xl border p-2 transition",
                inMonth
                  ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                  : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 opacity-60"
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {day.getDate()}
                </span>
              </div>
              <div className="space-y-1">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-lg bg-zinc-100 dark:bg-zinc-700 p-1 text-xs flex justify-between items-center"
                  >
                    <span>
                      {hhmm(new Date(ev.startAt))} · {ev.customerName}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedAppt(ev)}>
                        <Edit className="h-3 w-3 text-blue-500" />
                      </button>
                      <button
                        onClick={() =>
                          setEvents((prev) => prev.filter((e) => e.id !== ev.id))
                        }
                      >
                        <Trash className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* form modal */}
      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            Crear nueva cita
          </h2>
          <input
            name="name"
            placeholder="Nombre cliente"
            className="w-full rounded-lg border px-3 py-2 dark:bg-zinc-800 dark:text-white"
          />
          <input
            name="phone"
            placeholder="Teléfono"
            className="w-full rounded-lg border px-3 py-2 dark:bg-zinc-800 dark:text-white"
          />
          <input
            name="service"
            placeholder="Servicio"
            className="w-full rounded-lg border px-3 py-2 dark:bg-zinc-800 dark:text-white"
          />
          <input
            type="datetime-local"
            name="date"
            className="w-full rounded-lg border px-3 py-2 dark:bg-zinc-800 dark:text-white"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} type="button">
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Dialog>

      {/* edit modal */}
      <Dialog open={!!selectedAppt} onClose={() => setSelectedAppt(null)}>
        {selectedAppt && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Editar cita</h2>
            <p>
              Cliente: {selectedAppt.customerName} <br />
              Servicio: {selectedAppt.serviceName}
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedAppt(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
