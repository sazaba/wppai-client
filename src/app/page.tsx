import React from 'react';
import { Metadata } from 'next';
import HomePageContent from './components/HomePageContent';

// 🔥 CLAVE: Forzamos caché estática (ISR). 
// La página se genera una vez en el servidor y se sirve como HTML puro (rápido).
// Revalidamos cada hora por si cambias textos.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Wasaaa | Software de Gestión para Clínicas Estéticas',
  description: 'Automatiza citas, gestiona pacientes y reduce el ausentismo en tu centro estético con Inteligencia Artificial. Prueba gratis hoy.',
  openGraph: {
    title: 'Wasaaa | Software Médico con IA',
    description: 'La plataforma todo en uno para clínicas estéticas. Agenda, CRM y Marketing automático.',
    type: 'website',
  }
};

export default function HomePage() {
  return <HomePageContent />;
}