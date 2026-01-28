// components/DownloadButton.tsx
'use client'

import React from 'react';
import { Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ProposalPDF from './ProposalPDF'; // Asegúrate que esta ruta apunte a tu componente PDF

interface Props {
    logoSrc: string;
}

export default function DownloadButton({ logoSrc }: Props) {
  return (
    <PDFDownloadLink
      document={<ProposalPDF logoSrc={logoSrc} />} 
      fileName="Propuesta_Comercial_DentalIA.pdf"
      className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors py-2 border-b border-transparent hover:border-amber-400/50 justify-center"
    >
      {({ loading }) => (
        <>
          <Download size={16} />
          {loading ? 'Generando documento...' : 'Descargar Propuesta Económica & Comercial (.pdf)'}
        </>
      )}
    </PDFDownloadLink>
  );
}