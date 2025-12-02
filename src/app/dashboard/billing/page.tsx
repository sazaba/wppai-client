// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import axios from "@/lib/axios";

// type PlanCode = "basic";

// type BillingState = {
//   number: string;
//   expMonth: string;
//   expYear: string;
//   cvc: string;
//   cardHolder: string;
//   email: string;
//   autoSubscribe: boolean;
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
//     price: 250000,
//     desc: "Ideal para negocios que desean automatizar su WhatsApp con IA.",
//     features: [
//       "Hasta 1 número de WhatsApp",
//       "300 conversaciones al mes",
//       "Respuestas con IA premium",
//       "Agenda y recordatorios",
//     ],
//   },
// ];

// // Paquetes extra definidos en el frontend (visualización)
// const PACKAGES = [
//   { amount: 300, price: 50000, label: "+300 Conversaciones" },
//   { amount: 600, price: 90000, label: "+600 Conversaciones (Promo)" },
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
//   });

//   const [loading, setLoading] = useState(false);
//   const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
//   const [status, setStatus] = useState<any>(null);
//   const [showCardForm, setShowCardForm] = useState(false);

//   /* ================= Cargar estado de billing ================= */

//   const loadStatus = useCallback(async () => {
//     try {
//       const res = await axios.get("/api/billing/status");
//       setStatus(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   }, []);

//   // Carga inicial
//   useEffect(() => {
//     loadStatus();
//   }, [loadStatus]);

//   // Polling suave para reflejar cambios cuando entra el webhook
//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadStatus();
//     }, 8000); 
//     return () => clearInterval(interval);
//   }, [loadStatus]);

//   // Mostrar / ocultar formulario según si hay método de pago
//   useEffect(() => {
//     if (!status) return;
//     // Solo abrimos el form automáticamente si NO hay tarjeta
//     if (!status.paymentMethod) {
//         setShowCardForm(true);
//     } else {
//         setShowCardForm(false);
//     }
//   }, [status]);

//   /* ================= Handlers ================= */

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value, type, checked } = e.target as any;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // Helper para obtener deviceFingerprint de Wompi
//   const getDeviceFingerprintSafe = async (): Promise<string> => {
//     try {
//       let attempts = 0;
//       const maxAttempts = 5;
//       const delayMs = 1000;

//       while (attempts < maxAttempts) {
//         const w = (window as any).wompi;

//         if (w && typeof w.getDeviceFingerprint === "function") {
//           return await w.getDeviceFingerprint();
//         }

//         attempts++;
//         await new Promise((resolve) => setTimeout(resolve, delayMs));
//       }

//       // Fallback fake si falla el SDK
//       return `fake-fp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//     } catch (err: any) {
//       console.error(err);
//       return `fake-fp-error-${Date.now()}`;
//     }
//   };

//   // 1. Guardar Tarjeta (Original intacto)
//   const handleSavePaymentMethod = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setLoadingMessage("Guardando método de pago...");

//     try {
//       const deviceFingerprint = await getDeviceFingerprintSafe();

//       const pmRes = await axios.post("/api/billing/payment-method", {
//         number: form.number,
//         cvc: form.cvc,
//         exp_month: form.expMonth,
//         exp_year: form.expYear,
//         card_holder: form.cardHolder,
//         email: form.email,
//         deviceFingerprint,
//       });

//       const redirectUrl = pmRes.data?.wompiSource?.redirect_url;

//       if (redirectUrl) {
//         window.location.href = redirectUrl;
//       }

//       if (form.autoSubscribe) {
//         await axios.post("/api/billing/subscription/basic", {});
//       }

//       await loadStatus();
//     } catch (err: any) {
//       console.error(err);
//       alert("Error guardando tarjeta: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//       setLoadingMessage(null);
//     }
//   };

//   // 2. Cobrar Suscripción (Original intacto)
//   const handleCharge = async () => {
//     setLoading(true);
//     setLoadingMessage("Procesando pago de suscripción...");

//     try {
//       await axios.post("/api/billing/subscription/charge", {});
//       await loadStatus();
//       alert("Proceso de pago iniciado. Espera unos segundos a que se refleje.");
//     } catch (err: any) {
//       console.error(err);
//       alert("Error al pagar suscripción: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//       setLoadingMessage(null);
//     }
//   };

//   // 3. Eliminar Tarjeta (Original intacto)
//   const handleDeletePaymentMethod = async () => {
//     if(!confirm("¿Seguro que quieres eliminar tu tarjeta?")) return;
    
//     setLoading(true);
//     setLoadingMessage("Eliminando...");

//     try {
//       await axios.delete("/api/billing/payment-method");
//       await loadStatus();
//     } catch (err: any) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//       setLoadingMessage(null);
//     }
//   };

//   // ✨ 4. NUEVO: Comprar Paquetes de Créditos
//   const handlePurchaseCredits = async (amount: number, price: number) => {
//     if (!confirm(`¿Confirmas la compra de ${amount} conversaciones adicionales por $${price.toLocaleString()} COP?`)) return;

//     setLoading(true);
//     setLoadingMessage("Procesando compra de créditos...");

//     try {
//       const res = await axios.post("/api/billing/purchase-credits", { amount });
      
//       if (res.data.ok) {
//         alert("¡Compra exitosa! Tus créditos han sido agregados.");
//         await loadStatus();
//       } else {
//         alert("El pago no fue aprobado inmediatamente. Estado: " + (res.data.wompi?.status || "Desconocido"));
//       }
//     } catch (err: any) {
//       console.error(err);
//       alert("Error al comprar créditos: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//       setLoadingMessage(null);
//     }
//   };

//   /* ================= Render Helpers ================= */

//   const basicPlan = PLANS[0];
//   const hasPaymentMethod = !!status?.paymentMethod;
//   const empresaPlan = status?.empresaPlan || "gratis";
  
//   // Datos de consumo
//   const used = status?.usage?.used || 0;
//   const limit = status?.usage?.limit || 300; // fallback visual
//   const percent = Math.min(100, Math.round((used / limit) * 100));
//   const isLimitNear = percent >= 80;

//   // Unificar historial (Pagos suscripción + Compras paquetes)
//   // Nota: Esto es visual, en BD son tablas distintas pero las mezclamos para mostrar cronología
//   const allHistory = [
//     ...(status?.payments || []).map((p: any) => ({ ...p, type: 'subscription', label: 'Suscripción' })),
//     ...(status?.conversationPurchases || []).map((p: any) => ({ ...p, type: 'topup', label: `Pack +${p.creditsAmount}` }))
//   ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-6 md:p-8 space-y-8 relative overflow-hidden">
        
//         {/* Glow Effects */}
//         <div className="pointer-events-none absolute inset-0 opacity-40">
//           <div className="absolute -top-32 -right-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
//           <div className="absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
//         </div>

//         {/* Loader Overlay */}
//         {loading && (
//           <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
//             <div className="flex flex-col items-center gap-3">
//               <div className="h-9 w-9 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
//               <p className="text-xs text-slate-200 tracking-wide uppercase font-medium">
//                 {loadingMessage ?? "Procesando..."}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <header className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-semibold mb-1 flex items-center gap-2">
//               Billing &amp; Planes
//               {status?.subscription?.status === 'active' && (
//                 <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/70 text-emerald-200 tracking-wide uppercase">
//                   Activo
//                 </span>
//               )}
//             </h1>
//           </div>

//           {status && (
//             <div className="flex flex-col items-end text-right space-y-1 text-xs relative">
//               <span className="text-slate-400">Plan actual</span>
//               <span
//                 className={`px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-sm ${
//                   empresaPlan === "basic"
//                     ? "bg-emerald-600/20 text-emerald-200 border border-emerald-400/70"
//                     : "bg-slate-700/40 text-slate-200 border border-slate-600"
//                 }`}
//               >
//                 <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
//                 {empresaPlan.toUpperCase()}
//               </span>
//               {status.nextBillingDate && (
//                 <span className="text-slate-500">
//                   Renovación: {new Date(status.nextBillingDate).toLocaleDateString()}
//                 </span>
//               )}
//             </div>
//           )}
//         </header>

//         <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
//           {/* ============ COLUMNA IZQUIERDA ============ */}
//           <div className="space-y-6">
            
//             {/* ✨ NUEVO: Tarjeta de Consumo */}
//             <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm relative overflow-hidden">
//                 <div className="flex justify-between items-end mb-2">
//                     <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
//                         <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                         </svg>
//                         Consumo del mes
//                     </h2>
//                     <span className={`text-xs font-medium ${isLimitNear ? 'text-amber-400' : 'text-emerald-400'}`}>
//                         {used} / {limit} conversaciones
//                     </span>
//                 </div>
                
//                 {/* Barra de progreso */}
//                 <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
//                     <div 
//                         className={`h-full transition-all duration-500 ease-out ${
//                             isLimitNear ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
//                         }`}
//                         style={{ width: `${percent}%` }}
//                     />
//                 </div>
//                 <p className="text-[11px] text-slate-400 mt-2">
//                     {isLimitNear 
//                         ? "⚠️ Estás cerca de alcanzar tu límite. Compra un paquete adicional para no detener el servicio."
//                         : "Tu ciclo se reinicia automáticamente en la fecha de renovación."
//                     }
//                 </p>
//             </section>

//             {/* Estado de Facturación */}
//             <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 backdrop-blur-sm">
//               <h2 className="text-sm font-semibold text-slate-200 mb-1">
//                 Detalles de cuenta
//               </h2>

//               {!status && (
//                 <div className="space-y-3">
//                   <div className="h-3 w-32 bg-slate-800/70 rounded-full animate-pulse" />
//                   <div className="space-y-2">
//                     <div className="h-3 w-full bg-slate-800/60 rounded-md animate-pulse" />
//                     <div className="h-3 w-2/3 bg-slate-800/60 rounded-md animate-pulse" />
//                   </div>
//                 </div>
//               )}

//               {status && (
//                 <div className="space-y-4 text-sm">
//                   {/* Método de pago */}
//                   <div className="border-b border-slate-800 pb-3">
//                     <div className="flex items-center justify-between mb-1">
//                       <h3 className="font-semibold text-slate-300">Método de pago</h3>
//                       {hasPaymentMethod && (
//                         <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
//                           Principal
//                         </span>
//                       )}
//                     </div>

//                     {hasPaymentMethod ? (
//                       <div className="text-slate-300 space-y-2">
//                         <p className="text-sm font-mono tracking-wide">
//                           **** **** **** {status.paymentMethod.lastFour}
//                         </p>
//                         <p className="text-slate-500 text-xs">
//                           {status.paymentMethod.brand} · Exp:{" "}
//                           {status.paymentMethod.expMonth}/{status.paymentMethod.expYear}
//                         </p>

//                         <div className="flex flex-wrap gap-2 mt-2">
//                           <button
//                             type="button"
//                             onClick={() => setShowCardForm(true)}
//                             className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
//                             disabled={loading}
//                           >
//                             Cambiar
//                           </button>
//                           <button
//                             type="button"
//                             onClick={handleDeletePaymentMethod}
//                             className="text-xs px-3 py-1 rounded-full border border-red-900/30 text-red-400 hover:bg-red-900/10 transition"
//                             disabled={loading}
//                           >
//                             Eliminar
//                           </button>
//                         </div>
//                       </div>
//                     ) : (
//                       <p className="text-slate-500 text-sm">
//                         No tienes tarjeta registrada.
//                       </p>
//                     )}
//                   </div>

//                   {/* Historial Unificado */}
//                   <div>
//                     <h3 className="font-semibold text-slate-300 mb-2">Historial de transacciones</h3>
//                     {allHistory.length ? (
//                       <ul className="text-slate-300 text-xs space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
//                         {allHistory.map((p: any) => (
//                           <li
//                             key={p.id + p.type}
//                             className="border border-slate-800 rounded-lg p-2 flex justify-between items-center bg-slate-950/30"
//                           >
//                             <div className="flex flex-col">
//                                 <span className="font-medium text-slate-200">{p.label}</span>
//                                 <span className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</span>
//                             </div>
//                             <div className="text-right">
//                                 <div className="font-mono text-slate-300">${Number(p.amount || p.pricePaid).toLocaleString("es-CO")}</div>
//                                 <span
//                                 className={`text-[10px] uppercase font-bold ${
//                                     p.status === "paid" ? "text-emerald-500" : 
//                                     p.status === "pending" ? "text-amber-500" : "text-red-500"
//                                 }`}
//                                 >
//                                 {p.status}
//                                 </span>
//                             </div>
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <p className="text-slate-500 text-sm">
//                         No hay registros aún.
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </section>

//             {/* Info del Plan */}
//             <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
//               <h2 className="text-sm font-semibold text-slate-200 mb-3">
//                 Tu plan base
//               </h2>
//                 <div
//                   className="text-left rounded-xl border px-4 py-3 relative overflow-hidden bg-slate-950/60 border-emerald-500/30 shadow-inner"
//                 >
//                   <div className="flex items-baseline justify-between mb-1 relative">
//                     <span className="font-semibold text-emerald-100">{basicPlan.name}</span>
//                     <span className="text-sm font-semibold text-emerald-400">
//                       ${basicPlan.price.toLocaleString("es-CO")} / mes
//                     </span>
//                   </div>
//                   <p className="text-xs text-slate-400 mb-2 relative">
//                     {basicPlan.desc}
//                   </p>
//                   <ul className="text-[11px] text-slate-300 space-y-1 relative">
//                     {basicPlan.features.map((f) => (
//                       <li key={f} className="flex items-center gap-1.5">
//                           <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
//                           {f}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//             </section>
//           </div>

//           {/* ============ COLUMNA DERECHA ============ */}
//           <div className="space-y-6">
            
//             {/* Formulario de Tarjeta (Mostrar/Ocultar) */}
//             {showCardForm && (
//               <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm shadow-xl">
//                 <div className="flex items-center justify-between mb-3">
//                   <h2 className="text-sm font-semibold text-slate-200">
//                     {status?.paymentMethod
//                       ? "Actualizar tarjeta"
//                       : "Registrar tarjeta"}
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

//                 <form onSubmit={handleSavePaymentMethod} className="grid gap-3">
//                   <div>
//                     <input
//                       type="text"
//                       name="number"
//                       value={form.number}
//                       onChange={handleChange}
//                       placeholder="Número de tarjeta"
//                       className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
//                       required
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-3">
//                     <input
//                         type="text"
//                         name="expMonth"
//                         value={form.expMonth}
//                         onChange={handleChange}
//                         placeholder="MM"
//                         className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
//                         required
//                     />
//                     <input
//                         type="text"
//                         name="expYear"
//                         value={form.expYear}
//                         onChange={handleChange}
//                         placeholder="YY"
//                         className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
//                         required
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-3">
//                     <input
//                         type="text"
//                         name="cvc"
//                         value={form.cvc}
//                         onChange={handleChange}
//                         placeholder="CVC"
//                         className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
//                         required
//                     />
//                     <input
//                         type="text"
//                         name="cardHolder"
//                         value={form.cardHolder}
//                         onChange={handleChange}
//                         placeholder="Nombre titular"
//                         className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
//                         required
//                     />
//                   </div>
//                   <div>
//                     <input
//                       type="email"
//                       name="email"
//                       value={form.email}
//                       onChange={handleChange}
//                       placeholder="Correo de facturación"
//                       className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
//                       required
//                     />
//                   </div>

//                   <div className="flex items-center gap-2 mt-1">
//                     <input
//                       id="autoSubscribe"
//                       type="checkbox"
//                       name="autoSubscribe"
//                       checked={form.autoSubscribe}
//                       onChange={handleChange}
//                       className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
//                     />
//                     <label htmlFor="autoSubscribe" className="text-xs text-slate-300">
//                       Activar suscripción Basic automáticamente
//                     </label>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="mt-2 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold py-2 disabled:opacity-60 transition shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
//                   >
//                     {loading ? "Guardando..." : "Guardar Tarjeta Segura"}
//                   </button>
//                 </form>
//               </section>
//             )}

//             {/* Acciones de Pago (Solo visibles si hay tarjeta) */}
//             {hasPaymentMethod && (
//                 <div className="space-y-6">
                    
//                     {/* 1. Pagar Suscripción Manual (si aplica) */}
//                     <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
//                         <div className="flex justify-between items-center mb-3">
//                             <h3 className="text-sm font-semibold text-slate-200">Suscripción Mensual</h3>
//                             <span className="text-xs text-emerald-400 font-mono font-medium">$250.000</span>
//                         </div>
//                         <p className="text-xs text-slate-400 mb-4">
//                             Renovación manual del Plan Basic. Reinicia tus 300 créditos y extiende el acceso 30 días.
//                         </p>
//                         <button
//                             type="button"
//                             onClick={handleCharge}
//                             disabled={loading}
//                             className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium py-2 transition"
//                         >
//                             Pagar Suscripción Ahora
//                         </button>
//                     </section>

//                     {/* ✨ 2. NUEVO: Comprar Paquetes Extra */}
//                     <section className="rounded-xl border border-indigo-500/30 bg-slate-900/60 p-4 backdrop-blur-sm relative overflow-hidden">
//                         {/* Destacado visual */}
//                         <div className="absolute top-0 right-0 p-2 opacity-10">
//                             <svg className="w-20 h-20 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
//                                 <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
//                                 <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
//                             </svg>
//                         </div>

//                         <h3 className="text-sm font-semibold text-indigo-200 mb-3 flex items-center gap-2">
//                             <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
//                             ¿Necesitas más conversaciones?
//                         </h3>
                        
//                         <div className="space-y-3">
//                             {PACKAGES.map((pkg) => (
//                                 <button
//                                     key={pkg.amount}
//                                     type="button"
//                                     onClick={() => handlePurchaseCredits(pkg.amount, pkg.price)}
//                                     disabled={loading}
//                                     className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition group"
//                                 >
//                                     <div className="text-left">
//                                         <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-200 transition">
//                                             {pkg.label}
//                                         </div>
//                                         <div className="text-[10px] text-slate-500">Pago único</div>
//                                     </div>
//                                     <div className="text-xs font-bold text-indigo-400">
//                                         ${pkg.price.toLocaleString("es-CO")}
//                                     </div>
//                                 </button>
//                             ))}
//                         </div>
//                     </section>
//                 </div>
//             )}

//             {!hasPaymentMethod && !showCardForm && (
//                 <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
//                     <p className="text-xs text-amber-200 mb-3">
//                         Registra una tarjeta para activar tu suscripción o comprar créditos adicionales.
//                     </p>
//                     <button 
//                         onClick={() => setShowCardForm(true)}
//                         className="text-xs font-medium text-amber-400 hover:text-amber-300 underline"
//                     >
//                         Registrar ahora
//                     </button>
//                 </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "@/lib/axios";
import { 
  CreditCard, 
  Calendar, 
  Zap, 
  Trash2, 
  History, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  Check
} from "lucide-react";

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
  const limit = status?.usage?.limit || 300; 
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const isLimitNear = percent >= 80;

  // Unificar historial
  const allHistory = [
    ...(status?.payments || []).map((p: any) => ({ ...p, type: 'subscription', label: 'Suscripción Mensual' })),
    ...(status?.conversationPurchases || []).map((p: any) => ({ ...p, type: 'topup', label: `Pack +${p.creditsAmount} Conv.` }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    // Contenedor Principal con Fondo y Luces Ambientales
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 relative overflow-hidden">
        
        {/* Luces de Fondo */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Loader Overlay Glassmorphism */}
        {loading && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 bg-zinc-900 p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                    </div>
                    <p className="text-sm text-zinc-300 font-medium tracking-wide animate-pulse">
                        {loadingMessage ?? "Procesando..."}
                    </p>
                </div>
            </div>
        )}

        <div className="max-w-6xl mx-auto relative z-10 space-y-8">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Facturación & Planes
                        {status?.subscription?.status === 'active' && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Activo
                            </span>
                        )}
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Gestiona tu suscripción y métodos de pago</p>
                </div>

                {status && (
                    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-xl p-3 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase font-semibold">Plan Actual</p>
                            <p className="text-white font-bold text-sm capitalize">{empresaPlan}</p>
                        </div>
                        {status.nextBillingDate && (
                            <div className="text-right border-l border-white/10 pl-4">
                                <p className="text-xs text-zinc-500 uppercase font-semibold">Renovación</p>
                                <p className="text-white font-bold text-sm font-mono">
                                    {new Date(status.nextBillingDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMNA IZQUIERDA (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Tarjeta de Consumo */}
                    <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <TrendingUp className="w-32 h-32 text-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        Consumo del mes
                                    </h2>
                                    <p className="text-sm text-zinc-400 mt-1">Conversaciones utilizadas en este ciclo</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-black ${isLimitNear ? 'text-amber-400' : 'text-white'}`}>
                                        {used}
                                    </span>
                                    <span className="text-zinc-500 text-sm font-medium"> / {limit}</span>
                                </div>
                            </div>

                            {/* Barra de Progreso Premium */}
                            <div className="h-4 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg relative ${
                                        isLimitNear 
                                            ? 'bg-gradient-to-r from-amber-600 to-orange-500' 
                                            : 'bg-gradient-to-r from-emerald-600 to-cyan-500'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]" />
                                </div>
                            </div>

                            {isLimitNear && (
                                <div className="mt-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-200/80 leading-relaxed">
                                        <strong>Atención:</strong> Estás cerca de alcanzar tu límite mensual. 
                                        Te recomendamos adquirir un paquete adicional para evitar interrupciones en el servicio de IA.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Métodos de Pago & Historial */}
                    <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <CreditCard className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-lg font-bold text-white">Método de Pago</h2>
                        </div>

                        {hasPaymentMethod ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Tarjeta Registrada Visual */}
                                <div className="relative h-48 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5">
                                            <span className="text-xs font-bold text-white tracking-wider uppercase">
                                                {status.paymentMethod.brand}
                                            </span>
                                        </div>
                                        {status.paymentMethod.brand === 'VISA' ? (
                                            <div className="italic font-bold text-white/20 text-xl">VISA</div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-red-500/20" />
                                        )}
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex gap-3 mb-2">
                                            <span className="text-white/40 text-xl">••••</span>
                                            <span className="text-white/40 text-xl">••••</span>
                                            <span className="text-white/40 text-xl">••••</span>
                                            <span className="text-white font-mono text-xl tracking-widest">{status.paymentMethod.lastFour}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Titular</p>
                                                <p className="text-xs text-white font-medium uppercase tracking-wide">{form.cardHolder || 'USUARIO'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5 text-right">Expira</p>
                                                <p className="text-xs text-white font-medium tracking-wide">
                                                    {status.paymentMethod.expMonth}/{status.paymentMethod.expYear}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones de la tarjeta */}
                                <div className="flex flex-col justify-center gap-3">
                                    <button
                                        onClick={() => setShowCardForm(true)}
                                        disabled={loading}
                                        className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        Actualizar tarjeta
                                    </button>
                                    <button
                                        onClick={handleDeletePaymentMethod}
                                        disabled={loading}
                                        className="w-full py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Eliminar método
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
                                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CreditCard className="w-6 h-6 text-zinc-500" />
                                </div>
                                <p className="text-zinc-400 text-sm mb-4">No tienes ningún método de pago registrado.</p>
                                <button 
                                    onClick={() => setShowCardForm(true)}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                                >
                                    Agregar Tarjeta
                                </button>
                            </div>
                        )}

                        {/* Historial */}
                        <div className="mt-10">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <History className="w-4 h-4 text-zinc-500" />
                                Historial de Transacciones
                            </h3>
                            <div className="bg-zinc-950/50 rounded-xl border border-white/5 overflow-hidden">
                                {allHistory.length ? (
                                    <div className="divide-y divide-white/5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                                        {allHistory.map((p: any, idx) => (
                                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${p.type === 'subscription' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                        {p.type === 'subscription' ? <Calendar className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-200">{p.label}</p>
                                                        <p className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-mono text-white">${Number(p.amount || p.pricePaid).toLocaleString("es-CO")}</p>
                                                    <span className={`text-[10px] uppercase font-bold ${
                                                        p.status === "paid" ? "text-emerald-500" : 
                                                        p.status === "pending" ? "text-amber-500" : "text-red-500"
                                                    }`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-zinc-500 text-sm">
                                        No hay transacciones recientes.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* COLUMNA DERECHA (1/3) - Acciones & Formularios */}
                <div className="space-y-6">
                    
                    {/* Formulario (Overlay o Bloque) */}
                    {showCardForm && (
                        <section className="bg-zinc-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white">Datos de Tarjeta</h3>
                                {status?.paymentMethod && (
                                    <button onClick={() => setShowCardForm(false)} className="text-xs text-zinc-400 hover:text-white">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                            
                            <form onSubmit={handleSavePaymentMethod} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400 ml-1">Número de tarjeta</label>
                                    <input
                                        type="text"
                                        name="number"
                                        value={form.number}
                                        onChange={handleChange}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-400 ml-1">Fecha Exp.</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                name="expMonth"
                                                value={form.expMonth}
                                                onChange={handleChange}
                                                placeholder="MM"
                                                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-center"
                                                required
                                            />
                                            <input
                                                type="text"
                                                name="expYear"
                                                value={form.expYear}
                                                onChange={handleChange}
                                                placeholder="YY"
                                                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-center"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-400 ml-1">CVC</label>
                                        <input
                                            type="text"
                                            name="cvc"
                                            value={form.cvc}
                                            onChange={handleChange}
                                            placeholder="123"
                                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-center"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400 ml-1">Nombre del titular</label>
                                    <input
                                        type="text"
                                        name="cardHolder"
                                        value={form.cardHolder}
                                        onChange={handleChange}
                                        placeholder="Como aparece en la tarjeta"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400 ml-1">Correo de facturación</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="usuario@empresa.com"
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        id="autoSubscribe"
                                        type="checkbox"
                                        name="autoSubscribe"
                                        checked={form.autoSubscribe}
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                                    />
                                    <label htmlFor="autoSubscribe" className="text-xs text-zinc-300 cursor-pointer">
                                        Activar suscripción Basic inmediatamente
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    {loading ? 'Procesando...' : 'Guardar Tarjeta Segura'}
                                </button>

                                <p className="text-[10px] text-center text-zinc-600 mt-2">
                                    Pagos procesados de forma segura por Wompi.
                                </p>
                            </form>
                        </section>
                    )}

                    {/* Acciones Rápidas (Si hay tarjeta y no se está editando) */}
                    {hasPaymentMethod && !showCardForm && (
                        <div className="space-y-6">
                            
                            {/* Plan Info Card */}
                            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    Detalles del Plan
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Precio Base</span>
                                        <span className="text-white font-mono">${basicPlan.price.toLocaleString("es-CO")}</span>
                                    </div>
                                    <ul className="space-y-2 mt-4">
                                        {basicPlan.features.map(f => (
                                            <li key={f} className="text-xs text-zinc-300 flex gap-2">
                                                <span className="w-1 h-1 bg-zinc-500 rounded-full mt-1.5" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    onClick={handleCharge}
                                    disabled={loading}
                                    className="w-full mt-6 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-wide"
                                >
                                    Pagar Suscripción Manual
                                </button>
                            </div>

                            {/* Comprar Créditos */}
                            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-[2rem] p-6">
                                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    Recargar Conversaciones
                                </h3>
                                <p className="text-xs text-zinc-400 mb-4">Paquetes adicionales sin vencimiento.</p>
                                
                                <div className="space-y-3">
                                    {PACKAGES.map((pkg) => (
                                        <button
                                            key={pkg.amount}
                                            onClick={() => handlePurchaseCredits(pkg.amount, pkg.price)}
                                            disabled={loading}
                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-white/5 hover:border-indigo-500/50 hover:bg-zinc-900 transition-all group text-left"
                                        >
                                            <div>
                                                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                    {pkg.label}
                                                </div>
                                                <div className="text-[10px] text-zinc-500">Pago único</div>
                                            </div>
                                            <div className="text-sm font-mono text-indigo-400 font-bold">
                                                ${pkg.price.toLocaleString("es-CO")}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                </div>

            </div>
        </div>
    </div>
  );
}