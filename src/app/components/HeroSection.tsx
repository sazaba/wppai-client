'use client'

import { Button } from "@/components/ui/button"
import { Sparkles, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import HeroChatAnimation from "./HeroChatAnimation" // Importamos la animación

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.5,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  },
}

export default function HeroSection() {
  return (
    <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 relative overflow-hidden min-h-[90vh] flex items-center">
      <motion.div
        className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Lado Izquierdo: Texto y CTA */}
        <div className="md:col-span-7 space-y-8 text-center md:text-left flex flex-col items-center md:items-start justify-center relative z-20">
          
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 backdrop-blur-sm">
                <Sparkles className="mr-1.5 h-4 w-4 fill-indigo-500/30" />
                La evolución de WhatsApp Business
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter text-gray-900 dark:text-white"
          >
            Automatiza tus chats de 
            <span className="block mt-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
                    WhatsApp con IA
                </span>
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed">
            Convierte más clientes y responde en segundos con un asistente que entiende tus productos, servicios y reglas de negocio.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start w-full sm:w-auto"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto rounded-full px-8 h-12 text-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="mr-2 h-5 w-5 fill-white/50" />
                Probar gratis
              </Button>
            </Link>
            <Link href="#demo" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto rounded-full px-8 h-12 text-lg bg-white/50 dark:bg-white/5 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Ver demo en vivo
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Lado Derecho: ANIMACIÓN DEL CHAT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 80, damping: 20 }}
          className="md:col-span-5 relative w-full flex items-center justify-center perspective-1000"
        >
          {/* Componente de Chat Animado en Inglés */}
          <div className="transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out">
             <HeroChatAnimation />
          </div>

          {/* Elementos decorativos flotantes alrededor del chat */}
          <motion.div 
             animate={{ y: [0, -15, 0] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-20 -right-4 md:-right-12 bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 z-30 max-w-[180px]"
          >
             <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
             </div>
             <p className="text-sm font-bold text-gray-900 dark:text-white">Leads Capturados</p>
             <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">+142%</p>
          </motion.div>

        </motion.div>
        
      </motion.div>
    </section>
  )
}