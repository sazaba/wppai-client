'use client'

import Link from 'next/link'
import Image from 'next/image'
import logo from '../images/Logo-Wasaaa.webp'
import { Instagram, Linkedin, Twitter, Facebook, Heart } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#050505] pt-20 pb-10 overflow-hidden">
      
      {/* Luz ambiental de fondo para dar profundidad */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* GRID PRINCIPAL: Ajustado para mejor alineación */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-8 mb-16">
          
          {/* Columna 1: Marca y Misión (Ocupa 5 columnas en PC) */}
          <div className="md:col-span-5 flex flex-col items-start space-y-6">
            <Link href="/" className="inline-block group">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {/* Glow Cyan detrás del logo */}
                        <div className="absolute inset-0 bg-cyan-500 blur-[25px] opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
                        <Image 
                            src={logo} 
                            alt="Wasaaa Logo" 
                            width={42} 
                            height={42} 
                            className="w-10 h-10 md:w-12 md:h-12 object-contain relative z-10 transition-transform group-hover:scale-105"
                        />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">Wasaaa</span>
                </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              El primer sistema de triaje y agendamiento automático para clínicas que valoran su tiempo. Deja que la IA llene tu agenda.
            </p>
            
            {/* Redes Sociales */}
            <div className="flex items-center gap-3 pt-2">
                <SocialLink href="#" icon={Instagram} />
                <SocialLink href="#" icon={Twitter} />
                <SocialLink href="#" icon={Linkedin} />
                <SocialLink href="#" icon={Facebook} />
            </div>
          </div>

          {/* Spacer para pantallas grandes (opcional) o ajuste de columnas restantes */}
          
          {/* Columna 2: Producto (Alineada, ocupa 3 col) */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-white mb-6 tracking-wide text-base">Plataforma</h4>
            <ul className="space-y-4 text-sm text-slate-400">
                <li><Link href="#features" className="hover:text-cyan-400 transition-colors duration-200 inline-block">Funcionalidades</Link></li>
                <li><Link href="#how" className="hover:text-cyan-400 transition-colors duration-200 inline-block">Cómo funciona</Link></li>
                <li><Link href="#pricing" className="hover:text-cyan-400 transition-colors duration-200 inline-block">Planes y Precios</Link></li>
                <li><Link href="#faqs" className="hover:text-cyan-400 transition-colors duration-200 inline-block">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal (Alineada, ocupa 4 col) */}
          <div className="md:col-span-4">
            <h4 className="font-bold text-white mb-6 tracking-wide text-base">Legal y Privacidad</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link href="/terminos" className="hover:text-cyan-400 transition-colors duration-200 inline-block">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica" className="hover:text-cyan-400 transition-colors duration-200 inline-block">
                  Política de Privacidad
                </Link>
              </li>
              <li className="pt-2">
                <Link href="/delete-my-data" className="text-slate-500 hover:text-red-400 transition-colors duration-200 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider w-fit group">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors" /> Eliminar mis datos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior: Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© {currentYear} Wasaaa Inc. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1.5 group cursor-default">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>para el sector estético</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

// Componente auxiliar para botones sociales (Adaptado al tema Blue/Cyan)
function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
    return (
        <a 
            href={href} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:bg-cyan-500 hover:border-cyan-400 hover:text-black transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
            <Icon className="w-5 h-5" />
        </a>
    )
}