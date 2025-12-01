'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, Variants } from "framer-motion"
import { Sparkles } from "lucide-react"

const faqs = [
  {
    question: "¿Qué es exactamente Wasaaa?",
    answer: "Es un SaaS que conecta tu WhatsApp Business con una Inteligencia Artificial entrenada específicamente con tus datos. Atiende clientes 24/7, agenda citas, resuelve dudas y clasifica leads sin intervención humana.",
  },
  {
    question: "¿Necesito saber programar?",
    answer: "Para nada. Nuestra plataforma es 'No-Code'. Solo escaneas un código QR (o conectas la API), subes tus documentos/reglas y listo. En 10 minutos puedes tener tu IA funcionando.",
  },
  {
    question: "¿Puedo entrenar la IA con mis propios datos?",
    answer: "Sí, es su principal fortaleza. Puedes cargar tus PDFs de servicios, listas de precios, horarios y reglas de negocio. La IA responderá basándose estrictamente en esa información.",
  },
  {
    question: "¿Qué pasa si la IA no sabe la respuesta?",
    answer: "El sistema está diseñado para ser honesto. Si no tiene la información o detecta un cliente frustrado, marca la conversación como 'Requiere Humano' y te notifica para que intervengas.",
  },
  {
    question: "¿Cómo funciona el límite de conversaciones?",
    answer: "El plan incluye 300 conversaciones completas al mes. Si te excedes, el sistema sigue funcionando y puedes adquirir paquetes de conversaciones adicionales con un 80% de descuento.",
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5 } 
  }
}

export default function LandingFAQ() {
  return (
    <section className="py-24 relative z-10" id="faqs">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold border border-indigo-500/20 mb-4"
          >
            <Sparkles className="w-4 h-4 fill-indigo-500/20" />
            Preguntas Frecuentes
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white"
          >
            Resuelve tus dudas en segundos
          </motion.h2>
        </div>

        {/* Accordion Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem 
                  value={`item-${index}`} 
                  // Estilo Cápsula de Cristal:
                  // 1. Sin borde inferior default (border-b-0)
                  // 2. Fondo traslúcido (bg-white/50)
                  // 3. Borde completo redondeado (rounded-2xl)
                  className="group border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl px-6 transition-all duration-200 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 data-[state=open]:bg-white/80 dark:data-[state=open]:bg-zinc-800/80 data-[state=open]:shadow-lg"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 py-6 hover:no-underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600 dark:text-gray-300 pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

      </div>
    </section>
  )
}