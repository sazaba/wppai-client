"use client";

import React, { useState } from "react";
import axios from "axios"; // tu wrapper centralizado
// Si no tienes '@/lib/axios', usa: import axios from "axios";

type BillingState = {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
  autoSubscribe: boolean;
};

export default function BillingPage() {
  const [form, setForm] = useState<BillingState>({
    number: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    cardHolder: "",
    autoSubscribe: true,
  });

  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>
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
      appendLog("Iniciando creación de método de pago...");

      // 1) Crear método de pago en el backend (Wompi token)
      const pmRes = await axios.post("/api/billing/payment-method", {
        number: form.number,
        cvc: form.cvc,
        exp_month: form.expMonth,
        exp_year: form.expYear,
        card_holder: form.cardHolder,
      });

      appendLog("Método de pago creado:", pmRes.data);

      if (form.autoSubscribe) {
        appendLog("Creando suscripción BASIC...");

        const subRes = await axios.post("/api/billing/subscription/basic", {});
        appendLog("Suscripción basic creada:", subRes.data);
      }

      appendLog("✅ Proceso completado correctamente.");
    } catch (err: any) {
      console.error(err);
      appendLog("❌ Error en el proceso:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCharge = async () => {
    setLoading(true);
    try {
      appendLog("Lanzando cobro manual de suscripción...");
      const res = await axios.post("/api/billing/subscription/charge", {});
      appendLog("Respuesta de cobro:", res.data);
    } catch (err: any) {
      console.error(err);
      appendLog("❌ Error en cobro:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          Billing & Wompi (Sandbox)
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Usa esta vista para probar la integración con Wompi Sandbox.  
          Debes estar autenticado para que el backend tome tu <code>empresaId</code> del JWT.
        </p>

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
              Año (YYYY)
            </label>
            <input
              type="text"
              name="expYear"
              value={form.expYear}
              onChange={handleChange}
              placeholder="2028"
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
              Crear suscripción BASIC automáticamente después de guardar la
              tarjeta
            </label>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-medium px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Guardar método de pago + (opcional) Suscripción"}
            </button>

            <button
              type="button"
              onClick={handleTestCharge}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-medium px-4 py-2 border border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Testear cobro manual de suscripción
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
