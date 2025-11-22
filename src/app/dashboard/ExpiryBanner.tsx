"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Subscription = {
  currentPeriodEnd: string; // ISO
};

type BillingStatus = {
  subscription: Subscription | null;
};

const GRACE_DAYS = 2;

function useSubscriptionStatus(status: BillingStatus | null) {
  if (!status?.subscription?.currentPeriodEnd) {
    return { daysLeft: null as number | null, isNearExpiry: false, isInGrace: false };
  }

  const end = new Date(status.subscription.currentPeriodEnd).getTime();
  const now = Date.now();

  const diffMs = end - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // días contando hacia adelante (incluye gracia)
  const graceLimit = end + GRACE_DAYS * 24 * 60 * 60 * 1000;
  const diffToGraceEndDays = Math.ceil(
    (graceLimit - now) / (1000 * 60 * 60 * 24)
  );

  const isInGrace = diffDays < 0 && diffToGraceEndDays >= 0;
  const isNearExpiry = diffDays <= 3 && diffToGraceEndDays >= 0;

  return {
    daysLeft: diffDays,
    isNearExpiry,
    isInGrace,
  };
}

export function ExpiryBanner({ status }: { status: BillingStatus | null }) {
  const router = useRouter();
  const { daysLeft, isNearExpiry, isInGrace } = useSubscriptionStatus(status);

  if (!isNearExpiry || daysLeft === null) return null;

  let label: string;

  if (daysLeft > 0) {
    label = `Tu membresía vence en ${daysLeft} día${
      daysLeft === 1 ? "" : "s"
    }.`;
  } else if (daysLeft === 0) {
    label = "Tu membresía vence hoy.";
  } else if (isInGrace) {
    label = "Tu membresía está en periodo de gracia. Evita la suspensión realizando el pago.";
  } else {
    // No debería entrar acá porque filtramos con isNearExpiry,
    // pero lo dejamos por seguridad.
    label = "Tu membresía está vencida.";
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-xs text-amber-100">
        <p className="font-semibold tracking-tight">
          Membresía próxima a vencerse
        </p>
        <p className="text-amber-200/90">{label}</p>
        <p className="text-[11px] text-amber-300/80 mt-1">
          Al renovar no pierdes los días restantes de tu periodo actual.
        </p>
      </div>
      <button
        onClick={() => router.push("/dashboard/billing")}
        className="text-xs px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium shadow-[0_8px_20px_rgba(16,185,129,0.35)] transition w-full sm:w-auto"
      >
        Renovar ahora
      </button>
    </div>
  );
}
