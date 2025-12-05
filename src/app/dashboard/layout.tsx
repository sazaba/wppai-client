// "use client"

// import Link from "next/link"
// import {
//   BrainCircuit,
//   MessageSquareText,
//   Settings2,
//   ChevronLeft,
//   ChevronRight,
//   Home,
//   FileText,
//   Calendar,
//   CreditCard,
//   ShieldAlert,
//   Menu,
//   X
// } from "lucide-react"
// import { useState, useEffect, useMemo } from "react"
// import { useRouter, usePathname } from "next/navigation"
// import clsx from "clsx"
// import { useAuth } from "../context/AuthContext"
// import Script from "next/script"
// import axios from "axios"
// import { motion, AnimatePresence } from "framer-motion"

// import { ExpiryBanner, BillingStatus } from "../dashboard/ExpiryBanner"

// /* ===================== Configuración ===================== */

// const API_URL = process.env.NEXT_PUBLIC_API_URL as string

// // 🔒 LISTA MAESTRA DE CORREOS
// const SUPER_ADMIN_EMAILS = [
//     'tu_correo_real@gmail.com', 
//     'administrador@gmail.com'
// ]

// function getAuthHeaders(): Record<string, string> {
//   if (typeof window === "undefined") return {}
//   try {
//     const token = localStorage.getItem("token")
//     return token ? { Authorization: `Bearer ${token}` } : {}
//   } catch {
//     return {}
//   }
// }

// /* ===================== Layout Dashboard ===================== */

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const [desktopOpen, setDesktopOpen] = useState(false)
//   const [mobileOpen, setMobileOpen] = useState(false)

//   const { isAuthenticated, usuario } = useAuth()
//   const router = useRouter()
//   const pathname = usePathname()

//   const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)

//   const OPEN_DASH_ROUTES = [
//     "/dashboard/callback",
//     "/dashboard/callback-manual",
//     "/dashboard/wa-embedded",
//   ]
//   const isOpenRoute = OPEN_DASH_ROUTES.some((p) => pathname?.startsWith(p))
  
//   const isChatRoute = pathname?.startsWith("/dashboard/chats")
//   const isOrdersRoute = pathname?.startsWith("/dashboard/orders")
//   const isAppointmentsRoute = pathname?.startsWith("/dashboard/appointments")

//   useEffect(() => {
//     setMobileOpen(false)
//   }, [pathname])

//   useEffect(() => {
//     if (!isAuthenticated && !isOpenRoute) router.replace("/")
//   }, [isAuthenticated, isOpenRoute, router])

//   useEffect(() => {
//     if (!isAuthenticated || isOpenRoute) return
//     const fetchStatus = async () => {
//       try {
//         const res = await axios.get<BillingStatus>(`${API_URL}/api/billing/status`, {
//           headers: getAuthHeaders(),
//         })
//         setBillingStatus(res.data)
//       } catch (err) {
//         console.error("Error cargando billing status", err)
//       }
//     }
//     fetchStatus()
//   }, [isAuthenticated, isOpenRoute])

//   const isSuperAdmin = useMemo(() => {
//     if (!usuario?.email) return false;
//     return SUPER_ADMIN_EMAILS.includes(usuario.email);
//   }, [usuario])

//   const menuItems = useMemo(() => {
//     const items = [
//         { href: "/", icon: Home, label: "Inicio" },
//         { href: "/dashboard", icon: BrainCircuit, label: "Resumen" },
//         { href: "/dashboard/chats", icon: MessageSquareText, label: "Conversaciones" },
//         { href: "/dashboard/appointments", icon: Calendar, label: "Citas" },
//         { href: "/dashboard/billing", icon: CreditCard, label: "Facturación" },
//         { href: "/dashboard/templates", icon: FileText, label: "Plantillas" },
//         { href: "/dashboard/settings", icon: Settings2, label: "Configuración" },
//     ]
//     if (isSuperAdmin) {
//         items.push({ href: "/dashboard/superadmin", icon: ShieldAlert, label: "Superadmin" })
//     }
//     return items
//   }, [isSuperAdmin])

//   if (!isAuthenticated && !isOpenRoute) return null

//   if (isOpenRoute) {
//     return <main className="min-h-screen bg-zinc-950 text-zinc-100">{children}</main>
//   }

//   const NavContent = ({ isOpenMode }: { isOpenMode: boolean }) => (
//     <>
//       <div className={clsx("flex items-center h-20 border-b border-white/5", isOpenMode ? "px-6" : "justify-center px-2")}>
//         <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
//             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-indigo-500/20">
//                 W
//             </div>
//             <div className={clsx("transition-opacity duration-300", isOpenMode ? "opacity-100" : "opacity-0 w-0 hidden")}>
//                 <span className="font-bold text-lg tracking-tight text-white">Wasaaa</span>
//             </div>
//         </div>
//       </div>

//       <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto scrollbar-hide">
//           {menuItems.map((item) => {
//             const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
//             const isSuperAdminItem = item.href === "/dashboard/superadmin"
            
//             return (
//                 <Link 
//                     key={item.href} 
//                     href={item.href}
//                     title={!isOpenMode ? item.label : ""}
//                     className={clsx(
//                         "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
//                         isActive 
//                             ? "bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
//                             : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
//                         isSuperAdminItem && !isActive && "text-red-400 hover:bg-red-500/10 hover:text-red-300"
//                     )}
//                 >
//                     {isActive && (
//                         <motion.div 
//                             layoutId="activeNav"
//                             className={clsx(
//                                 "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
//                                 isSuperAdminItem ? "bg-red-500" : "bg-indigo-500"
//                             )}
//                         />
//                     )}
//                     <item.icon 
//                         className={clsx(
//                             "w-5 h-5 shrink-0 transition-colors",
//                             isActive 
//                                 ? (isSuperAdminItem ? "text-red-500" : "text-indigo-400")
//                                 : (isSuperAdminItem ? "text-red-400/70 group-hover:text-red-400" : "text-zinc-500 group-hover:text-zinc-300")
//                         )} 
//                     />
//                     <span className={clsx(
//                         "text-sm font-medium whitespace-nowrap transition-all duration-300",
//                         isOpenMode ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"
//                     )}>
//                         {item.label}
//                     </span>
//                 </Link>
//             )
//           })}
//       </nav>
//     </>
//   )

//   return (
//     <>
//       <Script src="https://cdn.wompi.co/v1/sdk.js" strategy="afterInteractive" />

//       <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex md:grid md:grid-cols-[auto_1fr] relative">
        
//         {/* Fondo ambiental */}
//         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
//             <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
//             <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
//         </div>

//         {/* === SIDEBAR DESKTOP (Oculto en móvil) === */}
//         <aside
//           className={clsx(
//             "hidden md:flex h-full relative z-40 flex-col justify-between transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
//             "bg-zinc-900/60 backdrop-blur-xl border-r border-white/5 shadow-2xl",
//             desktopOpen ? "w-64" : "w-[88px]" 
//           )}
//         >
//           <NavContent isOpenMode={desktopOpen} />

//           <div className="p-4 border-t border-white/5">
//             <button
//               onClick={() => setDesktopOpen(!desktopOpen)}
//               className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
//             >
//                 {desktopOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
//             </button>
//           </div>
//         </aside>

//         {/* === MENU MÓVIL (DRAWER) === */}
//         <AnimatePresence>
//           {mobileOpen && (
//             <>
//               <motion.div 
//                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                 onClick={() => setMobileOpen(false)}
//                 className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
//               />
//               <motion.aside
//                 initial={{ x: "-100%" }}
//                 animate={{ x: 0 }}
//                 exit={{ x: "-100%" }}
//                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                 className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl md:hidden flex flex-col"
//               >
//                 <div className="flex justify-end p-4 absolute top-2 right-2 z-50">
//                    <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white">
//                       <X className="w-5 h-5" />
//                    </button>
//                 </div>
//                 <NavContent isOpenMode={true} />
//               </motion.aside>
//             </>
//           )}
//         </AnimatePresence>

//         {/* === MAIN CONTENT === */}
//         <main
//           className={clsx(
//             "h-full w-full relative z-10 overflow-hidden flex flex-col flex-1",
//             "transition-all duration-500"
//           )}
//         >
//           {!isChatRoute && !isOrdersRoute && !isAppointmentsRoute && billingStatus && (
//              <div className="shrink-0">
//                 <ExpiryBanner status={billingStatus} />
//              </div>
//           )}

//           <div
//             className={clsx(
//               "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent",
//               isChatRoute || isOrdersRoute || isAppointmentsRoute ? "p-0" : "p-4 sm:p-8 pb-24 md:pb-8" 
//             )}
//           >
//             {children}
//           </div>
//         </main>
//       </div>

//       {/* === BOTÓN FLOTANTE MÓVIL (FAB) - FUERA DEL CONTENEDOR PRINCIPAL === */}
//       <div className="md:hidden fixed bottom-6 right-6 z-[100]">
//         <motion.button
//             whileTap={{ scale: 0.9 }}
//             onClick={() => setMobileOpen(true)}
//             className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-[0_0_25px_rgba(79,70,229,0.6)] border border-indigo-400/30 backdrop-blur-md"
//         >
//             <Menu className="w-7 h-7" />
//         </motion.button>
//       </div>

//     </>
//   )
// }



"use client"

import Link from "next/link"
import {
  BrainCircuit,
  MessageSquareText,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Calendar,
  CreditCard,
  ShieldAlert,
  Menu,
  X,
  FlaskConical // 👈 Importamos el ícono del matraz
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"
import { useAuth } from "../context/AuthContext"
import Script from "next/script"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

import { ExpiryBanner, BillingStatus } from "../dashboard/ExpiryBanner"

/* ===================== Configuración ===================== */

const API_URL = process.env.NEXT_PUBLIC_API_URL as string

// 🔒 LISTA MAESTRA DE CORREOS
const SUPER_ADMIN_EMAILS = [
    'tu_correo_real@gmail.com', 
    'administrador@gmail.com'
]

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

/* ===================== Layout Dashboard ===================== */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { isAuthenticated, usuario } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)

  const OPEN_DASH_ROUTES = [
    "/dashboard/callback",
    "/dashboard/callback-manual",
    "/dashboard/wa-embedded",
  ]
  const isOpenRoute = OPEN_DASH_ROUTES.some((p) => pathname?.startsWith(p))
  
  const isChatRoute = pathname?.startsWith("/dashboard/chats")
  const isOrdersRoute = pathname?.startsWith("/dashboard/orders")
  const isAppointmentsRoute = pathname?.startsWith("/dashboard/appointments")

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isAuthenticated && !isOpenRoute) router.replace("/")
  }, [isAuthenticated, isOpenRoute, router])

  useEffect(() => {
    if (!isAuthenticated || isOpenRoute) return
    const fetchStatus = async () => {
      try {
        const res = await axios.get<BillingStatus>(`${API_URL}/api/billing/status`, {
          headers: getAuthHeaders(),
        })
        setBillingStatus(res.data)
      } catch (err) {
        console.error("Error cargando billing status", err)
      }
    }
    fetchStatus()
  }, [isAuthenticated, isOpenRoute])

  const isSuperAdmin = useMemo(() => {
    if (!usuario?.email) return false;
    return SUPER_ADMIN_EMAILS.includes(usuario.email);
  }, [usuario])

  const menuItems = useMemo(() => {
    const items = [
        { href: "/", icon: Home, label: "Inicio" },
        { href: "/dashboard", icon: BrainCircuit, label: "Resumen" },
        { href: "/dashboard/chats", icon: MessageSquareText, label: "Conversaciones" },
        { href: "/dashboard/appointments", icon: Calendar, label: "Citas" },
        { href: "/dashboard/billing", icon: CreditCard, label: "Facturación" },
        { href: "/dashboard/templates", icon: FileText, label: "Plantillas" },
        // 👇👇 RUTA DE PRUEBA AGREGADA 👇👇
        { href: "/dashboard/test", icon: FlaskConical, label: "Lab / Tests" },
        // 👆👆 ----------------------- 👆👆
        { href: "/dashboard/settings", icon: Settings2, label: "Configuración" },
    ]
    if (isSuperAdmin) {
        items.push({ href: "/dashboard/superadmin", icon: ShieldAlert, label: "Superadmin" })
    }
    return items
  }, [isSuperAdmin])

  if (!isAuthenticated && !isOpenRoute) return null

  if (isOpenRoute) {
    return <main className="min-h-screen bg-zinc-950 text-zinc-100">{children}</main>
  }

  const NavContent = ({ isOpenMode }: { isOpenMode: boolean }) => (
    <>
      <div className={clsx("flex items-center h-20 border-b border-white/5", isOpenMode ? "px-6" : "justify-center px-2")}>
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-indigo-500/20">
                W
            </div>
            <div className={clsx("transition-opacity duration-300", isOpenMode ? "opacity-100" : "opacity-0 w-0 hidden")}>
                <span className="font-bold text-lg tracking-tight text-white">Wasaaa</span>
            </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
            const isSuperAdminItem = item.href === "/dashboard/superadmin"
            
            return (
                <Link 
                    key={item.href} 
                    href={item.href}
                    title={!isOpenMode ? item.label : ""}
                    className={clsx(
                        "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                        isActive 
                            ? "bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
                        isSuperAdminItem && !isActive && "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    )}
                >
                    {isActive && (
                        <motion.div 
                            layoutId="activeNav"
                            className={clsx(
                                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
                                isSuperAdminItem ? "bg-red-500" : "bg-indigo-500"
                            )}
                        />
                    )}
                    <item.icon 
                        className={clsx(
                            "w-5 h-5 shrink-0 transition-colors",
                            isActive 
                                ? (isSuperAdminItem ? "text-red-500" : "text-indigo-400")
                                : (isSuperAdminItem ? "text-red-400/70 group-hover:text-red-400" : "text-zinc-500 group-hover:text-zinc-300")
                        )} 
                    />
                    <span className={clsx(
                        "text-sm font-medium whitespace-nowrap transition-all duration-300",
                        isOpenMode ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                    )}>
                        {item.label}
                    </span>
                </Link>
            )
          })}
      </nav>
    </>
  )

  return (
    <>
      <Script src="https://cdn.wompi.co/v1/sdk.js" strategy="afterInteractive" />

      <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex md:grid md:grid-cols-[auto_1fr] relative">
        
        {/* Fondo ambiental */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
        </div>

        {/* === SIDEBAR DESKTOP (Oculto en móvil) === */}
        <aside
          className={clsx(
            "hidden md:flex h-full relative z-40 flex-col justify-between transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
            "bg-zinc-900/60 backdrop-blur-xl border-r border-white/5 shadow-2xl",
            desktopOpen ? "w-64" : "w-[88px]" 
          )}
        >
          <NavContent isOpenMode={desktopOpen} />

          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => setDesktopOpen(!desktopOpen)}
              className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
            >
                {desktopOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </aside>

        {/* === MENU MÓVIL (DRAWER) === */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl md:hidden flex flex-col"
              >
                <div className="flex justify-end p-4 absolute top-2 right-2 z-50">
                   <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                <NavContent isOpenMode={true} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* === MAIN CONTENT === */}
        <main
          className={clsx(
            "h-full w-full relative z-10 overflow-hidden flex flex-col flex-1",
            "transition-all duration-500"
          )}
        >
          {!isChatRoute && !isOrdersRoute && !isAppointmentsRoute && billingStatus && (
             <div className="shrink-0">
                <ExpiryBanner status={billingStatus} />
             </div>
          )}

          <div
            className={clsx(
              "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent",
              isChatRoute || isOrdersRoute || isAppointmentsRoute ? "p-0" : "p-4 sm:p-8 pb-24 md:pb-8" 
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* === BOTÓN FLOTANTE MÓVIL (FAB) - FUERA DEL CONTENEDOR PRINCIPAL === */}
      <div className="md:hidden fixed bottom-6 right-6 z-[100]">
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-[0_0_25px_rgba(79,70,229,0.6)] border border-indigo-400/30 backdrop-blur-md"
        >
            <Menu className="w-7 h-7" />
        </motion.button>
      </div>

    </>
  )
}