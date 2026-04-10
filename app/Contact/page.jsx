'use client'

import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

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
  { imgUrl: "https://cdn.simpleicons.org/line/white", title: "Line Official", desc: "Consultation & Support", href: "https://line.me/R/ti/p/@338mcudr?oat_content=url&ts=02170245", target: "_blank", rel: "noopener noreferrer" },
  { imgUrl: "https://cdn.simpleicons.org/shopee/white", title: "Shopee Store", desc: "Exclusive Deals", href: "https://th.shp.ee/awo2JNVD", target: "_blank", rel: "noopener noreferrer" },
  { imgUrl: "https://cdn.simpleicons.org/line/white", title: "Affiliate Community", desc: "Join our network", href: "https://line.me/ti/g2/dQQu0-rhnBQKiAdDn3L02Ro7id7RDruC02Q5NA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default", target: "_blank", rel: "noopener noreferrer" },
  { imgUrl: "https://cdn.simpleicons.org/instagram/white", title: "Instagram", desc: "Updates & Lifestyle", href: "https://www.instagram.com/richse_official/?utm_source=ig_embed&ig_rid=866aee39-6af1-4bd0-9f3d-6504b9238b17", target: "_blank", rel: "noopener noreferrer" },
  { imgUrl: "https://cdn.simpleicons.org/facebook/white", title: "Facebook", desc: "Official Brand Page", href: "https://www.facebook.com/chnay.chi.ta.ra.ni.nakh.ratn.siri.kul/", target: "_blank", rel: "noopener noreferrer" },
  { imgUrl: "https://cdn.simpleicons.org/tiktok/white", title: "TikTok", desc: "Behind the scenes", href: "https://www.tiktok.com/@richse.888?_r=1&_t=ZS-94v5EesyoiY", target: "_blank", rel: "noopener noreferrer" }
];

export default function ContactPage() {
  return (
    <div className="bg-[#010000] text-white overflow-hidden selection:bg-[#F07098] selection:text-white min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 relative pt-32 pb-40 md:pt-48 md:pb-56 flex flex-col items-center">
        {/* Luxury Dark Mode Gradients & Texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F07098]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F394B8]/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full h-full flex flex-col items-center">
          
          <motion.header 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="text-center mb-24 md:mb-32 max-w-2xl"
          >
            <motion.span variants={fadeInUp} className="text-[#F07098] font-bold tracking-[0.4em] uppercase text-[12px] md:text-[14px] mb-6 block">
              Digital Presence
            </motion.span>
            <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl lg:text-[90px] font-bold tracking-tighter text-white leading-[0.9] mb-8">
              The Social <span className="italic text-[#F07098] font-medium">Hub.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-white/60 font-light tracking-[0.05em] text-base md:text-lg max-w-xl mx-auto leading-relaxed px-4">
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
                target={link.target}
                rel={link.rel}
                variants={fadeInUp}
                className="group flex flex-col items-center text-center p-12 rounded-[30px] bg-white/5 backdrop-blur-3xl border border-white/10 hover:border-[#F07098]/40 hover:bg-white/10 transition-all duration-700 ease-[0.16,1,0.3,1] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_40px_80px_rgba(240,112,152,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F07098]/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* App Icon Glassmorphism Container */}
                <div className="size-20 md:size-24 rounded-[22px] md:rounded-[28px] border border-white/20 mb-8 flex items-center justify-center bg-white/5 shadow-lg group-hover:scale-110 group-hover:border-[#F07098] group-hover:bg-[#F07098] transition-all duration-700 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   {/* Brand Logo in Monochrome White Tone */}
                   <Image 
                     src={link.imgUrl} 
                     alt={link.title} 
                     unoptimized
                     width={48}
                     height={48}
                     className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-all duration-500 relative z-10" 
                   />
                </div>
                
                <h3 className="font-display font-bold text-2xl text-white mb-3 group-hover:text-[#F07098] transition-colors duration-500 tracking-tight">{link.title}</h3>
                <p className="text-white/40 font-bold text-[10px] uppercase tracking-[0.2em]">{link.desc}</p>
              </motion.a>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1.5 }}
            className="mt-32 md:mt-48 flex justify-center w-full"
          >
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-white/10" />
              <p className="font-display font-light text-white/30 tracking-[0.3em] uppercase text-[10px]">
                Richse Limited
              </p>
              <div className="h-[1px] w-12 bg-white/10" />
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
