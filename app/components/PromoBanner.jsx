"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#161314] text-white py-2.5 px-4 relative z-[60] overflow-hidden">
      {/* Subtle animated gradient background for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c3a2ab]/20 to-transparent animate-shimmer pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <span className="bg-[#c3a2ab] text-[#161314] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">
            PROMO
          </span>
          <p className="text-[13px] md:text-sm font-medium tracking-[0.05em] uppercase">
            ลงทะเบียนตอนนี้ รับโค้ดส่วนลด <span className="text-[#c3a2ab] font-bold">10%</span> ทันที
          </p>
          <Link 
            href="/register" 
            className="text-[11px] md:text-xs font-bold border-b border-white hover:text-[#c3a2ab] hover:border-[#c3a2ab] transition-all pb-0.5 ml-2"
          >
            REGISTER NOW
          </Link>
        </motion.div>
      </div>

      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined notranslate text-sm">close</span>
      </button>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
      `}</style>
    </div>
  );
}
