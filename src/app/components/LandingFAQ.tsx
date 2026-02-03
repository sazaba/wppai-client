'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion, Variants } from "framer-motion"
import { Sparkles } from "lucide-react"

const faqs = [
  {
    question: "¿La IA sabe responder preguntas médicas?",
    answer: "Está entrenada para responder dudas frecuentes sobre tratamientos, cuidados pre y post operatorios básicos y precios. Para consultas médicas complejas, la IA deriva inmediatamente al especialista.",
  },
  {
    question: "¿Es difícil de configurar para mi clínica?",
    answer: "No. Solo necesitas subir tus PDFs de servicios (Botox, Ácido Hialurónico, etc.) y tu lista de precios. Nosotros nos encargamos del entrenamiento inicial.",
  },
  {
    question: "¿Puedo ver las conversaciones?",
    answer: "Sí, tienes un panel de control donde ves en tiempo real cómo la IA atiende a tus pacientes. Puedes intervenir en cualquier momento si lo deseas.",
  },
  {
    question: "¿Qué pasa si un paciente pide hablar con un humano?",
    answer: "El sistema detecta la intención y transfiere el chat a tu recepcionista o al doctor encargado, enviando una alerta a tu celular.",
  },
  {
    question: "¿Cumple con la confidencialidad del paciente?",
    answer: "Absolutamente. No almacenamos datos sensibles médicos para entrenamiento público. Tu base de datos es privada y segura.",
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
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-sm font-semibold border border-rose-500/20 mb-4"
          >
            <Sparkles className="w-4 h-4 fill-rose-500/20" />
            Preguntas Frecuentes
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-white"
          >
            Resuelve tus dudas sobre la <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400">Automatización</span>
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
                  // ESTILO DARK MODE ADAPTADO:
                  // Fondo oscuro muy sutil, borde casi invisible que se ilumina en rosa al hover
                  className="group border border-white/10 bg-white/[0.03] rounded-2xl px-6 transition-all duration-300 hover:border-rose-500/30 hover:bg-white/[0.05] data-[state=open]:bg-white/[0.08] data-[state=open]:border-rose-500/20"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-slate-200 py-6 hover:no-underline hover:text-rose-400 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-slate-400 pb-6 leading-relaxed">
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