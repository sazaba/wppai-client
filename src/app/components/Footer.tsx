'use client'

import Link from 'next/link'
import Image from 'next/image'
import logo from '../images/Logo-Wasaaa.webp'
import { Instagram, Linkedin, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* Columna 1: Marca y Misión */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
                <div className="flex items-center gap-2">
                    <Image 
                        src={logo} 
                        alt="Wasaaa Logo" 
                        width={40} 
                        height={40} 
                        className="w-10 h-10 object-contain"
                    />
                    <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Wasaaa</span>
                </div>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
              Automatización inteligente para WhatsApp. Ayudamos a negocios a escalar sus ventas y mejorar la atención al cliente con IA entrenada a medida.
            </p>
            
            {/* Redes Sociales (Placeholders decorativos) */}
            <div className="flex items-center gap-4 pt-2">
                <SocialLink href="#" icon={Instagram} />
                <SocialLink href="#" icon={Twitter} />
                <SocialLink href="#" icon={Linkedin} />
                <SocialLink href="#" icon={Facebook} />
            </div>
          </div>

          {/* Columna 2: Producto (Enlaces rápidos) */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Producto</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Funcionalidades</Link></li>
                <li><Link href="#how" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cómo funciona</Link></li>
                <li><Link href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Precios</Link></li>
                <li><Link href="#faqs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div className="md:col-span-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/terminos" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/delete-my-data" className="hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2">
                  Eliminar mis datos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior: Copyright */}
        <div className="pt-8 border-t border-gray-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <p>© {currentYear} Wasaaa Inc. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Hecho con 💜 en Colombia</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

// Componente auxiliar para botones sociales
function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
    return (
        <a 
            href={href} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
            <Icon className="w-4 h-4" />
        </a>
    )
}