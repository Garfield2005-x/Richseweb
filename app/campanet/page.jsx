"use client";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// Fade upward animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function CustomerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      // Save to our DB
      const res = await fetch('/api/campanet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        throw new Error("Failed to save to database");
      }

      // Send to Google Sheets (silent)
      await fetch("https://script.google.com/a/macros/richseofficial.com/s/AKfycbz5J4aFQq2U8VqYGU8vuKPNDfSBXB8XZ6heKzo2kOcTen4GcyBRUJnVtSU1N9Lf1qaO/exec", {
        method: "POST",
        body: formData,
        mode: "no-cors"
      });

      alert("ลงทะเบียนสำเร็จ ✅");
      e.target.reset(); // clear form
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hasMounted) return null;
    
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#161314] flex items-center justify-center p-6 sm:p-12">
      
      {/* Immersive Dark Pearl Silk Background */}
      <div className="absolute inset-0 pointer-events-none z-0" 
           style={{ 
             background: `radial-gradient(circle at 10% 10%, #2c282a 0%, transparent 40%),
                          radial-gradient(circle at 90% 90%, #1c1a1b 0%, transparent 40%),
                          radial-gradient(circle at 50% 10%, #221f21 0%, transparent 50%)` 
           }} 
      />

      {/* Large "REGISTRY" Background Typography */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-1 overflow-hidden">
        <motion.h2 
          initial={{ opacity: 0, scale: 1.2 }}
          whileInView={{ opacity: 0.04, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="text-[25vw] font-display font-black tracking-[-0.05em] select-none text-white whitespace-nowrap uppercase"
        >
          REGISTRY
        </motion.h2>
      </div>

      <motion.div 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        variants={staggerContainer}
        className="w-full max-w-lg relative z-10"
      >
        {/* Elite Glassmorphism Container */}
        <div className="relative p-10 md:p-14 rounded-[40px] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden">
          
          {/* Corner Accents */}
          <div className="absolute top-8 left-8 text-[#c3a2ab] opacity-40 text-xl">✦</div>
          <div className="absolute top-8 right-8 text-[#c3a2ab] opacity-40 text-xl">✦</div>
          <div className="absolute bottom-8 left-8 text-[#c3a2ab] opacity-40 text-xl">✦</div>
          <div className="absolute bottom-8 right-8 text-[#c3a2ab] opacity-40 text-xl">✦</div>

          <div className="text-center space-y-4 relative z-20 mb-12">
            <motion.span variants={fadeInUp} className="text-[#c3a2ab] font-bold tracking-[0.5em] uppercase text-[11px] block">Security Verified</motion.span>
            <motion.h1 variants={fadeInUp} className="font-display text-4xl md:text-5xl font-bold tracking-tighter text-white">
              Elite <span className="text-[#c3a2ab] italic font-medium">Registry.</span>
            </motion.h1>
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 py-2">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c3a2ab]/40" />
              <span className="text-[#c3a2ab]/40 text-xs">✦</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c3a2ab]/40" />
            </motion.div>
            <motion.p variants={fadeInUp} className="text-gray-400 text-sm font-light leading-relaxed max-w-xs mx-auto">
              Please finalize your ritual details below for verified membership confirmation.
            </motion.p>
          </div>

          <form 
            onSubmit={handleSubmit}
            className="space-y-8 relative z-20"
          >
            {/* Full Name */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <label className="block text-[#c3a2ab] text-[10px] font-bold tracking-[0.3em] uppercase ml-1 opacity-80">
                Full Identity (ชื่อ-นามสกุล)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined notranslate text-[#c3a2ab]/40 group-focus-within:text-[#c3a2ab] transition-colors text-[20px]">
                    person
                  </span>
                </div>
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="Enter your full name"
                  className="w-full pl-14 pr-6 py-5 rounded-[20px] bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#c3a2ab]/50 focus:ring-1 focus:ring-[#c3a2ab]/20 transition-all outline-none"
                />
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <label className="block text-[#c3a2ab] text-[10px] font-bold tracking-[0.3em] uppercase ml-1 opacity-80">
                Contact Number (เบอร์โทรศัพท์)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined notranslate text-[#c3a2ab]/40 group-focus-within:text-[#c3a2ab] transition-colors text-[20px]">
                    call
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  name="phone"
                  placeholder="08X-XXX-XXXX"
                  className="w-full pl-14 pr-6 py-5 rounded-[20px] bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#c3a2ab]/50 focus:ring-1 focus:ring-[#c3a2ab]/20 transition-all outline-none"
                />
              </div>
            </motion.div>

            {/* Order Number */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <label className="block text-[#c3a2ab] text-[10px] font-bold tracking-[0.3em] uppercase ml-1 opacity-80">
                Ritual Reference (เลขที่คำสั่งซื้อ)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined notranslate text-[#c3a2ab]/40 group-focus-within:text-[#c3a2ab] transition-colors text-[20px]">
                    shopping_bag
                  </span>
                </div>
                <input
                  type="text"
                  required
                  name="order"
                  placeholder="#00000"
                  className="w-full pl-14 pr-6 py-5 rounded-[20px] bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#c3a2ab]/50 focus:ring-1 focus:ring-[#c3a2ab]/20 transition-all outline-none"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={fadeInUp} className="pt-8">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{ boxShadow: ["0 0 0 rgba(195,162,171,0)", "0 0 30px rgba(195,162,171,0.25)", "0 0 0 rgba(195,162,171,0)"] }}
                transition={{ boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                className="relative overflow-hidden w-full bg-gradient-to-r from-[#c3a2ab] via-[#d4b5bc] to-[#c3a2ab] text-white font-black py-5 rounded-[22px] shadow-2xl transition-all disabled:opacity-50 uppercase tracking-[0.3em] text-[13px] flex items-center justify-center gap-4 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                <span className="relative z-10">
                  {isSubmitting ? "Authenticating..." : "Finalize Registration"}
                </span>
                {!isSubmitting && (
                  <span className="material-symbols-outlined notranslate relative z-10 text-[18px] transition-transform duration-500 group-hover:translate-x-2">
                    arrow_forward
                  </span>
                )}
              </motion.button>
            </motion.div>

            {/* Bottom Footer Accent */}
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 opacity-30 pt-4">
              <div className="h-px w-8 bg-white/40"></div>
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-white">
                Richse Official Discrete Registry
              </span>
              <div className="h-px w-8 bg-white/40"></div>
            </motion.div>
          </form>
        </div>
      </motion.div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite ease-in-out;
        }
      `}</style>
    </main>
  )
}
