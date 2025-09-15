"use client";

import dynamic from "next/dynamic";
import { useAuth } from "../../context/AuthContext";

// Evita SSR para librarte de cualquier acceso a window/DOM en build
const AppointmentsCalendar = dynamic(
  () => import("../appointments/AppointmentsCalendar.tsx"),
  { ssr: false }
);

export default function Page() {
  const { usuario, loading, token } = useAuth();

  if (loading) return <div className="p-6">Cargando…</div>;
  if (!token || !usuario) return <div className="p-6">No autenticado.</div>;

  return (
    <div className="h-full">
      <AppointmentsCalendar empresaId={usuario.empresaId} />
    </div>
  );
}
