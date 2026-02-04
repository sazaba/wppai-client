// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { Dialog } from '@headlessui/react'
// import { CheckCircleIcon, BuildingOfficeIcon, EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
// import { motion, AnimatePresence } from 'framer-motion'
// // @ts-ignore
// import confetti from 'canvas-confetti'
// import { useAuth } from '../context/AuthContext'
// import axios from 'axios'
// import Link from 'next/link'
// import Image from 'next/image'
// import logo from '../images/Logo-Wasaaa.webp' // Asegúrate de que la ruta sea correcta

// export default function RegisterPage() {
//   const router = useRouter()
//   const { setToken, setUsuario, setEmpresa } = useAuth()

//   const [nombreEmpresa, setNombreEmpresa] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [showModal, setShowModal] = useState(false)

//   // 🎉 Confeti de celebración al registrarse
//   useEffect(() => {
//     if (showModal) {
//       const duration = 2.5 * 1000
//       const end = Date.now() + duration

//       const frame = () => {
//         confetti({
//           particleCount: 4,
//           angle: 60,
//           spread: 55,
//           origin: { x: 0 },
//           colors: ['#818cf8', '#c084fc', '#2dd4bf'] // Colores ajustados al tema
//         })
//         confetti({
//           particleCount: 4,
//           angle: 120,
//           spread: 55,
//           origin: { x: 1 },
//           colors: ['#818cf8', '#c084fc', '#2dd4bf']
//         })

//         if (Date.now() < end) {
//           requestAnimationFrame(frame)
//         }
//       }
//       frame()
//     }
//   }, [showModal])

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ nombreEmpresa, email, password }),
//       })

//       if (!res.ok) {
//         const { error } = await res.json()
//         setError(error || 'Error al registrar')
//         setLoading(false)
//         return
//       }

//       const { token, empresaId } = await res.json()

//       // Guardar sesión
//       localStorage.setItem('token', token)
//       const payload = JSON.parse(atob(token.split('.')[1]))
//       const usuario = {
//         id: payload.id,
//         email: payload.email,
//         rol: payload.rol,
//         empresaId: payload.empresaId
//       }
//       localStorage.setItem('usuario', JSON.stringify(usuario))

//       setToken(token)
//       setUsuario(usuario)

//       // Cargar datos de empresa en background
//       try {
//         const empresaRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/empresa`, {
//           headers: { Authorization: `Bearer ${token}` }
//         })
//         setEmpresa(empresaRes.data)
//       } catch (empresaErr: any) {
//         console.error('[RegisterPage] Warning cargando empresa:', empresaErr)
//       }

//       // Mostrar éxito
//       setShowModal(true)

//     } catch (err: any) {
//       console.error('[RegisterPage] Error:', err)
//       setError(err.response?.data?.error || err.message || 'Error inesperado')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleGoDashboard = () => {
//     setShowModal(false)
//     router.push('/dashboard')
//   }

//   return (
//     <>
//       {/* Contenedor Principal con Fondo Ambiental */}
//       {/* CAMBIO: Se ajustó el padding (pt-28 en adelante) para evitar que el Navbar fijo tape el contenido en responsive */}
//       <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 pt-28 pb-12 sm:px-6 lg:px-8 relative overflow-hidden">
        
//         {/* Luces de Fondo */}
//         <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-emerald-500/10 blur-[80px] md:blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-indigo-500/10 blur-[80px] md:blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" />

//         {/* Tarjeta Glassmorphism */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-10 w-full max-w-md relative z-10"
//         >
//           {/* Header */}
//           <div className="text-center mb-8">
//             <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
//                 <Image src={logo} alt="Wasaaa Logo" width={60} height={60} className="w-14 h-14 md:w-16 md:h-16 mx-auto drop-shadow-lg" />
//             </Link>
//             <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
//               Crea tu cuenta gratis
//             </h1>
//             <p className="text-zinc-400 text-sm mt-2">
//               Automatiza tu negocio en segundos
//             </p>
//           </div>

//           {error && (
//             <motion.div 
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: 'auto' }}
//               className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg p-3 mb-6 text-center"
//             >
//               {error}
//             </motion.div>
//           )}

//           <form onSubmit={handleRegister} className="space-y-5">
            
//             {/* Input Nombre Empresa */}
//             <div className="space-y-2">
//               <label className="text-xs font-medium text-zinc-300 ml-1 uppercase tracking-wider">Nombre del Negocio</label>
//               <div className="relative group">
//                 <BuildingOfficeIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
//                 <input
//                   type="text"
//                   value={nombreEmpresa}
//                   onChange={(e) => setNombreEmpresa(e.target.value)}
//                   className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm md:text-base"
//                   placeholder="Ej: Clínica Estética Dra. Ana"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Input Correo */}
//             <div className="space-y-2">
//               <label className="text-xs font-medium text-zinc-300 ml-1 uppercase tracking-wider">Correo electrónico</label>
//               <div className="relative group">
//                 <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm md:text-base"
//                   placeholder="ejemplo@empresa.com"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Input Contraseña */}
//             <div className="space-y-2">
//               <label className="text-xs font-medium text-zinc-300 ml-1 uppercase tracking-wider">Contraseña</label>
//               <div className="relative group">
//                 <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm md:text-base"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Botón CTA */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full mt-2 relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-zinc-900 shadow-lg shadow-indigo-500/20"
//             >
//               <div className="relative rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors h-full w-full py-3">
//                  <span className="relative flex items-center justify-center text-white font-bold text-sm tracking-wide">
//                     {loading ? (
//                         <span className="flex items-center gap-2">
//                             <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                             Creando cuenta...
//                         </span>
//                     ) : 'Registrar Empresa'}
//                  </span>
//               </div>
//             </button>
//           </form>

//           {/* Footer Card */}
//           <div className="mt-8 text-center border-t border-white/5 pt-6">
//             <p className="text-zinc-400 text-sm">
//               ¿Ya tienes una cuenta?{' '}
//               <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
//                 Inicia sesión aquí
//               </Link>
//             </p>
//             <div className="mt-6">
//                 <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm group">
//                     <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
//                     Volver al inicio
//                 </Link>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* Modal de Éxito Ultra Premium */}
//       <AnimatePresence>
//         {showModal && (
//           <Dialog
//             open={showModal}
//             onClose={() => {}} // No cerrar al hacer clic afuera
//             className="fixed inset-0 z-50 flex items-center justify-center"
//           >
//             {/* Fondo oscuro con blur */}
//             <motion.div
//               className="absolute inset-0 bg-black/80 backdrop-blur-md"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.4 }}
//             />

//             {/* Contenedor Modal */}
//             <div className="relative w-full h-full flex items-center justify-center p-4">
//                 <Dialog.Panel className="w-full max-w-sm mx-auto bg-transparent shadow-none">
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.9, y: 20 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.9, y: 20 }}
//                         transition={{ type: "spring", stiffness: 300, damping: 25 }}
//                         className="relative z-10 bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl w-full text-center overflow-hidden"
//                     >
//                         {/* Brillo superior */}
//                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

//                         <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             transition={{ delay: 0.2, type: "spring" }}
//                             className="mx-auto w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 mb-6"
//                         >
//                             <CheckCircleIcon className="w-10 h-10 text-white" />
//                         </motion.div>

//                         <motion.h2
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.3 }}
//                             className="text-2xl font-bold text-white mb-2"
//                         >
//                             ¡Registro Exitoso!
//                         </motion.h2>
                        
//                         <motion.div
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ delay: 0.4 }}
//                             className="text-zinc-400 mb-8 text-sm"
//                         >
//                             <p>Tu empresa <strong className="text-emerald-400">{nombreEmpresa}</strong> ha sido creada.</p>
//                             <p className="mt-2 text-xs opacity-70">Disfruta de 30 días de prueba Premium.</p>
//                         </motion.div>

//                         <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             onClick={handleGoDashboard}
//                             className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20"
//                         >
//                             Ir al Dashboard 🚀
//                         </motion.button>
//                     </motion.div>
//                 </Dialog.Panel>
//             </div>
//           </Dialog>
//         )}
//       </AnimatePresence>
//     </>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from '@headlessui/react'
import { CheckCircleIcon, BuildingOfficeIcon, EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
// @ts-ignore
import confetti from 'canvas-confetti'
// import { useAuth } from '../context/AuthContext' <--- YA NO NECESITAS ESTO AQUÍ
import Link from 'next/link'
import Image from 'next/image'
import logo from '../images/Logo-Wasaaa.webp' 

export default function RegisterPage() {
  const router = useRouter()
  // const { setToken, setUsuario, setEmpresa } = useAuth() <--- ELIMINADO

  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // 🎉 Confeti (Mantenemos tu animación)
  useEffect(() => {
    if (showModal) {
      const duration = 2.5 * 1000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 4, angle: 60, spread: 55, origin: { x: 0 },
          colors: ['#818cf8', '#c084fc', '#2dd4bf']
        })
        confetti({
          particleCount: 4, angle: 120, spread: 55, origin: { x: 1 },
          colors: ['#818cf8', '#c084fc', '#2dd4bf']
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [showModal])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreEmpresa, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrar')
        setLoading(false)
        return
      }

      // CAMBIO CLAVE: Ya no guardamos token ni redirigimos
      // Solo mostramos el modal que avisa del correo
      setShowModal(true)

    } catch (err: any) {
      console.error('[RegisterPage] Error:', err)
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 pt-28 pb-12 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Fondos */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-emerald-500/10 blur-[80px] md:blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-indigo-500/10 blur-[80px] md:blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-10 w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
                <Image src={logo} alt="Wasaaa Logo" width={60} height={60} className="w-14 h-14 md:w-16 md:h-16 mx-auto drop-shadow-lg" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Crea tu cuenta gratis
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              Automatiza tu negocio en segundos
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg p-3 mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Input Nombre Empresa */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 ml-1 uppercase tracking-wider">Nombre del Negocio</label>
              <div className="relative group">
                <BuildingOfficeIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm md:text-base"
                  placeholder="Ej: Clínica Estética Dra. Ana"
                  required
                />
              </div>
            </div>

            {/* Input Correo */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 ml-1 uppercase tracking-wider">Correo electrónico</label>
              <div className="relative group">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm md:text-base"
                  placeholder="ejemplo@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 ml-1 uppercase tracking-wider">Contraseña</label>
              <div className="relative group">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm md:text-base"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 relative group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg shadow-indigo-500/20"
            >
              <div className="relative rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors h-full w-full py-3">
                 <span className="relative flex items-center justify-center text-white font-bold text-sm tracking-wide">
                    {loading ? 'Procesando...' : 'Registrar Empresa'}
                 </span>
              </div>
            </button>
          </form>

          {/* Footer Card */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-zinc-400 text-sm">
              ¿Ya tienes una cuenta? <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300">Inicia sesión aquí</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modal de Éxito MODIFICADO */}
      <AnimatePresence>
        {showModal && (
          <Dialog open={showModal} onClose={() => {}} className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

            <div className="relative w-full h-full flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-sm mx-auto bg-transparent shadow-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative z-10 bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl w-full text-center overflow-hidden"
                    >
                        {/* Ícono de Correo */}
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                            className="mx-auto w-20 h-20 bg-gradient-to-tr from-indigo-400 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6"
                        >
                            <EnvelopeIcon className="w-10 h-10 text-white" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-white mb-2">¡Casi listo! 📧</h2>
                        
                        <div className="text-zinc-400 mb-8 text-sm">
                            <p>Hemos enviado un enlace de activación a <strong className="text-indigo-400">{email}</strong>.</p>
                            <p className="mt-4 text-xs opacity-70 bg-white/5 p-3 rounded-lg border border-white/5">
                                Revisa tu bandeja de entrada (o Spam) y haz clic en el botón para activar tu cuenta.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/login')}
                            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg"
                        >
                            Entendido, ir al Login
                        </motion.button>
                    </motion.div>
                </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}