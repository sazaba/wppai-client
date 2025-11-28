"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "@/lib/axios";

type PlanCode = "basic";

type BillingState = {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
  email: string;
  autoSubscribe: boolean;
};

const PLANS: {
  code: PlanCode;
  name: string;
  price: number;
  desc: string;
  features: string[];
}[] = [
  {
    code: "basic",
    name: "Plan Basic",
    price: 250000,
    desc: "Ideal para negocios que desean automatizar su WhatsApp con IA.",
    features: [
      "Hasta 1 número de WhatsApp",
      "300 conversaciones al mes",
      "Respuestas con IA premium",
      "Agenda y recordatorios",
    ],
  },
];

// Paquetes extra definidos en el frontend (visualización)
const PACKAGES = [
  { amount: 300, price: 50000, label: "+300 Conversaciones" },
  { amount: 600, price: 90000, label: "+600 Conversaciones (Promo)" },
];

export default function BillingPage() {
  const [form, setForm] = useState<BillingState>({
    number: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    cardHolder: "",
    email: "",
    autoSubscribe: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  /* ================= Cargar estado de billing ================= */

  const loadStatus = useCallback(async () => {
    try {
      const res = await axios.get("/api/billing/status");
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Polling suave para reflejar cambios cuando entra el webhook
  useEffect(() => {
    const interval = setInterval(() => {
      loadStatus();
    }, 8000); 
    return () => clearInterval(interval);
  }, [loadStatus]);

  // Mostrar / ocultar formulario según si hay método de pago
  useEffect(() => {
    if (!status) return;
    // Solo abrimos el form automáticamente si NO hay tarjeta
    if (!status.paymentMethod) {
        setShowCardForm(true);
    } else {
        setShowCardForm(false);
    }
  }, [status]);

  /* ================= Handlers ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Helper para obtener deviceFingerprint de Wompi
  const getDeviceFingerprintSafe = async (): Promise<string> => {
    try {
      let attempts = 0;
      const maxAttempts = 5;
      const delayMs = 1000;

      while (attempts < maxAttempts) {
        const w = (window as any).wompi;

        if (w && typeof w.getDeviceFingerprint === "function") {
          return await w.getDeviceFingerprint();
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // Fallback fake si falla el SDK
      return `fake-fp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    } catch (err: any) {
      console.error(err);
      return `fake-fp-error-${Date.now()}`;
    }
  };

  // 1. Guardar Tarjeta (Original intacto)
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Guardando método de pago...");

    try {
      const deviceFingerprint = await getDeviceFingerprintSafe();

      const pmRes = await axios.post("/api/billing/payment-method", {
        number: form.number,
        cvc: form.cvc,
        exp_month: form.expMonth,
        exp_year: form.expYear,
        card_holder: form.cardHolder,
        email: form.email,
        deviceFingerprint,
      });

      const redirectUrl = pmRes.data?.wompiSource?.redirect_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      }

      if (form.autoSubscribe) {
        await axios.post("/api/billing/subscription/basic", {});
      }

      await loadStatus();
    } catch (err: any) {
      console.error(err);
      alert("Error guardando tarjeta: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  // 2. Cobrar Suscripción (Original intacto)
  const handleCharge = async () => {
    setLoading(true);
    setLoadingMessage("Procesando pago de suscripción...");

    try {
      await axios.post("/api/billing/subscription/charge", {});
      await loadStatus();
      alert("Proceso de pago iniciado. Espera unos segundos a que se refleje.");
    } catch (err: any) {
      console.error(err);
      alert("Error al pagar suscripción: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  // 3. Eliminar Tarjeta (Original intacto)
  const handleDeletePaymentMethod = async () => {
    if(!confirm("¿Seguro que quieres eliminar tu tarjeta?")) return;
    
    setLoading(true);
    setLoadingMessage("Eliminando...");

    try {
      await axios.delete("/api/billing/payment-method");
      await loadStatus();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  // ✨ 4. NUEVO: Comprar Paquetes de Créditos
  const handlePurchaseCredits = async (amount: number, price: number) => {
    if (!confirm(`¿Confirmas la compra de ${amount} conversaciones adicionales por $${price.toLocaleString()} COP?`)) return;

    setLoading(true);
    setLoadingMessage("Procesando compra de créditos...");

    try {
      const res = await axios.post("/api/billing/purchase-credits", { amount });
      
      if (res.data.ok) {
        alert("¡Compra exitosa! Tus créditos han sido agregados.");
        await loadStatus();
      } else {
        alert("El pago no fue aprobado inmediatamente. Estado: " + (res.data.wompi?.status || "Desconocido"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Error al comprar créditos: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  /* ================= Render Helpers ================= */

  const basicPlan = PLANS[0];
  const hasPaymentMethod = !!status?.paymentMethod;
  const empresaPlan = status?.empresaPlan || "gratis";
  
  // Datos de consumo
  const used = status?.usage?.used || 0;
  const limit = status?.usage?.limit || 300; // fallback visual
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const isLimitNear = percent >= 80;

  // Unificar historial (Pagos suscripción + Compras paquetes)
  // Nota: Esto es visual, en BD son tablas distintas pero las mezclamos para mostrar cronología
  const allHistory = [
    ...(status?.payments || []).map((p: any) => ({ ...p, type: 'subscription', label: 'Suscripción' })),
    ...(status?.conversationPurchases || []).map((p: any) => ({ ...p, type: 'topup', label: `Pack +${p.creditsAmount}` }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 space-y-8 relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-32 -right-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
              <p className="text-xs text-slate-200 tracking-wide uppercase font-medium">
                {loadingMessage ?? "Procesando..."}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-2">
              Billing &amp; Planes
              {status?.subscription?.status === 'active' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/70 text-emerald-200 tracking-wide uppercase">
                  Activo
                </span>
              )}
            </h1>
          </div>

          {status && (
            <div className="flex flex-col items-end text-right space-y-1 text-xs relative">
              <span className="text-slate-400">Plan actual</span>
              <span
                className={`px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-sm ${
                  empresaPlan === "basic"
                    ? "bg-emerald-600/20 text-emerald-200 border border-emerald-400/70"
                    : "bg-slate-700/40 text-slate-200 border border-slate-600"
                }`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                {empresaPlan.toUpperCase()}
              </span>
              {status.nextBillingDate && (
                <span className="text-slate-500">
                  Renovación: {new Date(status.nextBillingDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </header>

        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* ============ COLUMNA IZQUIERDA ============ */}
          <div className="space-y-6">
            
            {/* ✨ NUEVO: Tarjeta de Consumo */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm relative overflow-hidden">
                <div className="flex justify-between items-end mb-2">
                    <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Consumo del mes
                    </h2>
                    <span className={`text-xs font-medium ${isLimitNear ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {used} / {limit} conversaciones
                    </span>
                </div>
                
                {/* Barra de progreso */}
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                    <div 
                        className={`h-full transition-all duration-500 ease-out ${
                            isLimitNear ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                    {isLimitNear 
                        ? "⚠️ Estás cerca de alcanzar tu límite. Compra un paquete adicional para no detener el servicio."
                        : "Tu ciclo se reinicia automáticamente en la fecha de renovación."
                    }
                </p>
            </section>

            {/* Estado de Facturación */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-slate-200 mb-1">
                Detalles de cuenta
              </h2>

              {!status && (
                <div className="space-y-3">
                  <div className="h-3 w-32 bg-slate-800/70 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-800/60 rounded-md animate-pulse" />
                    <div className="h-3 w-2/3 bg-slate-800/60 rounded-md animate-pulse" />
                  </div>
                </div>
              )}

              {status && (
                <div className="space-y-4 text-sm">
                  {/* Método de pago */}
                  <div className="border-b border-slate-800 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-300">Método de pago</h3>
                      {hasPaymentMethod && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Principal
                        </span>
                      )}
                    </div>

                    {hasPaymentMethod ? (
                      <div className="text-slate-300 space-y-2">
                        <p className="text-sm font-mono tracking-wide">
                          **** **** **** {status.paymentMethod.lastFour}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {status.paymentMethod.brand} · Exp:{" "}
                          {status.paymentMethod.expMonth}/{status.paymentMethod.expYear}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setShowCardForm(true)}
                            className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                            disabled={loading}
                          >
                            Cambiar
                          </button>
                          <button
                            type="button"
                            onClick={handleDeletePaymentMethod}
                            className="text-xs px-3 py-1 rounded-full border border-red-900/30 text-red-400 hover:bg-red-900/10 transition"
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">
                        No tienes tarjeta registrada.
                      </p>
                    )}
                  </div>

                  {/* Historial Unificado */}
                  <div>
                    <h3 className="font-semibold text-slate-300 mb-2">Historial de transacciones</h3>
                    {allHistory.length ? (
                      <ul className="text-slate-300 text-xs space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {allHistory.map((p: any) => (
                          <li
                            key={p.id + p.type}
                            className="border border-slate-800 rounded-lg p-2 flex justify-between items-center bg-slate-950/30"
                          >
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-200">{p.label}</span>
                                <span className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-slate-300">${Number(p.amount || p.pricePaid).toLocaleString("es-CO")}</div>
                                <span
                                className={`text-[10px] uppercase font-bold ${
                                    p.status === "paid" ? "text-emerald-500" : 
                                    p.status === "pending" ? "text-amber-500" : "text-red-500"
                                }`}
                                >
                                {p.status}
                                </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 text-sm">
                        No hay registros aún.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Info del Plan */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">
                Tu plan base
              </h2>
                <div
                  className="text-left rounded-xl border px-4 py-3 relative overflow-hidden bg-slate-950/60 border-emerald-500/30 shadow-inner"
                >
                  <div className="flex items-baseline justify-between mb-1 relative">
                    <span className="font-semibold text-emerald-100">{basicPlan.name}</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      ${basicPlan.price.toLocaleString("es-CO")} / mes
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 relative">
                    {basicPlan.desc}
                  </p>
                  <ul className="text-[11px] text-slate-300 space-y-1 relative">
                    {basicPlan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                          {f}
                      </li>
                    ))}
                  </ul>
                </div>
            </section>
          </div>

          {/* ============ COLUMNA DERECHA ============ */}
          <div className="space-y-6">
            
            {/* Formulario de Tarjeta (Mostrar/Ocultar) */}
            {showCardForm && (
              <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-200">
                    {status?.paymentMethod
                      ? "Actualizar tarjeta"
                      : "Registrar tarjeta"}
                  </h2>
                  {status?.paymentMethod && (
                    <button
                      type="button"
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                      onClick={() => setShowCardForm(false)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                <form onSubmit={handleSavePaymentMethod} className="grid gap-3">
                  <div>
                    <input
                      type="text"
                      name="number"
                      value={form.number}
                      onChange={handleChange}
                      placeholder="Número de tarjeta"
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        name="expMonth"
                        value={form.expMonth}
                        onChange={handleChange}
                        placeholder="MM"
                        className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                    />
                    <input
                        type="text"
                        name="expYear"
                        value={form.expYear}
                        onChange={handleChange}
                        placeholder="YY"
                        className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        name="cvc"
                        value={form.cvc}
                        onChange={handleChange}
                        placeholder="CVC"
                        className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                    />
                    <input
                        type="text"
                        name="cardHolder"
                        value={form.cardHolder}
                        onChange={handleChange}
                        placeholder="Nombre titular"
                        className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Correo de facturación"
                      className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="autoSubscribe"
                      type="checkbox"
                      name="autoSubscribe"
                      checked={form.autoSubscribe}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor="autoSubscribe" className="text-xs text-slate-300">
                      Activar suscripción Basic automáticamente
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold py-2 disabled:opacity-60 transition shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
                  >
                    {loading ? "Guardando..." : "Guardar Tarjeta Segura"}
                  </button>
                </form>
              </section>
            )}

            {/* Acciones de Pago (Solo visibles si hay tarjeta) */}
            {hasPaymentMethod && (
                <div className="space-y-6">
                    
                    {/* 1. Pagar Suscripción Manual (si aplica) */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-slate-200">Suscripción Mensual</h3>
                            <span className="text-xs text-emerald-400 font-mono font-medium">$250.000</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">
                            Renovación manual del Plan Basic. Reinicia tus 300 créditos y extiende el acceso 30 días.
                        </p>
                        <button
                            type="button"
                            onClick={handleCharge}
                            disabled={loading}
                            className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium py-2 transition"
                        >
                            Pagar Suscripción Ahora
                        </button>
                    </section>

                    {/* ✨ 2. NUEVO: Comprar Paquetes Extra */}
                    <section className="rounded-xl border border-indigo-500/30 bg-slate-900/60 p-4 backdrop-blur-sm relative overflow-hidden">
                        {/* Destacado visual */}
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <svg className="w-20 h-20 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                            </svg>
                        </div>

                        <h3 className="text-sm font-semibold text-indigo-200 mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                            ¿Necesitas más conversaciones?
                        </h3>
                        
                        <div className="space-y-3">
                            {PACKAGES.map((pkg) => (
                                <button
                                    key={pkg.amount}
                                    type="button"
                                    onClick={() => handlePurchaseCredits(pkg.amount, pkg.price)}
                                    disabled={loading}
                                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition group"
                                >
                                    <div className="text-left">
                                        <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-200 transition">
                                            {pkg.label}
                                        </div>
                                        <div className="text-[10px] text-slate-500">Pago único</div>
                                    </div>
                                    <div className="text-xs font-bold text-indigo-400">
                                        ${pkg.price.toLocaleString("es-CO")}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {!hasPaymentMethod && !showCardForm && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                    <p className="text-xs text-amber-200 mb-3">
                        Registra una tarjeta para activar tu suscripción o comprar créditos adicionales.
                    </p>
                    <button 
                        onClick={() => setShowCardForm(true)}
                        className="text-xs font-medium text-amber-400 hover:text-amber-300 underline"
                    >
                        Registrar ahora
                    </button>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}