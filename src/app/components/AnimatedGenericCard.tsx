'use client'

import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Wifi } from 'lucide-react';

const drawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: any) => ({ 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      pathLength: { delay: i * 0.2, type: "spring", duration: 1.5, bounce: 0 }, 
      opacity: { delay: i * 0.2, duration: 0.01 } 
    }
  })
};

const AnimatedGenericCard = memo(() => {
  return (
    <div className="w-full max-w-[320px] md:max-w-[360px] mx-auto relative group perspective-1000">
      <motion.div 
        initial={{ rotateY: 0 }} 
        whileHover={{ rotateY: 5, scale: 1.02 }} 
        transition={{ duration: 0.5 }}
        className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] bg-gradient-to-br from-[#111] via-[#0a0a0a] to-black border border-amber-500/20"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="relative p-6 h-full flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <motion.svg width="45" height="32" viewBox="0 0 50 35" className="stroke-amber-400/80 fill-none stroke-[1.5]" initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.rect x="2" y="2" width="46" height="31" rx="6" variants={drawVariants} custom={1} />
              <motion.path d="M15 2 V 33" variants={drawVariants} custom={2} />
              <motion.path d="M35 2 V 33" variants={drawVariants} custom={2} />
              <motion.path d="M2 17 H 48" variants={drawVariants} custom={3} />
              <motion.path d="M15 10 H 35" variants={drawVariants} custom={4} className="stroke-[0.5]" />
              <motion.path d="M15 25 H 35" variants={drawVariants} custom={4} className="stroke-[0.5]" />
            </motion.svg>
            <Wifi className="text-amber-200/50" />
          </div>
          <div className="text-center pt-2">
             <p className="text-[10px] text-amber-200/50 uppercase tracking-[0.3em] mb-1">Universal Access</p>
             <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-white tracking-widest drop-shadow-sm">ALL CARDS</h4>
          </div>
          <div className="flex justify-between items-end opacity-90">
              <motion.svg height="8" width="110" viewBox="0 0 120 10" className="stroke-white/20 fill-none stroke-[2] stroke-linecap-round" initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.line x1="0" y1="5" x2="20" y2="5" variants={drawVariants} custom={5} />
                  <motion.line x1="30" y1="5" x2="50" y2="5" variants={drawVariants} custom={5.5} />
                  <motion.line x1="60" y1="5" x2="80" y2="5" variants={drawVariants} custom={6} />
                  <motion.line x1="90" y1="5" x2="110" y2="5" variants={drawVariants} custom={6.5} />
              </motion.svg>
              <div className="flex -space-x-2">
                 <div className="w-6 h-6 rounded-full border border-white/10 bg-white/10 backdrop-blur-sm" />
                 <div className="w-6 h-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

AnimatedGenericCard.displayName = "AnimatedGenericCard";
export default AnimatedGenericCard;