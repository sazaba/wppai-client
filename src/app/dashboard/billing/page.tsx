"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";

type PlanCode = "basic" | "pro";

type BillingState = {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
  autoSubscribe: boolean;
  plan: PlanCode;
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
    price: 49000,
    desc: "Ideal para clínicas que están arrancando con WASAAA.",
    features: [
      "Hasta 1 número de WhatsApp",
      "Respuestas con IA básicas",
      "Agenda y recordatorios",
    ],
  },
  {
    code: "pro",
    name: "Plan Pro",
    price: 89000,
    desc: "Para clínicas con mayor volumen de leads y más funciones.",
    features: [
      "Todo lo del plan Basic",
      "Hasta 3 números de WhatsApp",
      "Soporte prioritario",
    ],
  },
];

export default function BillingPage() {
  const [form, setForm] = useState<BillingState>({
    number: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    cardHolder: "",
    autoSubscribe: true,
    plan: "basic",
  });

  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");

  const [status, setStatus] = useState<any>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await axios.get("/api/billing/status");
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Cuando cambia el status, decidimos si mostrar o no el formulario
  useEffect(() => {
    if (status) {
      setShowCardForm(!status.paymentMethod); // si no hay método → mostrar form
    }
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const appendLog = (msg: string, data?: any) => {
    setLog((prev) =>
      `${prev}\n\n${new Date().toLocaleString()} - ${msg}${
        data ? `\n${JSON.stringify(data, null, 2)}` : ""
      }`
    );
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLog("");

    try {
      appendLog("Iniciando guardado de método de pago...");

      const pmRes = await axios.post("/api/billing/payment-method", {
        number: form.number,
        cvc: form.cvc,
        exp_month: form.expMonth,
        exp_year: form.expYear,
        card_holder: form.cardHolder,
      });

      appendLog("Método de pago guardado correctamente:", pmRes.data);

      if (form.autoSubscribe) {
        appendLog(`Creando/actualizando suscripción ${form.plan.toUpperCase()}...`);

        if (form.plan === "basic") {
          const subRes = await axios.post("/api/billing/subscription/basic", {});
          appendLog("Suscripción BASIC configurada:", subRes.data);
        } else {
          appendLog(
            "⚠️ Plan PRO seleccionado, pero el backend solo soporta BASIC por ahora. Usa BASIC para probar un cobro real."
          );
        }
      }

      await loadStatus();
      appendLog(
        "✅ Método de pago listo. Ahora puedes pagar tu suscripción con el botón «Pagar suscripción ahora»."
      );
    } catch (err: any) {
      console.error(err);
      appendLog(
        "❌ Error guardando método de pago:",
        err?.response?.data || err?.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCharge = async () => {
    setLoading(true);
    try {
      appendLog("Procesando pago de suscripción...");

      const res = await axios.post("/api/billing/subscription/charge", {});
      appendLog("Resultado del pago de suscripción:", res.data);

      await loadStatus();
    } catch (err: any) {
      console.error(err);
      appendLog(
        "❌ Error al pagar suscripción:",
        err?.response?.data || err?.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async () => {
    setLoading(true);
    try {
      appendLog("Eliminando método de pago...");

      const res = await axios.delete("/api/billing/payment-method");
      appendLog("Método de pago eliminado:", res.data);

      await loadStatus();
      appendLog("✅ No hay método de pago. Puedes registrar uno nuevo.");
    } catch (err: any) {
      console.error(err);
      appendLog(
        "❌ Error al eliminar método de pago:",
        err?.response?.data || err?.message
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.code === form.plan)!;
  const hasPaymentMethod = !!status?.paymentMethod;
  const empresaPlan = status?.empresaPlan || "gratis";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-2">
              Billing & Wompi
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-300">
                Sandbox
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Gestiona tu suscripción de WASAAA. Debes estar autenticado para
              que el backend tome tu <code>empresaId</code> del JWT.
            </p>
          </div>

          {status && (
            <div className="flex flex-col items-end text-right space-y-1 text-xs">
              <span className="text-slate-400">Plan actual</span>
              <span
                className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                  empresaPlan === "basic"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50"
                    : empresaPlan === "pro"
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/50"
                    : "bg-slate-700/40 text-slate-200 border border-slate-600"
                }`}
              >
                {empresaPlan.toUpperCase()}
              </span>
              {status.nextBillingDate && (
                <span className="text-slate-500">
                  Próximo cobro:{" "}
                  {new Date(status.nextBillingDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </header>

        {/* Layout principal: izquierda status/planes, derecha tarjeta + acciones + log */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Panel de estado */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-1">
                Estado de facturación
              </h2>

              {!status && (
                <p className="text-slate-400 text-sm">Cargando información...</p>
              )}

              {status && (
                <div className="space-y-4 text-sm">
                  {/* Método de pago */}
                  <div className="border-b border-slate-800 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">Método de pago</h3>
                      {hasPaymentMethod && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          Default
                        </span>
                      )}
                    </div>

                    {hasPaymentMethod ? (
                      <div className="text-slate-300 space-y-2">
                        <p className="text-sm">
                          Tarjeta: **** **** ****{" "}
                          {status.paymentMethod.lastFour}
                        </p>
                        <p className="text-slate-400 text-xs">
                          Marca: {status.paymentMethod.brand} · Exp:{" "}
                          {status.paymentMethod.expMonth}/
                          {status.paymentMethod.expYear}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setShowCardForm(true)}
                            className="text-xs px-3 py-1 rounded-full border border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/10 transition"
                            disabled={loading}
                          >
                            Cambiar método de pago
                          </button>
                          <button
                            type="button"
                            onClick={handleDeletePaymentMethod}
                            className="text-xs px-3 py-1 rounded-full border border-red-500/60 text-red-300 hover:bg-red-500/10 transition"
                            disabled={loading}
                          >
                            Eliminar método de pago
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">
                        No hay método de pago guardado. Registra una tarjeta
                        para poder activar tu suscripción.
                      </p>
                    )}
                  </div>

                  {/* Suscripción */}
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="font-semibold mb-1">Suscripción</h3>
                    {status.subscription ? (
                      <div className="text-slate-300 space-y-1 text-sm">
                        <p>
                          Plan:{" "}
                          <span className="text-emerald-400 font-medium">
                            {status.subscription.plan.code.toUpperCase()}
                          </span>
                        </p>
                        <p className="text-slate-400 text-xs">
                          Precio: $
                          {Number(
                            status.subscription.plan.price
                          ).toLocaleString("es-CO")}{" "}
                          COP / mes
                        </p>
                        <p className="text-slate-400 text-xs">
                          Periodo actual:{" "}
                          {new Date(
                            status.subscription.currentPeriodStart
                          ).toLocaleDateString()}{" "}
                          →{" "}
                          {new Date(
                            status.subscription.currentPeriodEnd
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">
                        No hay suscripción activa. Se creará cuando guardes un
                        método de pago con la opción de suscripción activada.
                      </p>
                    )}
                  </div>

                  {/* Historial de pagos */}
                  <div>
                    <h3 className="font-semibold mb-1">Historial de cobros</h3>
                    {status.payments?.length ? (
                      <ul className="text-slate-300 text-xs space-y-2 max-h-40 overflow-y-auto">
                        {status.payments.map((p: any) => (
                          <li
                            key={p.id}
                            className="border border-slate-800 rounded-lg p-2 flex justify-between items-center bg-slate-900/60"
                          >
                            <span>
                              {new Date(p.createdAt).toLocaleDateString()} — $
                              {Number(p.amount).toLocaleString("es-CO")}
                            </span>
                            <span
                              className={
                                p.status === "paid"
                                  ? "text-emerald-400"
                                  : p.status === "pending"
                                  ? "text-yellow-400"
                                  : "text-red-500"
                              }
                            >
                              {p.status.toUpperCase()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 text-sm">
                        No hay registros de cobros aún.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Selección de plan */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">
                Selecciona tu plan
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {PLANS.map((plan) => {
                  const isSelected = form.plan === plan.code;
                  const isPro = plan.code === "pro";

                  return (
                    <button
                      key={plan.code}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, plan: plan.code }))
                      }
                      className={[
                        "text-left rounded-xl border px-4 py-3 transition-all",
                        "bg-slate-950/40 hover:bg-slate-900/80",
                        isSelected
                          ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]"
                          : "border-slate-700",
                        isPro ? "relative overflow-hidden" : "",
                      ].join(" ")}
                    >
                      {isPro && (
                        <span className="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/60 text-indigo-200">
                          Próximamente
                        </span>
                      )}

                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-semibold">{plan.name}</span>
                        <span className="text-sm font-semibold text-emerald-400">
                          ${plan.price.toLocaleString("es-CO")} COP / mes
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-2">
                        {plan.desc}
                      </p>

                      <ul className="text-[11px] text-slate-300 space-y-1">
                        {plan.features.map((f) => (
                          <li key={f}>• {f}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Plan seleccionado:{" "}
                <span className="text-emerald-400 font-medium">
                  {selectedPlan.name} ($
                  {selectedPlan.price.toLocaleString("es-CO")} COP / mes)
                </span>
              </div>
            </section>
          </div>

          {/* Columna derecha: formulario + acción de pago + log */}
          <div className="space-y-4">
            {/* Formulario tarjeta (solo si showCardForm == true) */}
            {showCardForm && (
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-200">
                    {status?.paymentMethod
                      ? "Cambiar método de pago"
                      : "Registrar método de pago"}
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

                <form
                  onSubmit={handleSavePaymentMethod}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      Número de tarjeta (Sandbox)
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={form.number}
                      onChange={handleChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Mes (MM)
                    </label>
                    <input
                      type="text"
                      name="expMonth"
                      value={form.expMonth}
                      onChange={handleChange}
                      placeholder="08"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Año (YY)
                    </label>
                    <input
                      type="text"
                      name="expYear"
                      value={form.expYear}
                      onChange={handleChange}
                      placeholder="30"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      name="cvc"
                      value={form.cvc}
                      onChange={handleChange}
                      placeholder="123"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Titular de la tarjeta
                    </label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={form.cardHolder}
                      onChange={handleChange}
                      placeholder="TEST USER"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 mt-1">
                    <input
                      id="autoSubscribe"
                      type="checkbox"
                      name="autoSubscribe"
                      checked={form.autoSubscribe}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800"
                    />
                    <label
                      htmlFor="autoSubscribe"
                      className="text-xs text-slate-300"
                    >
                      Crear/actualizar suscripción {form.plan.toUpperCase()} al
                      guardar la tarjeta
                    </label>
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Procesando..." : "Guardar método de pago"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Botón de pagar suscripción */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  <p className="font-medium">Pago de suscripción</p>
                  <p className="text-slate-500">
                    Se usará tu método de pago por defecto y el plan configurado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCharge}
                  disabled={loading || !hasPaymentMethod}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-medium transition ${
                    hasPaymentMethod
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  } disabled:opacity-60`}
                >
                  {loading ? "Procesando..." : "Pagar suscripción ahora"}
                </button>
              </div>
              {!hasPaymentMethod && (
                <p className="text-[11px] text-amber-300">
                  Para pagar la suscripción primero debes registrar un método de
                  pago.
                </p>
              )}
            </section>

            {/* Log */}
            <section className="rounded-xl border border-slate-800 bg-black/60 p-4">
              <h2 className="text-sm font-semibold text-slate-200 mb-2">
                Log / Respuesta
              </h2>
              <pre className="w-full min-h-[140px] max-h-64 overflow-auto text-xs text-slate-200 whitespace-pre-wrap">
                {log ||
                  "Aquí se mostrará el resultado de las peticiones a /api/billing..."}
              </pre>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
