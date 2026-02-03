'use client'

import Link from 'next/link'
import Image from 'next/image'
import logo from '../images/Logo-Wasaaa.webp'
import { Instagram, Linkedin, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    // CAMBIO: bg-[#050505] para coincidir con el body, borde sutil white/10
    <footer className="relative z-10 border-t border-white/10 bg-[#050505] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Columna 1: Marca y Misión */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block group">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-rose-500 blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Image 
                            src={logo} 
                            alt="Wasaaa Logo" 
                            width={40} 
                            height={40} 
                            className="w-10 h-10 object-contain relative z-10"
                        />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight group-hover:text-rose-400 transition-colors">Wasaaa</span>
                </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              IA conversacional especializada en clínicas estéticas. Convierte consultas en pacientes y llena tu agenda mientras duermes.
            </p>
            
            {/* Redes Sociales */}
            <div className="flex items-center gap-4 pt-2">
                <SocialLink href="#" icon={Instagram} />
                <SocialLink href="#" icon={Twitter} />
                <SocialLink href="#" icon={Linkedin} />
                <SocialLink href="#" icon={Facebook} />
            </div>
          </div>

          {/* Columna 2: Producto */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-white mb-6">Plataforma</h4>
            <ul className="space-y-4 text-sm text-slate-400">
                <li><Link href="#features" className="hover:text-rose-400 transition-colors">Funcionalidades</Link></li>
                <li><Link href="#how" className="hover:text-rose-400 transition-colors">Cómo funciona</Link></li>
                <li><Link href="#pricing" className="hover:text-rose-400 transition-colors">Membresía Gold</Link></li>
                <li><Link href="#faqs" className="hover:text-rose-400 transition-colors">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div className="md:col-span-4">
            <h4 className="font-semibold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link href="/terminos" className="hover:text-rose-400 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica" className="hover:text-rose-400 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/delete-my-data" className="hover:text-red-400 transition-colors flex items-center gap-2">
                  Eliminar mis datos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior: Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {currentYear} Wasaaa Inc. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Hecho con 💜 para el sector estético</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

// Componente auxiliar para botones sociales (Adaptado Dark Mode)
function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
    return (
        <a 
            href={href} 
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-rose-500 hover:text-white transition-all duration-300"
        >
            <Icon className="w-4 h-4" />
        </a>
    )
}