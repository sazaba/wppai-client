"use client";

import dynamic from "next/dynamic";
import { useAuth } from "../../context/AuthContext";

// Evita SSR para librarte de cualquier acceso a window/DOM en build
const AppointmentsCalendar = dynamic(
  () => import("../appointments/AppointmentsCalendar"),
  { ssr: false }
);

export default function Page() {
  const { usuario, loading, token } = useAuth();

  if (loading) return <div className="p-6">Cargando…</div>;
  if (!token || !usuario) return <div className="p-6">No autenticado.</div>;

  return (
    <div className="min-h-screen overflow-y-auto px-4 sm:px-6 py-6
                scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent overscroll-contain">
  <div className="max-w-[1600px] mx-auto">
    <AppointmentsCalendar empresaId={usuario.empresaId} />
  </div>
</div>

  );
}
