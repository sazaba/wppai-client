// /app/dashboard/billing/page.tsx
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLog("");

    try {
      appendLog("Iniciando guardado de método de pago...");

      // 1) Crear método de pago en el backend (Wompi token)
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

      // Refrescamos panel de estado
      await loadStatus();

      appendLog("✅ Método de pago listo. Ahora puedes pagar tu suscripción con el botón «Pagar suscripción ahora».");
    } catch (err: any) {
      console.error(err);
      appendLog("❌ Error guardando método de pago:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCharge = async () => {
    setLoading(true);
    try {
      appendLog("Procesando pago de suscripción...");

      const res = await axios.post("/api/billing/subscription/charge", {});
      appendLog("Resultado del pago de suscripción:", res.data);

      // Refrescamos panel de estado
      await loadStatus();
    } catch (err: any) {
      console.error(err);
      appendLog("❌ Error al pagar suscripción:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.code === form.plan)!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          Billing & Wompi (Sandbox)
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Usa esta vista para probar la integración con Wompi Sandbox. Debes
          estar autenticado para que el backend tome tu{" "}
          <code>empresaId</code> del JWT.
        </p>

        {/* =============================== */}
        {/* PANEL DE ESTADO DE BILLING */}
        {/* =============================== */}
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-xl font-semibold mb-4">Estado de facturación</h2>

          {!status && (
            <p className="text-slate-400 text-sm">Cargando información...</p>
          )}

          {status && (
            <div className="space-y-4 text-sm">
              {/* Método de pago */}
              <div className="border-b border-slate-700 pb-3">
                <h3 className="font-semibold mb-1">Método de pago</h3>
                {status.paymentMethod ? (
                  <div className="text-slate-300">
                    <p>
                      Tarjeta: **** **** ****{" "}
                      {status.paymentMethod.lastFour}
                    </p>
                    <p className="text-slate-400 text-xs">
                      Marca: {status.paymentMethod.brand} · Exp:{" "}
                      {status.paymentMethod.expMonth}/
                      {status.paymentMethod.expYear}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500">
                    No hay método de pago guardado.
                  </p>
                )}
              </div>

              {/* Suscripción */}
              <div className="border-b border-slate-700 pb-3">
                <h3 className="font-semibold mb-1">Suscripción</h3>
                {status.subscription ? (
                  <div className="text-slate-300">
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
                      COP/mes
                    </p>
                    <p className="text-slate-400 text-xs">
                      Periodo:{" "}
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
                  <p className="text-slate-500">
                    No hay suscripción activa.
                  </p>
                )}
              </div>

              {/* Historial de Pagos */}
              <div>
                <h3 className="font-semibold mb-1">Historial de cobros</h3>
                {status.payments?.length ? (
                  <ul className="text-slate-300 text-xs space-y-2 max-h-48 overflow-y-auto">
                    {status.payments.map((p: any) => (
                      <li
                        key={p.id}
                        className="border border-slate-700 rounded-lg p-2 flex justify-between"
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
                  <p className="text-slate-500">No hay registros aún.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===================================== */}
        {/* SELECCIÓN DE PLAN */}
        {/* ===================================== */}
        <div className="mb-8">
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
                    "bg-slate-900/60 hover:bg-slate-800/80",
                    isSelected
                      ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]"
                      : "border-slate-700",
                    isPro ? "relative overflow-hidden" : "",
                  ].join(" ")}
                >
                  {isPro && (
                    <span className="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-300">
                      Próximamente
                    </span>
                  )}

                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-semibold">{plan.name}</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      ${plan.price.toLocaleString("es-CO")} COP / mes
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-2">{plan.desc}</p>

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
              {selectedPlan.name} (${selectedPlan.price.toLocaleString(
                "es-CO"
              )}{" "}
              COP / mes)
            </span>
          </div>
        </div>

        {/* ===================================== */}
        {/* FORMULARIO TARJETA */}
        {/* ===================================== */}
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 mb-6"
        >
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
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
            <label className="block text-sm font-medium mb-1">
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
            <label className="block text-sm font-medium mb-1">
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
            <label className="block text-sm font-medium mb-1">
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
            <label className="block text-sm font-medium mb-1">
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
            <label htmlFor="autoSubscribe" className="text-sm text-slate-300">
              Crear/actualizar suscripción {form.plan.toUpperCase()} al guardar
              la tarjeta
            </label>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-medium px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Guardar método de pago"}
            </button>

            <button
              type="button"
              onClick={handleTestCharge}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium px-4 py-2 border border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Pagar suscripción ahora"}
            </button>
          </div>
        </form>

        <div>
          <h2 className="text-sm font-semibold text-slate-200 mb-2">
            Log / Respuesta
          </h2>
          <pre className="w-full min-h-[160px] max-h-80 overflow-auto bg-black/60 border border-slate-800 rounded-lg text-xs p-3 whitespace-pre-wrap">
            {log || "Aquí se mostrará el resultado de las peticiones a /api/billing..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
