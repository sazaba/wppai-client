'use client'

import { Button } from "@/components/ui/button"
import { Sparkles, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import mockup from "../images/mockup-3.webp"
import { motion, Variants } from "framer-motion" // 1. Importamos 'Variants'

// 2. Tipamos explícitamente las constantes como 'Variants'
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
    <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 relative overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Lado Izquierdo: Texto y CTA */}
        <div className="md:col-span-7 space-y-7 text-center md:text-left flex flex-col items-center md:items-start justify-center">
          
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 backdrop-blur-sm">
                <Sparkles className="mr-1.5 h-4 w-4 fill-indigo-500/30" />
                La evolución de WhatsApp Business
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter"
          >
            Automatiza tus chats de 
            <span className="block mt-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
                    WhatsApp con IA
                </span>
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-zinc-600 dark:text-zinc-300 max-w-xl">
            Convierte más clientes y responde en segundos con un asistente que entiende tus productos, servicios y reglas de negocio.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start"
          >
            <Link href="/register">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-12 text-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="mr-2 h-5 w-5 fill-white/50" />
                Probar gratis
              </Button>
            </Link>
            <Link href="#demo">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 h-12 text-lg bg-white/10 dark:bg-white/5 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              >
                Ver demo en vivo
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Lado Derecho: Imagen (Mockup) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 80 }}
          className="md:col-span-5 relative w-full h-[350px] md:h-[600px] mt-10 md:mt-0"
        >
          <div className="absolute inset-0 shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-900/40 rounded-3xl backdrop-blur-sm transform rotate-3 scale-105 opacity-50 translate-x-3 translate-y-3 transition-all duration-700 hover:rotate-0 hover:scale-100" />
          
          <Image
            src={mockup}
            alt="Ilustración de chat automático de Wasaaa"
            fill
            className="object-contain relative z-10 rounded-xl"
            priority
          />
        </motion.div>
        
      </motion.div>
    </section>
  )
}