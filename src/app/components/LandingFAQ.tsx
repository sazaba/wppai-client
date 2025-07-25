'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

const faqs = [
  {
    question: "¿Qué es esta plataforma?",
    answer: "Es un SaaS que automatiza respuestas por WhatsApp usando inteligencia artificial entrenada con tu negocio. Atiende clientes 24/7, clasifica conversaciones y escala a humanos cuando es necesario.",
  },
  {
    question: "¿Necesito saber programar?",
    answer: "No. Nuestra plataforma está diseñada para que cualquier negocio pueda usarla fácilmente. Solo debes conectar tu cuenta de WhatsApp Business y configurar tu información básica.",
  },
  {
    question: "¿Puedo entrenar la IA con mis productos o servicios?",
    answer: "Sí. Puedes ingresar tus servicios, preguntas frecuentes, reglas de escalado, horarios y más desde tu panel de configuración.",
  },
  {
    question: "¿Qué pasa si la IA no sabe qué responder?",
    answer: "Si la IA detecta dudas o palabras clave como 'hablar con humano', la conversación se marca como 'requiere agente' para que tú o tu equipo la atiendan.",
  },
  {
    question: "¿Cómo funciona el plan gratuito?",
    answer: "Puedes recibir hasta 100 conversaciones al mes con la IA respondiendo automáticamente. Si necesitas más, puedes pasar al plan Pro sin perder tus datos.",
  },
]

export default function LandingFAQ() {
  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2">
          <Sparkles className="w-4 h-4" />
          Preguntas frecuentes
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Todo lo que necesitas saber
        </h2>
        <p className="text-muted-foreground mt-2">
          Respuestas a las dudas más comunes sobre la plataforma.
        </p>
      </motion.div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <AccordionItem value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </section>
  )
}
