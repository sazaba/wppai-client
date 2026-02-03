import React from 'react'; // Eliminamos 'use client' del tope para poder exportar metadata
import { Sparkles, CheckCircle2, Clock, Users, Database, BrainCircuit, CalendarCheck, ChevronRight, FileText, CalendarDays, Zap, Wifi, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; 
import dynamic from 'next/dynamic';
import { Metadata } from 'next'; // Importamos tipos de metadata

// --- COMPONENTES DE CLIENTE (Motion) ---
// Como necesitamos exportar metadata (que es de servidor), 
// movemos la lógica de animación a un componente interno o usamos una estructura mixta.
// Para simplificar y mantener tu estructura, usaremos un "Client Component" wrapper para el contenido.
import HomePageContent from './components/HomePageContent'; // 👈 Crearemos este archivo abajo

// --- METADATA PARA SEO (Soluciona el reporte del PDF) ---
export const metadata: Metadata = {
  title: 'Wasaaa | Software de Gestión para Clínicas Estéticas',
  description: 'Automatiza citas, gestiona pacientes y reduce el ausentismo en tu centro estético con Inteligencia Artificial. Prueba gratis hoy.',
};

export default function HomePage() {
  return <HomePageContent />;
}