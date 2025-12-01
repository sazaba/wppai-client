'use client'

import { Check, Sparkles, Zap, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
          >
            Un plan simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">resultados masivos</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            Todo lo que necesitas para automatizar tu negocio en un solo paquete premium. Sin comisiones ocultas.
          </motion.p>
        </div>

        {/* Tarjeta de Precio Único (Hero Card) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Efecto de Resplandor (Glow) detrás de la tarjeta */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur-xl opacity-30 dark:opacity-40 animate-pulse-slow" />

          {/* Tarjeta Principal */}
          <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden">
            
            {/* Decoración de fondo interna */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              {/* Columna Izquierda: Precio y Título */}
              <div className="space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-semibold border border-indigo-200 dark:border-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                  Plan Premium Todo Incluido
                </div>

                <div>
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 -mb-4">$</span>
                    <span className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight">250.000</span>
                    <span className="text-xl font-medium text-gray-500 dark:text-gray-400">COP/mes</span>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                    Diseñado para clínicas estéticas y negocios de alto flujo que no pueden perder ni un solo cliente.
                  </p>
                </div>

                <Link href="/register" className="block">
                  <Button className="w-full h-14 text-lg rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02]">
                    Comenzar ahora
                  </Button>
                </Link>
                <p className="text-xs text-center md:text-left text-gray-400 dark:text-gray-500">
                  Sin contratos forzosos. Cancela cuando quieras.
                </p>
              </div>

              {/* Columna Derecha: Beneficios */}
              <div className="bg-gray-50/50 dark:bg-white/5 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-white/5">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Lo que incluye tu membresía:
                </h3>
                
                <ul className="space-y-4">
                  {/* Item Destacado */}
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={3} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">300 Conversaciones Premium</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Incluidas cada mes con IA avanzada.</p>
                    </div>
                  </li>

                  {/* Feature Killer: Descuento */}
                  <li className="flex items-start gap-3 relative">
                    <div className="absolute -left-2 -top-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] bg-green-500/5 rounded-xl -z-10 border border-green-500/20" />
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={3} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Recargas con 80% OFF
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 uppercase tracking-wider">Ahorro</span>
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Si necesitas más, paga una fracción del costo.</p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium pt-1">Dashboard de métricas avanzado</span>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium pt-1">Agenda y confirmación de citas</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium pt-1">Soporte técnico prioritario</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </motion.div>
        
        {/* FAQ Trigger o texto de confianza */}
        <div className="text-center mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4" />
                ¿Tienes un volumen mayor a 5.000 chats? <a href="#contact" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Contáctanos para un plan Enterprise</a>
            </p>
        </div>

      </div>
    </section>
  )
}