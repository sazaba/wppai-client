'use client'

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import mockup from "../images/mockup-1.webp"

export default function HeroSection() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Texto principal */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Automatiza tus chats de <span className="text-indigo-600">WhatsApp</span> con IA entrenada para tu negocio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Convierte más clientes y responde en segundos con un asistente que entiende tus productos, servicios y reglas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="mr-2 h-5 w-5" />
                Probar gratis 30 días
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="rounded-full px-6">
                Ver demo en vivo
              </Button>
            </Link>
          </div>
        </div>

        {/* Imagen o ilustración */}
        <div className="relative w-full h-80 md:h-[480px]">
          <Image
            src={mockup} // cambia por tu imagen real
            alt="Ilustración de chat automático"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  )
}
