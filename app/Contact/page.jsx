'use client'

import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Fade upwards animations
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const CONTACT_LINKS = [
  { icon: "chat_bubble", title: "Line Official", desc: "For direct assistance", href: "#" },
  { icon: "camera", title: "Instagram", desc: "Discover our aesthetic", href: "https://www.instagram.com/richse_official?igsh=dmt5Yjc2ZGJudnZk" },
  { icon: "forum", title: "Messenger", desc: "Chat with our advisors", href: "#" },
  { icon: "call", title: "WhatsApp", desc: "Global concierge", href: "#" },
  { icon: "brand_awareness", title: "TikTok", desc: "Behind the scenes", href: "https://www.tiktok.com/@richse.888?_r=1&_t=ZS-94v5EesyoiY" },
  { icon: "play_circle", title: "YouTube", desc: "Skincare rituals", href: "#" },
  { icon: "grid_view", title: "Pinterest", desc: "Curated inspiration", href: "#" },
  { icon: "close", title: "X (Twitter)", desc: "Latest updates", href: "#" },
  { icon: "mail", title: "Email Support", desc: "In-depth inquiries", href: "#" }
];

export default function ContactPage() {
  return (
    <div className="bg-[#FAF9F7] text-[#161314] overflow-hidden selection:bg-[#c3a2ab]/30 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 relative pt-32 pb-40 md:pt-48 md:pb-56 flex flex-col items-center">
        {/* Subtle Background Noise & Gradients */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-gradient-to-b from-[#f3e5e8]/40 to-transparent rounded-full blur-[100px] pointer-events-none opacity-60 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-gradient-to-t from-[#e8d5c4]/30 to-transparent rounded-full blur-[100px] pointer-events-none opacity-50 mix-blend-multiply" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full h-full flex flex-col items-center">
          
          <motion.header 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="text-center mb-24 md:mb-32 max-w-2xl"
          >
            <motion.span variants={fadeInUp} className="text-[#c3a2ab] font-medium tracking-[0.4em] uppercase text-[10px] md:text-xs mb-8 block">
              Digital Presence
            </motion.span>
            <motion.h1 variants={fadeInUp} className="font-serif text-5xl md:text-7xl text-[#161314] leading-tight mb-8">
              The Social <span className="italic text-[#c3a2ab] font-light">Hub</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-500 font-light text-base md:text-lg leading-relaxed px-4">
              Connect with us across our digital sanctuaries. We are here to guide your skincare journey, wherever you find inspiration.
            </motion.p>
          </motion.header>

          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 w-full max-w-6xl"
          >
            {CONTACT_LINKS.map((link, i) => (
              <motion.a 
                key={i}
                href={link.href}
                variants={fadeInUp}
                className="group flex flex-col items-center text-center p-12 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 hover:border-[#c3a2ab]/40 hover:bg-white/80 transition-all duration-700 ease-[0.16,1,0.3,1] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(195,162,171,0.08)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#c3a2ab]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="size-16 rounded-full border border-gray-100 mb-8 flex items-center justify-center bg-white shadow-sm group-hover:scale-110 group-hover:border-[#c3a2ab]/20 transition-all duration-700">
                  <span className="material-symbols-outlined notranslate text-2xl text-[#161314] font-light group-hover:text-[#c3a2ab] transition-colors duration-500">
                    {link.icon}
                  </span>
                </div>
                
                <h3 className="font-serif text-2xl text-[#161314] mb-3 group-hover:text-[#c3a2ab] transition-colors duration-500">{link.title}</h3>
                <p className="text-gray-400 font-light text-xs uppercase tracking-[0.2em]">{link.desc}</p>
              </motion.a>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1.5 }}
            className="mt-32 md:mt-48 flex justify-center w-full"
          >
            <p className="font-serif italic text-[#c3a2ab]/40 text-lg md:text-xl">
              Experience Radiance.
            </p>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
