"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#010000] text-white py-3 px-4 relative z-[60] overflow-hidden border-b border-[#F07098]/30">
      {/* Subtle animated gradient background for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F07098]/10 to-transparent animate-shimmer pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <span className="bg-[#F07098] text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
            PROMO
          </span>
          <p className="text-[14px] md:text-[15px] font-medium tracking-wide uppercase">
            ลงทะเบียนตอนนี้ รับโค้ดส่วนลด <span className="text-[#F07098] font-bold">10%</span> ทันที
          </p>
          <Link 
            href="/register" 
            className="text-[11px] md:text-xs font-bold border-b border-[#F07098] text-[#F07098] hover:text-[#F394B8] hover:border-[#F394B8] transition-all pb-0.5 ml-2 uppercase tracking-widest"
          >
            REGISTER NOW
          </Link>
        </motion.div>
      </div>

      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#F07098] transition-colors"
      >
        <span className="material-symbols-outlined notranslate text-sm">close</span>
      </button>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 4s infinite linear;
        }
      `}</style>
    </div>
  );
}
