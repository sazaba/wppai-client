"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Zap, Clock, Gift } from "lucide-react";
import clsx from "clsx";

export type BillingStatus = {
  subscription: {
    currentPeriodEnd: string;
    status: string;
  } | null;
  usage?: {
    used: number;
    limit: number;
  };
  meta?: {
    daysLeft: number | null;
    isInGrace: boolean;
    isActiveForUse: boolean;
    isTrial?: boolean; // ✨ Nuevo campo
  };
};

function getBannerState(status: BillingStatus | null) {
  if (!status) return null;

  const { usage, meta } = status;
  const used = usage?.used || 0;
  const limit = usage?.limit || 300;
  const percentUsed = limit > 0 ? (used / limit) * 100 : 0;
  const isTrial = meta?.isTrial || false;
  const daysLeft = meta?.daysLeft ?? 99;

  // 🔴 PRIORIDAD 1: LÍMITE DE CONVERSACIONES AGOTADO
  if (used >= limit) {
    return {
      type: "critical",
      icon: <Zap className="w-5 h-5 text-red-400" />,
      title: "IA Detenida: Límite alcanzado",
      message: `Has consumido el 100% de tus conversaciones (${used}/${limit}). ${isTrial ? 'Activa un plan' : 'Compra un paquete'} para reactivar el bot.`,
      action: isTrial ? "Ver planes" : "Comprar créditos",
      link: "/dashboard/billing",
    };
  }

  // 🔴 PRIORIDAD 2: VENCIDO (Trial o Suscripción)
  
  // A. Trial Vencido
  if (isTrial && daysLeft < 0) {
    return {
      type: "critical",
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      title: "Prueba gratuita finalizada",
      message: "Tu periodo de prueba ha terminado. Suscríbete a un plan para seguir usando la IA.",
      action: "Activar Plan",
      link: "/dashboard/billing",
    };
  }

  // B. Suscripción Vencida (Gracia)
  if (!isTrial && meta?.isInGrace) {
    return {
      type: "critical",
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      title: "Membresía vencida",
      message: "Tu suscripción está en periodo de gracia. Realiza el pago ahora para evitar la suspensión.",
      action: "Pagar ahora",
      link: "/dashboard/billing",
    };
  }

  // 🟡 PRIORIDAD 3: ALERTA DE CONSUMO (80%)
  if (percentUsed >= 80) {
    const left = limit - used;
    return {
      type: "warning",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: "Conversaciones agotándose",
      message: `Te quedan ${left} conversaciones. Considera ${isTrial ? 'activar un plan' : 'recargar'} antes de que se acaben.`,
      action: isTrial ? "Ver planes" : "Recargar",
      link: "/dashboard/billing",
    };
  }

  // 🟡 PRIORIDAD 4: VENCIMIENTO PRÓXIMO (<= 3 días)
  if (daysLeft <= 3 && daysLeft >= 0) {
    const timeText = daysLeft === 0 ? "hoy" : `en ${daysLeft} día${daysLeft === 1 ? '' : 's'}`;
    
    if (isTrial) {
        return {
            type: "warning",
            icon: <Gift className="w-5 h-5 text-amber-400" />,
            title: "Tu prueba termina pronto",
            message: `Tu acceso gratuito finaliza ${timeText}. No pierdas el servicio.`,
            action: "Elegir Plan",
            link: "/dashboard/billing",
        };
    } else {
        return {
            type: "warning",
            icon: <Clock className="w-5 h-5 text-amber-400" />,
            title: "Renovación próxima",
            message: `Tu membresía vence ${timeText}. Asegura la continuidad de tu servicio.`,
            action: "Renovar",
            link: "/dashboard/billing",
        };
    }
  }

  return null;
}

export function ExpiryBanner({ status }: { status: BillingStatus | null }) {
  const router = useRouter();
  const banner = useMemo(() => getBannerState(status), [status]);

  if (!banner) return null;

  const isCritical = banner.type === "critical";

  return (
    <div
      className={clsx(
        "mb-6 relative overflow-hidden rounded-xl border px-4 py-3 shadow-lg transition-all duration-300 backdrop-blur-md",
        isCritical
          ? "border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-900/10 text-red-100"
          : "border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-900/10 text-amber-100"
      )}
    >
      <div
        className={clsx(
          "absolute top-0 left-0 w-1 h-full",
          isCritical ? "bg-red-500" : "bg-amber-500"
        )}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div
            className={clsx(
              "p-2 rounded-lg mt-0.5 backdrop-blur-sm shadow-sm",
              isCritical ? "bg-red-500/10" : "bg-amber-500/10"
            )}
          >
            {banner.icon}
          </div>
          <div>
            <p className={clsx("text-sm font-bold tracking-tight", isCritical ? "text-red-200" : "text-amber-200")}>
              {banner.title}
            </p>
            <p className={clsx("text-xs mt-0.5 font-medium opacity-90 leading-relaxed", isCritical ? "text-red-100/80" : "text-amber-100/80")}>
              {banner.message}
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push(banner.link)}
          className={clsx(
            "text-xs px-4 py-2 rounded-lg font-semibold shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap w-full sm:w-auto border",
            isCritical
              ? "bg-red-500 hover:bg-red-400 text-white border-red-400/50 shadow-red-900/20"
              : "bg-amber-500 hover:bg-amber-400 text-slate-900 border-amber-400/50 shadow-amber-900/20"
          )}
        >
          {banner.action}
        </button>
      </div>
    </div>
  );
}