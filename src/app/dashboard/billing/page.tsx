// // "use client";

// // import React, { useEffect, useState } from "react";
// // import axios from "@/lib/axios";

// // type PlanCode = "basic" | "pro";

// // type BillingState = {
// //   number: string;
// //   expMonth: string;
// //   expYear: string;
// //   cvc: string;
// //   cardHolder: string;
// //   email: string;        // 👈 NUEVO
// //   autoSubscribe: boolean;
// //   plan: PlanCode;
// // };

// // const PLANS: {
// //   code: PlanCode;
// //   name: string;
// //   price: number;
// //   desc: string;
// //   features: string[];
// // }[] = [
// //   {
// //     code: "basic",
// //     name: "Plan Basic",
// //     price: 49000,
// //     desc: "Ideal para clínicas que están arrancando con WASAAA.",
// //     features: [
// //       "Hasta 1 número de WhatsApp",
// //       "Respuestas con IA básicas",
// //       "Agenda y recordatorios",
// //     ],
// //   },
// //   {
// //     code: "pro",
// //     name: "Plan Pro",
// //     price: 89000,
// //     desc: "Para clínicas con mayor volumen de leads y más funciones.",
// //     features: [
// //       "Todo lo del plan Basic",
// //       "Hasta 3 números de WhatsApp",
// //       "Soporte prioritario",
// //     ],
// //   },
// // ];

// // export default function BillingPage() {
// //   const [form, setForm] = useState<BillingState>({
// //     number: "",
// //     expMonth: "",
// //     expYear: "",
// //     cvc: "",
// //     cardHolder: "",
// //     email: "",          // 👈 NUEVO
// //     autoSubscribe: true,
// //     plan: "basic",
// //   });

// //   const [loading, setLoading] = useState(false);
// //   const [log, setLog] = useState<string>("");

// //   const [status, setStatus] = useState<any>(null);
// //   const [showCardForm, setShowCardForm] = useState(false);

// //   const loadStatus = async () => {
// //     try {
// //       const res = await axios.get("/api/billing/status");
// //       setStatus(res.data);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   useEffect(() => {
// //     loadStatus();
// //   }, []);

// //   useEffect(() => {
// //     if (status) {
// //       setShowCardForm(!status.paymentMethod); // si no hay método → mostrar form
// //     }
// //   }, [status]);

// //   const handleChange = (
// //     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
// //   ) => {
// //     const { name, value, type, checked } = e.target as any;
// //     setForm((prev) => ({
// //       ...prev,
// //       [name]: type === "checkbox" ? checked : value,
// //     }));
// //   };

// //   const appendLog = (msg: string, data?: any) => {
// //     setLog((prev) =>
// //       `${prev}\n\n${new Date().toLocaleString()} - ${msg}${
// //         data ? `\n${JSON.stringify(data, null, 2)}` : ""
// //       }`
// //     );
// //   };

// //   // Helper para obtener deviceFingerprint desde el SDK de Wompi
// // // Helper para obtener deviceFingerprint desde el SDK de Wompi
// // const getDeviceFingerprintSafe = async (): Promise<string> => {
// //   try {
// //     let attempts = 0;
// //     const maxAttempts = 5;
// //     const delayMs = 1000;

// //     while (attempts < maxAttempts) {
// //       const w = (window as any).wompi;

// //       if (w && typeof w.getDeviceFingerprint === "function") {
// //         appendLog("Obteniendo deviceFingerprint de Wompi...");
// //         const fp = await w.getDeviceFingerprint();
// //         appendLog("✅ deviceFingerprint obtenido correctamente.");
// //         return fp;
// //       }

// //       attempts++;
// //       appendLog(
// //         `⚠️ Wompi SDK aún no está disponible (intento ${attempts}/${maxAttempts}). Reintentando...`
// //       );
// //       await new Promise((resolve) => setTimeout(resolve, delayMs));
// //     }

// //     // 👇 Fallback: si nunca cargó el SDK, generamos uno fake
// //     const fallback =
// //       `fake-fp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// //     appendLog(
// //       "❌ Wompi SDK no se cargó después de varios intentos. " +
// //         "Se usará un deviceFingerprint de respaldo para pruebas:",
// //       fallback
// //     );

// //     return fallback;
// //   } catch (err: any) {
// //     console.error(err);
// //     const fallback =
// //       `fake-fp-error-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// //     appendLog(
// //       "❌ Error obteniendo deviceFingerprint. Se usará un valor de respaldo:",
// //       fallback
// //     );
// //     return fallback;
// //   }
// // };



// //   const handleSavePaymentMethod = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setLog("");
  
// //     try {
// //       appendLog("Iniciando guardado de método de pago...");
  
// //       const deviceFingerprint = await getDeviceFingerprintSafe();
// // // Nota: siempre tendremos algún string (real o fake), así que seguimos

  
// //       const pmRes = await axios.post("/api/billing/payment-method", {
// //         number: form.number,
// //         cvc: form.cvc,
// //         exp_month: form.expMonth,
// //         exp_year: form.expYear,
// //         card_holder: form.cardHolder,
// //         email: form.email,
// //         deviceFingerprint,
// //       });
  
// //       appendLog("Método de pago guardado correctamente:", pmRes.data);
  
// //       // 👉 USAR redirect_url PARA LANZAR 3DS (popup / pantalla del banco)
// //       const redirectUrl = pmRes.data?.wompiSource?.redirect_url;
  
// //       if (redirectUrl) {
// //         appendLog("Redirigiendo a autenticación bancaria 3DS...");
// //         window.location.href = redirectUrl;
// //         // Nota: todo lo que esté después de esta línea puede no ejecutarse
// //         // porque el navegador cambia de página. Lo dejamos por compatibilidad.
// //       } else {
// //         appendLog(
// //           "⚠️ No se recibió redirect_url desde Wompi. Revisa la respuesta de createPaymentMethod."
// //         );
// //       }
  
// //       if (form.autoSubscribe) {
// //         appendLog(
// //           `Creando/actualizando suscripción ${form.plan.toUpperCase()}...`
// //         );
  
// //         if (form.plan === "basic") {
// //           const subRes = await axios.post("/api/billing/subscription/basic", {});
// //           appendLog("Suscripción BASIC configurada:", subRes.data);
// //         } else {
// //           appendLog(
// //             "⚠️ Plan PRO seleccionado, pero el backend solo soporta BASIC por ahora. Usa BASIC para probar un cobro real."
// //           );
// //         }
// //       }
  
// //       await loadStatus();
// //       appendLog(
// //         "✅ Método de pago listo. Después de la autenticación bancaria podrás pagar tu suscripción con el botón «Pagar suscripción ahora»."
// //       );
// //     } catch (err: any) {
// //       console.error(err);
// //       appendLog(
// //         "❌ Error guardando método de pago:",
// //         err?.response?.data || err?.message
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   const handleCharge = async () => {
// //     setLoading(true);
// //     try {
// //       appendLog("Procesando pago de suscripción...");

// //       const res = await axios.post("/api/billing/subscription/charge", {});
// //       appendLog("Resultado del pago de suscripción:", res.data);

// //       await loadStatus();
// //     } catch (err: any) {
// //       console.error(err);
// //       appendLog(
// //         "❌ Error al pagar suscripción:",
// //         err?.response?.data || err?.message
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDeletePaymentMethod = async () => {
// //     setLoading(true);
// //     try {
// //       appendLog("Eliminando método de pago...");

// //       const res = await axios.delete("/api/billing/payment-method");
// //       appendLog("Método de pago eliminado:", res.data);

// //       await loadStatus();
// //       appendLog("✅ No hay método de pago. Puedes registrar uno nuevo.");
// //     } catch (err: any) {
// //       console.error(err);
// //       appendLog(
// //         "❌ Error al eliminar método de pago:",
// //         err?.response?.data || err?.message
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const selectedPlan = PLANS.find((p) => p.code === form.plan)!;
// //   const hasPaymentMethod = !!status?.paymentMethod;
// //   const empresaPlan = status?.empresaPlan || "gratis";

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
// //       <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 space-y-8">
// //         {/* Header */}
// //         <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
// //           <div>
// //             <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-2">
// //               Billing & Wompi
// //               <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-300">
// //                 Producción
// //               </span>
// //             </h1>
// //             <p className="text-sm text-slate-400">
// //               Gestiona tu suscripción de WASAAA. Debes estar autenticado para
// //               que el backend tome tu <code>empresaId</code> del JWT.
// //             </p>
// //           </div>

// //           {status && (
// //             <div className="flex flex-col items-end text-right space-y-1 text-xs">
// //               <span className="text-slate-400">Plan actual</span>
// //               <span
// //                 className={`px-2 py-1 rounded-full text-[11px] font-medium ${
// //                   empresaPlan === "basic"
// //                     ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50"
// //                     : empresaPlan === "pro"
// //                     ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/50"
// //                     : "bg-slate-700/40 text-slate-200 border border-slate-600"
// //                 }`}
// //               >
// //                 {empresaPlan.toUpperCase()}
// //               </span>
// //               {status.nextBillingDate && (
// //                 <span className="text-slate-500">
// //                   Próximo cobro:{" "}
// //                   {new Date(status.nextBillingDate).toLocaleDateString()}
// //                 </span>
// //               )}
// //             </div>
// //           )}
// //         </header>

// //         {/* Layout principal */}
// //         <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
// //           {/* Columna izquierda */}
// //           <div className="space-y-6">
// //             {/* Panel de estado */}
// //             <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
// //               <h2 className="text-sm font-semibold text-slate-200 mb-1">
// //                 Estado de facturación
// //               </h2>

// //               {!status && (
// //                 <p className="text-slate-400 text-sm">Cargando información...</p>
// //               )}

// //               {status && (
// //                 <div className="space-y-4 text-sm">
// //                   {/* Método de pago */}
// //                   <div className="border-b border-slate-800 pb-3">
// //                     <div className="flex items-center justify-between mb-1">
// //                       <h3 className="font-semibold">Método de pago</h3>
// //                       {hasPaymentMethod && (
// //                         <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
// //                           Default
// //                         </span>
// //                       )}
// //                     </div>

// //                     {hasPaymentMethod ? (
// //                       <div className="text-slate-300 space-y-2">
// //                         <p className="text-sm">
// //                           Tarjeta: **** **** ****{" "}
// //                           {status.paymentMethod.lastFour}
// //                         </p>
// //                         <p className="text-slate-400 text-xs">
// //                           Marca: {status.paymentMethod.brand} · Exp:{" "}
// //                           {status.paymentMethod.expMonth}/
// //                           {status.paymentMethod.expYear}
// //                         </p>

// //                         <div className="flex flex-wrap gap-2 mt-2">
// //                           <button
// //                             type="button"
// //                             onClick={() => setShowCardForm(true)}
// //                             className="text-xs px-3 py-1 rounded-full border border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/10 transition"
// //                             disabled={loading}
// //                           >
// //                             Cambiar método de pago
// //                           </button>
// //                           <button
// //                             type="button"
// //                             onClick={handleDeletePaymentMethod}
// //                             className="text-xs px-3 py-1 rounded-full border border-red-500/60 text-red-300 hover:bg-red-500/10 transition"
// //                             disabled={loading}
// //                           >
// //                             Eliminar método de pago
// //                           </button>
// //                         </div>
// //                       </div>
// //                     ) : (
// //                       <p className="text-slate-500 text-sm">
// //                         No hay método de pago guardado. Registra una tarjeta
// //                         para poder activar tu suscripción.
// //                       </p>
// //                     )}
// //                   </div>

// //                   {/* Suscripción */}
// //                   <div className="border-b border-slate-800 pb-3">
// //                     <h3 className="font-semibold mb-1">Suscripción</h3>
// //                     {status.subscription ? (
// //                       <div className="text-slate-300 space-y-1 text-sm">
// //                         <p>
// //                           Plan:{" "}
// //                           <span className="text-emerald-400 font-medium">
// //                             {status.subscription.plan.code.toUpperCase()}
// //                           </span>
// //                         </p>
// //                         <p className="text-slate-400 text-xs">
// //                           Precio: $
// //                           {Number(
// //                             status.subscription.plan.price
// //                           ).toLocaleString("es-CO")}{" "}
// //                           COP / mes
// //                         </p>
// //                         <p className="text-slate-400 text-xs">
// //                           Periodo actual:{" "}
// //                           {new Date(
// //                             status.subscription.currentPeriodStart
// //                           ).toLocaleDateString()}{" "}
// //                           →{" "}
// //                           {new Date(
// //                             status.subscription.currentPeriodEnd
// //                           ).toLocaleDateString()}
// //                         </p>
// //                       </div>
// //                     ) : (
// //                       <p className="text-slate-500 text-sm">
// //                         No hay suscripción activa. Se creará cuando guardes un
// //                         método de pago con la opción de suscripción activada.
// //                       </p>
// //                     )}
// //                   </div>

// //                   {/* Historial de pagos */}
// //                   <div>
// //                     <h3 className="font-semibold mb-1">Historial de cobros</h3>
// //                     {status.payments?.length ? (
// //                       <ul className="text-slate-300 text-xs space-y-2 max-h-40 overflow-y-auto">
// //                         {status.payments.map((p: any) => (
// //                           <li
// //                             key={p.id}
// //                             className="border border-slate-800 rounded-lg p-2 flex justify-between items-center bg-slate-900/60"
// //                           >
// //                             <span>
// //                               {new Date(p.createdAt).toLocaleDateString()} — $
// //                               {Number(p.amount).toLocaleString("es-CO")}
// //                             </span>
// //                             <span
// //                               className={
// //                                 p.status === "paid"
// //                                   ? "text-emerald-400"
// //                                   : p.status === "pending"
// //                                   ? "text-yellow-400"
// //                                   : "text-red-500"
// //                               }
// //                             >
// //                               {p.status.toUpperCase()}
// //                             </span>
// //                           </li>
// //                         ))}
// //                       </ul>
// //                     ) : (
// //                       <p className="text-slate-500 text-sm">
// //                         No hay registros de cobros aún.
// //                       </p>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}
// //             </section>

// //             {/* Selección de plan */}
// //             <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
// //               <h2 className="text-sm font-semibold text-slate-200 mb-3">
// //                 Selecciona tu plan
// //               </h2>

// //               <div className="grid gap-4 md:grid-cols-2">
// //                 {PLANS.map((plan) => {
// //                   const isSelected = form.plan === plan.code;
// //                   const isPro = plan.code === "pro";

// //                   return (
// //                     <button
// //                       key={plan.code}
// //                       type="button"
// //                       onClick={() =>
// //                         setForm((prev) => ({ ...prev, plan: plan.code }))
// //                       }
// //                       className={[
// //                         "text-left rounded-xl border px-4 py-3 transition-all",
// //                         "bg-slate-950/40 hover:bg-slate-900/80",
// //                         isSelected
// //                           ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]"
// //                           : "border-slate-700",
// //                         isPro ? "relative overflow-hidden" : "",
// //                       ].join(" ")}
// //                     >
// //                       {isPro && (
// //                         <span className="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/60 text-indigo-200">
// //                           Próximamente
// //                         </span>
// //                       )}

// //                       <div className="flex items-baseline justify-between mb-1">
// //                         <span className="font-semibold">{plan.name}</span>
// //                         <span className="text-sm font-semibold text-emerald-400">
// //                           ${plan.price.toLocaleString("es-CO")} COP / mes
// //                         </span>
// //                       </div>

// //                       <p className="text-xs text-slate-400 mb-2">
// //                         {plan.desc}
// //                       </p>

// //                       <ul className="text-[11px] text-slate-300 space-y-1">
// //                         {plan.features.map((f) => (
// //                           <li key={f}>• {f}</li>
// //                         ))}
// //                       </ul>
// //                     </button>
// //                   );
// //                 })}
// //               </div>

// //               <div className="mt-3 text-xs text-slate-400">
// //                 Plan seleccionado:{" "}
// //                 <span className="text-emerald-400 font-medium">
// //                   {selectedPlan.name} ($
// //                   {selectedPlan.price.toLocaleString("es-CO")} COP / mes)
// //                 </span>
// //               </div>
// //             </section>
// //           </div>

// //           {/* Columna derecha: formulario + acción de pago + log */}
// //           <div className="space-y-4">
// //             {/* Formulario tarjeta */}
// //             {showCardForm && (
// //               <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
// //                 <div className="flex items-center justify-between mb-3">
// //                   <h2 className="text-sm font-semibold text-slate-200">
// //                     {status?.paymentMethod
// //                       ? "Cambiar método de pago"
// //                       : "Registrar método de pago"}
// //                   </h2>
// //                   {status?.paymentMethod && (
// //                     <button
// //                       type="button"
// //                       className="text-[11px] text-slate-400 hover:text-slate-200"
// //                       onClick={() => setShowCardForm(false)}
// //                     >
// //                       Cancelar
// //                     </button>
// //                   )}
// //                 </div>

// //                 <form
// //                   onSubmit={handleSavePaymentMethod}
// //                   className="grid gap-4 md:grid-cols-2"
// //                 >
// //                   <div className="md:col-span-2">
// //                     <label className="block text-xs font-medium mb-1">
// //                       Número de tarjeta
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="number"
// //                       value={form.number}
// //                       onChange={handleChange}
// //                       placeholder="•••• •••• •••• ••••"
// //                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label className="block text-xs font-medium mb-1">
// //                       Mes (MM)
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="expMonth"
// //                       value={form.expMonth}
// //                       onChange={handleChange}
// //                       placeholder="08"
// //                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label className="block text-xs font-medium mb-1">
// //                       Año (YY)
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="expYear"
// //                       value={form.expYear}
// //                       onChange={handleChange}
// //                       placeholder="30"
// //                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label className="block text-xs font-medium mb-1">
// //                       CVC
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="cvc"
// //                       value={form.cvc}
// //                       onChange={handleChange}
// //                       placeholder="123"
// //                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
// //                       required
// //                     />
// //                   </div>

// //                   <div>
// //                     <label className="block text-xs font-medium mb-1">
// //                       Titular de la tarjeta
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="cardHolder"
// //                       value={form.cardHolder}
// //                       onChange={handleChange}
// //                       placeholder="Nombre del titular"
// //                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
// //                       required
// //                     />
// //                   </div>

// //                   <div className="md:col-span-2">
// //                     <label className="block text-xs font-medium mb-1">
// //                       Correo electrónico para facturación
// //                     </label>
// //                     <input
// //                       type="email"
// //                       name="email"
// //                       value={form.email}
// //                       onChange={handleChange}
// //                       placeholder="correo@ejemplo.com"
// //                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
// //                       required
// //                     />
// //                   </div>

// //                   <div className="md:col-span-2 flex items-center gap-2 mt-1">
// //                     <input
// //                       id="autoSubscribe"
// //                       type="checkbox"
// //                       name="autoSubscribe"
// //                       checked={form.autoSubscribe}
// //                       onChange={handleChange}
// //                       className="h-4 w-4 rounded border-slate-600 bg-slate-800"
// //                     />
// //                     <label
// //                       htmlFor="autoSubscribe"
// //                       className="text-xs text-slate-300"
// //                     >
// //                       Crear/actualizar suscripción {form.plan.toUpperCase()} al
// //                       guardar la tarjeta
// //                     </label>
// //                   </div>

// //                   <div className="md:col-span-2 flex justify-end mt-2">
// //                     <button
// //                       type="submit"
// //                       disabled={loading}
// //                       className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
// //                     >
// //                       {loading ? "Procesando..." : "Guardar método de pago"}
// //                     </button>
// //                   </div>
// //                 </form>
// //               </section>
// //             )}

// //             {/* Botón de pagar suscripción */}
// //             <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-2">
// //               <div className="flex items-center justify-between">
// //                 <div className="text-xs text-slate-300">
// //                   <p className="font-medium">Pago de suscripción</p>
// //                   <p className="text-slate-500">
// //                     Se usará tu método de pago por defecto y el plan configurado.
// //                   </p>
// //                 </div>
// //                 <button
// //                   type="button"
// //                   onClick={handleCharge}
// //                   disabled={loading || !hasPaymentMethod}
// //                   className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-medium transition ${
// //                     hasPaymentMethod
// //                       ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
// //                       : "bg-slate-700 text-slate-400 cursor-not-allowed"
// //                   } disabled:opacity-60`}
// //                 >
// //                   {loading ? "Procesando..." : "Pagar suscripción ahora"}
// //                 </button>
// //               </div>
// //               {!hasPaymentMethod && (
// //                 <p className="text-[11px] text-amber-300">
// //                   Para pagar la suscripción primero debes registrar un método de
// //                   pago.
// //                 </p>
// //               )}
// //             </section>

// //             {/* Log */}
// //             <section className="rounded-xl border border-slate-800 bg-black/60 p-4">
// //               <h2 className="text-sm font-semibold text-slate-200 mb-2">
// //                 Log / Respuesta
// //               </h2>
// //               <pre className="w-full min-h-[140px] max-h-64 overflow-auto text-xs text-slate-200 whitespace-pre-wrap">
// //                 {log ||
// //                   "Aquí se mostrará el resultado de las peticiones a /api/billing..."}
// //               </pre>
// //             </section>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "@/lib/axios";

// type PlanCode = "basic" | "pro";

// type BillingState = {
//   number: string;
//   expMonth: string;
//   expYear: string;
//   cvc: string;
//   cardHolder: string;
//   email: string;
//   autoSubscribe: boolean;
//   plan: PlanCode;
// };

// const PLANS: {
//   code: PlanCode;
//   name: string;
//   price: number;
//   desc: string;
//   features: string[];
// }[] = [
//   {
//     code: "basic",
//     name: "Plan Basic",
//     price: 49000,
//     desc: "Ideal para clínicas que están arrancando con WASAAA.",
//     features: [
//       "Hasta 1 número de WhatsApp",
//       "Respuestas con IA básicas",
//       "Agenda y recordatorios",
//     ],
//   },
//   {
//     code: "pro",
//     name: "Plan Pro",
//     price: 89000,
//     desc: "Para clínicas con mayor volumen de leads y más funciones.",
//     features: [
//       "Todo lo del plan Basic",
//       "Hasta 3 números de WhatsApp",
//       "Soporte prioritario",
//     ],
//   },
// ];

// export default function BillingPage() {
//   const [form, setForm] = useState<BillingState>({
//     number: "",
//     expMonth: "",
//     expYear: "",
//     cvc: "",
//     cardHolder: "",
//     email: "",
//     autoSubscribe: true,
//     plan: "basic", // 👈 SIEMPRE arranca en BASIC por defecto
//   });

//   const [loading, setLoading] = useState(false);
//   const [log, setLog] = useState<string>("");

//   const [status, setStatus] = useState<any>(null);
//   const [showCardForm, setShowCardForm] = useState(false);

//   const loadStatus = async () => {
//     try {
//       const res = await axios.get("/api/billing/status");
//       setStatus(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     loadStatus();
//   }, []);

//   useEffect(() => {
//     if (!status) return;

//     // si no hay método de pago → mostrar form
//     setShowCardForm(!status.paymentMethod);

//     // 🔹 Sin suscripción → mantener BASIC como predeterminado
//     // 🔹 Con suscripción → sincronizar el selector con el plan real (si es basic/pro)
//     setForm((prev) => {
//       const backendCode = status.subscription?.plan?.code as PlanCode | undefined;

//       const normalizedPlan: PlanCode =
//         backendCode === "basic" || backendCode === "pro"
//           ? backendCode
//           : "basic";

//       return {
//         ...prev,
//         plan: normalizedPlan,
//       };
//     });
//   }, [status]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value, type, checked } = e.target as any;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const appendLog = (msg: string, data?: any) => {
//     setLog((prev) =>
//       `${prev}\n\n${new Date().toLocaleString()} - ${msg}${
//         data ? `\n${JSON.stringify(data, null, 2)}` : ""
//       }`
//     );
//   };

//   // Helper para obtener deviceFingerprint desde el SDK de Wompi
//   const getDeviceFingerprintSafe = async (): Promise<string> => {
//     try {
//       let attempts = 0;
//       const maxAttempts = 5;
//       const delayMs = 1000;

//       while (attempts < maxAttempts) {
//         const w = (window as any).wompi;

//         if (w && typeof w.getDeviceFingerprint === "function") {
//           appendLog("Obteniendo deviceFingerprint de Wompi...");
//           const fp = await w.getDeviceFingerprint();
//           appendLog("✅ deviceFingerprint obtenido correctamente.");
//           return fp;
//         }

//         attempts++;
//         appendLog(
//           `⚠️ Wompi SDK aún no está disponible (intento ${attempts}/${maxAttempts}). Reintentando...`
//         );
//         await new Promise((resolve) => setTimeout(resolve, delayMs));
//       }

//       // 👇 Fallback: si nunca cargó el SDK, generamos uno fake
//       const fallback = `fake-fp-${Date.now()}-${Math.random()
//         .toString(36)
//         .slice(2, 8)}`;

//       appendLog(
//         "❌ Wompi SDK no se cargó después de varios intentos. " +
//           "Se usará un deviceFingerprint de respaldo para pruebas:",
//         fallback
//       );

//       return fallback;
//     } catch (err: any) {
//       console.error(err);
//       const fallback = `fake-fp-error-${Date.now()}-${Math.random()
//         .toString(36)
//         .slice(2, 8)}`;

//       appendLog(
//         "❌ Error obteniendo deviceFingerprint. Se usará un valor de respaldo:",
//         fallback
//       );
//       return fallback;
//     }
//   };

//   const handleSavePaymentMethod = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setLog("");

//     try {
//       appendLog("Iniciando guardado de método de pago...");

//       const deviceFingerprint = await getDeviceFingerprintSafe();
//       // Nota: siempre tendremos algún string (real o fake), así que seguimos

//       const pmRes = await axios.post("/api/billing/payment-method", {
//         number: form.number,
//         cvc: form.cvc,
//         exp_month: form.expMonth,
//         exp_year: form.expYear,
//         card_holder: form.cardHolder,
//         email: form.email,
//         deviceFingerprint,
//       });

//       appendLog("Método de pago guardado correctamente:", pmRes.data);

//       // 👉 USAR redirect_url PARA LANZAR 3DS (popup / pantalla del banco)
//       const redirectUrl = pmRes.data?.wompiSource?.redirect_url;

//       if (redirectUrl) {
//         appendLog("Redirigiendo a autenticación bancaria 3DS...");
//         window.location.href = redirectUrl;
//         // Nota: todo lo que esté después de esta línea puede no ejecutarse
//       } else {
//         appendLog(
//           "⚠️ No se recibió redirect_url desde Wompi. Revisa la respuesta de createPaymentMethod."
//         );
//       }

//       if (form.autoSubscribe) {
//         appendLog(
//           `Creando/actualizando suscripción ${form.plan.toUpperCase()}...`
//         );
      
//         const endpoint =
//           form.plan === "basic"
//             ? "/api/billing/subscription/basic"
//             : "/api/billing/subscription/pro";
      
//         const subRes = await axios.post(endpoint, {});
//         appendLog("Suscripción configurada:", subRes.data);
//       }
      

//       await loadStatus();
//       appendLog(
//         "✅ Método de pago listo. Después de la autenticación bancaria podrás pagar tu suscripción con el botón «Pagar suscripción ahora»."
//       );
//     } catch (err: any) {
//       console.error(err);
//       appendLog(
//         "❌ Error guardando método de pago:",
//         err?.response?.data || err?.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCharge = async () => {
//     setLoading(true);
//     try {
//       appendLog("Procesando pago de suscripción...");

//       const res = await axios.post("/api/billing/subscription/charge", {});
//       appendLog("Resultado del pago de suscripción:", res.data);

//       await loadStatus();
//     } catch (err: any) {
//       console.error(err);
//       appendLog(
//         "❌ Error al pagar suscripción:",
//         err?.response?.data || err?.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeletePaymentMethod = async () => {
//     setLoading(true);
//     try {
//       appendLog("Eliminando método de pago...");

//       const res = await axios.delete("/api/billing/payment-method");
//       appendLog("Método de pago eliminado:", res.data);

//       await loadStatus();
//       appendLog("✅ No hay método de pago. Puedes registrar uno nuevo.");
//     } catch (err: any) {
//       console.error(err);
//       appendLog(
//         "❌ Error al eliminar método de pago:",
//         err?.response?.data || err?.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedPlan = PLANS.find((p) => p.code === form.plan)!;
//   const hasPaymentMethod = !!status?.paymentMethod;
//   const empresaPlan = status?.empresaPlan || "gratis";

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 space-y-8">
//         {/* Header */}
//         <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-2">
//               Billing & Wompi
//               <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-300">
//                 Producción
//               </span>
//             </h1>
//             <p className="text-sm text-slate-400">
//               Gestiona tu suscripción de WASAAA. Debes estar autenticado para
//               que el backend tome tu <code>empresaId</code> del JWT.
//             </p>
//           </div>

//           {status && (
//             <div className="flex flex-col items-end text-right space-y-1 text-xs">
//               <span className="text-slate-400">Plan actual</span>
//               <span
//                 className={`px-2 py-1 rounded-full text-[11px] font-medium ${
//                   empresaPlan === "basic"
//                     ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/50"
//                     : empresaPlan === "pro"
//                     ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/50"
//                     : "bg-slate-700/40 text-slate-200 border border-slate-600"
//                 }`}
//               >
//                 {empresaPlan.toUpperCase()}
//               </span>
//               {status.nextBillingDate && (
//                 <span className="text-slate-500">
//                   Próximo cobro:{" "}
//                   {new Date(status.nextBillingDate).toLocaleDateString()}
//                 </span>
//               )}
//             </div>
//           )}
//         </header>

//         {/* Layout principal */}
//         <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
//           {/* Columna izquierda */}
//           <div className="space-y-6">
//             {/* Panel de estado */}
//             <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
//               <h2 className="text-sm font-semibold text-slate-200 mb-1">
//                 Estado de facturación
//               </h2>

//               {!status && (
//                 <p className="text-slate-400 text-sm">Cargando información...</p>
//               )}

//               {status && (
//                 <div className="space-y-4 text-sm">
//                   {/* Método de pago */}
//                   <div className="border-b border-slate-800 pb-3">
//                     <div className="flex items-center justify-between mb-1">
//                       <h3 className="font-semibold">Método de pago</h3>
//                       {hasPaymentMethod && (
//                         <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
//                           Default
//                         </span>
//                       )}
//                     </div>

//                     {hasPaymentMethod ? (
//                       <div className="text-slate-300 space-y-2">
//                         <p className="text-sm">
//                           Tarjeta: **** **** ****{" "}
//                           {status.paymentMethod.lastFour}
//                         </p>
//                         <p className="text-slate-400 text-xs">
//                           Marca: {status.paymentMethod.brand} · Exp:{" "}
//                           {status.paymentMethod.expMonth}/
//                           {status.paymentMethod.expYear}
//                         </p>

//                         <div className="flex flex-wrap gap-2 mt-2">
//                           <button
//                             type="button"
//                             onClick={() => setShowCardForm(true)}
//                             className="text-xs px-3 py-1 rounded-full border border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/10 transition"
//                             disabled={loading}
//                           >
//                             Cambiar método de pago
//                           </button>
//                           <button
//                             type="button"
//                             onClick={handleDeletePaymentMethod}
//                             className="text-xs px-3 py-1 rounded-full border border-red-500/60 text-red-300 hover:bg-red-500/10 transition"
//                             disabled={loading}
//                           >
//                             Eliminar método de pago
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <p className="text-slate-500 text-sm">
//                         No hay método de pago guardado. Registra una tarjeta
//                         para poder activar tu suscripción.
//                       </p>
//                     )}
//                   </div>

//                   {/* Suscripción */}
//                   <div className="border-b border-slate-800 pb-3">
//                     <h3 className="font-semibold mb-1">Suscripción</h3>
//                     {status.subscription ? (
//                       <div className="text-slate-300 space-y-1 text-sm">
//                         <p>
//                           Plan:{" "}
//                           <span className="text-emerald-400 font-medium">
//                             {status.subscription.plan.code.toUpperCase()}
//                           </span>
//                         </p>
//                         <p className="text-slate-400 text-xs">
//                           Precio: $
//                           {Number(
//                             status.subscription.plan.price
//                           ).toLocaleString("es-CO")}{" "}
//                           COP / mes
//                         </p>
//                         <p className="text-slate-400 text-xs">
//                           Periodo actual:{" "}
//                           {new Date(
//                             status.subscription.currentPeriodStart
//                           ).toLocaleDateString()}{" "}
//                           →{" "}
//                           {new Date(
//                             status.subscription.currentPeriodEnd
//                           ).toLocaleDateString()}
//                         </p>
//                       </div>
//                     ) : (
//                       <p className="text-slate-500 text-sm">
//                         No hay suscripción activa. Se creará cuando guardes un
//                         método de pago con la opción de suscripción activada.
//                       </p>
//                     )}
//                   </div>

//                   {/* Historial de pagos */}
//                   <div>
//                     <h3 className="font-semibold mb-1">Historial de cobros</h3>
//                     {status.payments?.length ? (
//                       <ul className="text-slate-300 text-xs space-y-2 max-h-40 overflow-y-auto">
//                         {status.payments.map((p: any) => (
//                           <li
//                             key={p.id}
//                             className="border border-slate-800 rounded-lg p-2 flex justify-between items-center bg-slate-900/60"
//                           >
//                             <span>
//                               {new Date(p.createdAt).toLocaleDateString()} — $
//                               {Number(p.amount).toLocaleString("es-CO")}
//                             </span>
//                             <span
//                               className={
//                                 p.status === "paid"
//                                   ? "text-emerald-400"
//                                   : p.status === "pending"
//                                   ? "text-yellow-400"
//                                   : "text-red-500"
//                               }
//                             >
//                               {p.status.toUpperCase()}
//                             </span>
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <p className="text-slate-500 text-sm">
//                         No hay registros de cobros aún.
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </section>

//             {/* Selección de plan */}
//             <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
//               <h2 className="text-sm font-semibold text-slate-200 mb-3">
//                 Selecciona tu plan
//               </h2>

//               <div className="grid gap-4 md:grid-cols-2">
//                 {PLANS.map((plan) => {
//                   const isSelected = form.plan === plan.code;
//                   const isPro = plan.code === "pro";

//                   return (
//                     <button
//                       key={plan.code}
//                       type="button"
//                       onClick={() =>
//                         setForm((prev) => ({ ...prev, plan: plan.code }))
//                       }
//                       className={[
//                         "text-left rounded-xl border px-4 py-3 transition-all",
//                         "bg-slate-950/40 hover:bg-slate-900/80",
//                         isSelected
//                           ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]"
//                           : "border-slate-700",
//                         isPro ? "relative overflow-hidden" : "",
//                       ].join(" ")}
//                     >
//                       {isPro && (
//                         <span className="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/60 text-indigo-200">
//                           Próximamente
//                         </span>
//                       )}

//                       <div className="flex items-baseline justify-between mb-1">
//                         <span className="font-semibold">{plan.name}</span>
//                         <span className="text-sm font-semibold text-emerald-400">
//                           ${plan.price.toLocaleString("es-CO")} COP / mes
//                         </span>
//                       </div>

//                       <p className="text-xs text-slate-400 mb-2">
//                         {plan.desc}
//                       </p>

//                       <ul className="text-[11px] text-slate-300 space-y-1">
//                         {plan.features.map((f) => (
//                           <li key={f}>• {f}</li>
//                         ))}
//                       </ul>
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className="mt-3 text-xs text-slate-400">
//                 Plan seleccionado:{" "}
//                 <span className="text-emerald-400 font-medium">
//                   {selectedPlan.name} ($
//                   {selectedPlan.price.toLocaleString("es-CO")} COP / mes)
//                 </span>
//               </div>
//             </section>
//           </div>

//           {/* Columna derecha: formulario + acción de pago + log */}
//           <div className="space-y-4">
//             {/* Formulario tarjeta */}
//             {showCardForm && (
//               <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
//                 <div className="flex items-center justify-between mb-3">
//                   <h2 className="text-sm font-semibold text-slate-200">
//                     {status?.paymentMethod
//                       ? "Cambiar método de pago"
//                       : "Registrar método de pago"}
//                   </h2>
//                   {status?.paymentMethod && (
//                     <button
//                       type="button"
//                       className="text-[11px] text-slate-400 hover:text-slate-200"
//                       onClick={() => setShowCardForm(false)}
//                     >
//                       Cancelar
//                     </button>
//                   )}
//                 </div>

//                 <form
//                   onSubmit={handleSavePaymentMethod}
//                   className="grid gap-4 md:grid-cols-2"
//                 >
//                   <div className="md:col-span-2">
//                     <label className="block text-xs font-medium mb-1">
//                       Número de tarjeta
//                     </label>
//                     <input
//                       type="text"
//                       name="number"
//                       value={form.number}
//                       onChange={handleChange}
//                       placeholder="•••• •••• •••• ••••"
//                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Mes (MM)
//                     </label>
//                     <input
//                       type="text"
//                       name="expMonth"
//                       value={form.expMonth}
//                       onChange={handleChange}
//                       placeholder="08"
//                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Año (YY)
//                     </label>
//                     <input
//                       type="text"
//                       name="expYear"
//                       value={form.expYear}
//                       onChange={handleChange}
//                       placeholder="30"
//                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       CVC
//                     </label>
//                     <input
//                       type="text"
//                       name="cvc"
//                       value={form.cvc}
//                       onChange={handleChange}
//                       placeholder="123"
//                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium mb-1">
//                       Titular de la tarjeta
//                     </label>
//                     <input
//                       type="text"
//                       name="cardHolder"
//                       value={form.cardHolder}
//                       onChange={handleChange}
//                       placeholder="Nombre del titular"
//                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                       required
//                     />
//                   </div>

//                   <div className="md:col-span-2">
//                     <label className="block text-xs font-medium mb-1">
//                       Correo electrónico para facturación
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={form.email}
//                       onChange={handleChange}
//                       placeholder="correo@ejemplo.com"
//                       className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                       required
//                     />
//                   </div>

//                   <div className="md:col-span-2 flex items-center gap-2 mt-1">
//                     <input
//                       id="autoSubscribe"
//                       type="checkbox"
//                       name="autoSubscribe"
//                       checked={form.autoSubscribe}
//                       onChange={handleChange}
//                       className="h-4 w-4 rounded border-slate-600 bg-slate-800"
//                     />
//                     <label
//                       htmlFor="autoSubscribe"
//                       className="text-xs text-slate-300"
//                     >
//                       Crear/actualizar suscripción {form.plan.toUpperCase()} al
//                       guardar la tarjeta
//                     </label>
//                   </div>

//                   <div className="md:col-span-2 flex justify-end mt-2">
//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
//                     >
//                       {loading ? "Procesando..." : "Guardar método de pago"}
//                     </button>
//                   </div>
//                 </form>
//               </section>
//             )}

//             {/* Botón de pagar suscripción */}
//             <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col gap-2">
//               <div className="flex items-center justify-between">
//                 <div className="text-xs text-slate-300">
//                   <p className="font-medium">Pago de suscripción</p>
//                   <p className="text-slate-500">
//                     Se usará tu método de pago por defecto y el plan configurado.
//                   </p>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleCharge}
//                   disabled={loading || !hasPaymentMethod}
//                   className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-medium transition ${
//                     hasPaymentMethod
//                       ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
//                       : "bg-slate-700 text-slate-400 cursor-not-allowed"
//                   } disabled:opacity-60`}
//                 >
//                   {loading ? "Procesando..." : "Pagar suscripción ahora"}
//                 </button>
//               </div>
//               {!hasPaymentMethod && (
//                 <p className="text-[11px] text-amber-300">
//                   Para pagar la suscripción primero debes registrar un método de
//                   pago.
//                 </p>
//               )}
//             </section>

//             {/* Log */}
//             <section className="rounded-xl border border-slate-800 bg-black/60 p-4">
//               <h2 className="text-sm font-semibold text-slate-200 mb-2">
//                 Log / Respuesta
//               </h2>
//               <pre className="w-full min-h-[140px] max-h-64 overflow-auto text-xs text-slate-200 whitespace-pre-wrap">
//                 {log ||
//                   "Aquí se mostrará el resultado de las peticiones a /api/billing..."}
//               </pre>
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


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
    price: 49000,
    desc: "Ideal para clínicas que están arrancando con WASAAA.",
    features: [
      "Hasta 1 número de WhatsApp",
      "Respuestas con IA básicas",
      "Agenda y recordatorios",
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

  // Polling suave para reflejar cambios cuando entra el webhook (sin refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      loadStatus();
    }, 8000); // cada 8s

    return () => clearInterval(interval);
  }, [loadStatus]);

  // Mostrar / ocultar formulario según si hay método de pago
  useEffect(() => {
    if (!status) return;
    setShowCardForm(!status.paymentMethod);
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

  // Helper para obtener deviceFingerprint desde el SDK de Wompi
  const getDeviceFingerprintSafe = async (): Promise<string> => {
    try {
      let attempts = 0;
      const maxAttempts = 5;
      const delayMs = 1000;

      while (attempts < maxAttempts) {
        const w = (window as any).wompi;

        if (w && typeof w.getDeviceFingerprint === "function") {
          console.log("[Billing] Obteniendo deviceFingerprint de Wompi...");
          const fp = await w.getDeviceFingerprint();
          console.log("[Billing] ✅ deviceFingerprint obtenido correctamente.");
          return fp;
        }

        attempts++;
        console.log(
          `[Billing] ⚠️ Wompi SDK aún no está disponible (intento ${attempts}/${maxAttempts}). Reintentando...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // 👇 Fallback: si nunca cargó el SDK, generamos uno fake
      const fallback = `fake-fp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      console.log(
        "[Billing] ❌ Wompi SDK no se cargó después de varios intentos. Se usará un deviceFingerprint de respaldo para pruebas:",
        fallback
      );

      return fallback;
    } catch (err: any) {
      console.error(err);
      const fallback = `fake-fp-error-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      console.log(
        "[Billing] ❌ Error obteniendo deviceFingerprint. Se usará un valor de respaldo:",
        fallback
      );
      return fallback;
    }
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage("Guardando método de pago...");

    try {
      console.log("[Billing] Iniciando guardado de método de pago...");

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

      console.log("[Billing] Método de pago guardado correctamente:", pmRes.data);

      // 👉 USAR redirect_url PARA LANZAR 3DS (popup / pantalla del banco)
      const redirectUrl = pmRes.data?.wompiSource?.redirect_url;

      if (redirectUrl) {
        console.log("[Billing] Redirigiendo a autenticación bancaria 3DS...");
        window.location.href = redirectUrl;
        // Nota: al redirigir, el navegador puede salir de esta página.
      } else {
        console.log(
          "[Billing] ⚠️ No se recibió redirect_url desde Wompi. Revisa la respuesta de createPaymentMethod."
        );
      }

      if (form.autoSubscribe) {
        console.log("[Billing] Creando/actualizando suscripción BASIC...");

        const subRes = await axios.post(
          "/api/billing/subscription/basic",
          {}
        );
        console.log("[Billing] Suscripción BASIC configurada:", subRes.data);
      }

      await loadStatus();
      console.log(
        "[Billing] ✅ Método de pago listo. Después de la autenticación bancaria podrás pagar tu suscripción con el botón «Pagar suscripción ahora»."
      );
    } catch (err: any) {
      console.error(
        "[Billing] ❌ Error guardando método de pago:",
        err?.response?.data || err?.message
      );
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const handleCharge = async () => {
    setLoading(true);
    setLoadingMessage("Procesando pago de suscripción...");

    try {
      console.log("[Billing] Procesando pago de suscripción...");

      const res = await axios.post("/api/billing/subscription/charge", {});
      console.log("[Billing] Resultado del pago de suscripción:", res.data);

      await loadStatus();
    } catch (err: any) {
      console.error(
        "[Billing] ❌ Error al pagar suscripción:",
        err?.response?.data || err?.message
      );
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const handleDeletePaymentMethod = async () => {
    setLoading(true);
    setLoadingMessage("Cargando...");

    try {
      console.log("[Billing] Eliminando método de pago...");

      const res = await axios.delete("/api/billing/payment-method");
      console.log("[Billing] Método de pago eliminado:", res.data);

      await loadStatus();
      console.log(
        "[Billing] ✅ No hay método de pago. Puedes registrar uno nuevo."
      );
    } catch (err: any) {
      console.error(
        "[Billing] ❌ Error al eliminar método de pago:",
        err?.response?.data || err?.message
      );
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const basicPlan = PLANS[0];
  const hasPaymentMethod = !!status?.paymentMethod;
  const empresaPlan = status?.empresaPlan || "gratis";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 space-y-8 relative overflow-hidden">
        {/* Glow premium de fondo */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-32 -right-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        {/* Overlay de loader global */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
              <p className="text-xs text-slate-200 tracking-wide uppercase">
                {loadingMessage ?? "Procesando..."}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-2">
              Billing &amp; Wompi
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/70 text-emerald-200 tracking-wide uppercase">
                Suscripción activa
              </span>
            </h1>
            
          </div>

          {status && (
            <div className="flex flex-col items-end text-right space-y-1 text-xs relative">
              <span className="text-slate-400">Plan actual</span>
              <span
                className={`px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-sm ${
                  empresaPlan === "basic"
                    ? "bg-emerald-600/20 text-emerald-200 border border-emerald-400/70"
                    : empresaPlan === "pro"
                    ? "bg-emerald-700/25 text-emerald-100 border border-emerald-500/70"
                    : "bg-slate-700/40 text-slate-200 border border-slate-600"
                }`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
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

        {/* Layout principal */}
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Panel de estado */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                Estado de facturación
              </h2>

              {!status && (
                <div className="space-y-3">
                  {/* Skeleton premium */}
                  <div className="h-3 w-32 bg-slate-800/70 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-800/60 rounded-md animate-pulse" />
                    <div className="h-3 w-2/3 bg-slate-800/60 rounded-md animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-800/60 rounded-md animate-pulse" />
                  </div>
                </div>
              )}

              {status && (
                <div className="space-y-4 text-sm">
                  {/* Método de pago */}
                  <div className="border-b border-slate-800 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">Método de pago</h3>
                      {hasPaymentMethod && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-200 border border-slate-700">
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
                            className="text-xs px-3 py-1 rounded-full border border-emerald-400/70 text-emerald-200 hover:bg-emerald-500/10 transition shadow-sm"
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
                      <ul className="text-slate-300 text-xs space-y-2 max-h-40 overflow-y-auto pr-1">
                        {status.payments.map((p: any) => (
                          <li
                            key={p.id}
                            className="border border-slate-800 rounded-lg p-2 flex justify-between items-center bg-slate-900/70"
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

            {/* Plan Basic (único plan visible) */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-slate-200 mb-3">
                Tu plan
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div
                  className={[
                    "text-left rounded-xl border px-4 py-3 relative overflow-hidden",
                    "bg-slate-950/60 border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_20px_40px_rgba(0,0,0,0.8)]",
                  ].join(" ")}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-30">
                    <div className="absolute -top-10 right-0 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
                  </div>

                  <div className="flex items-baseline justify-between mb-1 relative">
                    <span className="font-semibold">{basicPlan.name}</span>
                    <span className="text-sm font-semibold text-emerald-300">
                      ${basicPlan.price.toLocaleString("es-CO")} COP / mes
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-2 relative">
                    {basicPlan.desc}
                  </p>

                  <ul className="text-[11px] text-slate-300 space-y-1 relative">
                    {basicPlan.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Plan disponible en este momento:{" "}
                <span className="text-emerald-300 font-medium">
                  {basicPlan.name} ($
                  {basicPlan.price.toLocaleString("es-CO")} COP / mes)
                </span>
              </div>
            </section>
          </div>

          {/* Columna derecha: formulario + acción de pago */}
          <div className="space-y-4">
            {/* Formulario tarjeta */}
            {showCardForm && (
              <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
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
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={form.number}
                      onChange={handleChange}
                      placeholder="•••• •••• •••• ••••"
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
                      placeholder="Nombre del titular"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      Correo electrónico para facturación
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
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
                      Crear/actualizar suscripción BASIC al guardar la tarjeta
                    </label>
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
                    >
                      {loading && (
                        <span className="mr-2 h-3 w-3 rounded-full border-2 border-emerald-900 border-t-transparent animate-spin" />
                      )}
                      {loading ? "Procesando..." : "Guardar método de pago"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Botón de pagar suscripción */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col gap-2 backdrop-blur-sm">
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
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-medium transition shadow-sm ${
                    hasPaymentMethod
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
                      : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  } disabled:opacity-60`}
                >
                  {loading && (
                    <span className="mr-2 h-3 w-3 rounded-full border-2 border-emerald-900 border-t-transparent animate-spin" />
                  )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
