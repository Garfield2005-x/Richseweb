"use client";

import { motion } from "framer-motion";

interface LoadingRichseProps {
  message?: string;
  fullScreen?: boolean;
  inline?: boolean;
}

export default function LoadingRichse({ 
  message = "Aligning your ritual...", 
  fullScreen = false,
  inline = false
}: LoadingRichseProps) {
  if (inline) {
    return (
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[14px] font-luxury font-black uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-[#F07098] to-[#F8E1EB]"
        >
          Richse
        </motion.span>
        {message && (
          <span className="text-[10px] font-luxury font-bold text-white/40 uppercase tracking-widest">{message}</span>
        )}
      </div>
    );
  }

  const content = (
    <div className="flex flex-col items-center justify-center p-12 space-y-8">
      <div className="relative">
        <motion.h2
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.98, 1, 0.98],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-5xl md:text-7xl font-luxury font-black uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-[#F07098] to-[#010000]"
        >
          Richse
        </motion.h2>
        
        {/* Subtle glow behind the text */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-[#F07098]/10 blur-3xl rounded-full" />
      </div>

      <div className="space-y-3 text-center">
        <motion.p
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[10px] md:text-[12px] font-luxury font-bold text-[#F07098] uppercase tracking-[0.5em]"
        >
          {message}
        </motion.p>
        <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#010000] flex items-center justify-center">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#F07098]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#F394B8]/5 rounded-full blur-[100px] pointer-events-none" />
        {content}
      </div>
    );
  }

  return content;
}
