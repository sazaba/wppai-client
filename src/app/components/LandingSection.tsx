"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingSection() {
  const router = useRouter()

  return (
    <section className="w-full px-6 md:px-20 py-20 text-center space-y-8">
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
        Automatiza tus conversaciones <br />
        <span className="text-indigo-500">con IA personalizada</span>
      </h1>
      <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
        Conecta tu número de WhatsApp y deja que nuestra IA capacitada responda por ti.
        Optimiza tu atención al cliente en minutos.
      </p>
      <Button
        onClick={() => router.push("/register")}
        className="text-lg px-7 py-5 rounded-full shadow-xl hover:scale-105 transition"
      >
        <Sparkles className="w-8 h-8 mr-2" />
        Probar gratis ahora
      </Button>
    </section>
  )
}
