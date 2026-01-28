'use client'

import React, { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { pdf } from '@react-pdf/renderer'; // Importamos solo la función generadora
import ProposalPDF from './ProposalPDF';
import { saveAs } from 'file-saver'; // Necesitarás: npm install file-saver @types/file-saver

interface Props {
    logoSrc: string;
}

export default function DownloadButton({ logoSrc }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      // 1. Generamos el documento SOLO al hacer click
      const blob = await pdf(<ProposalPDF logoSrc={logoSrc} />).toBlob();
      
      // 2. Guardamos el archivo manualmente
      saveAs(blob, 'Propuesta_Comercial_DentalIA.pdf');
      
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error generando el documento. Por favor intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="group relative flex items-center justify-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 rounded-xl transition-all duration-300 w-full sm:w-auto mx-auto"
    >
      {isGenerating ? (
        <>
          <Loader2 size={18} className="animate-spin text-amber-500" />
          <span className="text-slate-300 font-medium">Generando documento...</span>
        </>
      ) : (
        <>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
            <Download size={18} />
          </div>
          <div className="text-left">
            <span className="block text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              Descargar Propuesta Económica
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              Formato PDF Oficial
            </span>
          </div>
        </>
      )}
    </button>
  );
}