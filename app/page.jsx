"use client";

import { useCart } from "@/context/CartContext"
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Link from 'next/link';
import CountdownTimer from "./components/CountdownTimer";
import NewsletterPopup from "./components/NewsletterPopup";

// Fade upwards animations
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [homeVideos, setHomeVideos] = useState(["", "", "", "", ""]);
  const { addToCart } = useCart()
  const scrollRef = useRef(null);
  const communityRef = useRef(null);
  const [hasMounted, setHasMounted] = useState(false);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  useEffect(() => {
    async function fetchHomeVideos() {
      try {
        const res = await fetch("/api/settings/home_videos");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.value)) {
            setHomeVideos(data.value);
          }
        }
      } catch (error) {
        console.error("Failed to load home videos", error);
      }
    }
    fetchHomeVideos();

    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
    setHasMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        alert("สมัครสำเร็จ! กรุณาตรวจสอบอีเมล 🎉");
        setEmail("");
      } else {
        alert("Email นี้เคยสมัครแล้ว 💌");
      }
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }

    setLoading(false);
  };

  if (!hasMounted) return null;

  return (
    <div>
      <Navbar />
      <NewsletterPopup />

      {/* --- PREMIUM BANNER HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden ">

        {/* Full-width High-Res Banner Background */}
        <div className="absolute inset-0 z-0 ">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
            style={{ backgroundImage: "url('/ban.jpg')" }}
          />
          {/* Editorial Gradient Overlay - Optimized for Right-side block */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#010000]/85 via-[#010000]/30 to-transparent " />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full h-full flex items-center justify-center lg:justify-start mt-20 lg:ml-250">
          <div className="flex flex-col justify-center items-center text-center space-y-12 w-full lg:max-w-2xl">

            {/* Editorial Text Content - Responsive Centering */}
            <motion.div
              className="flex flex-col space-y-6 md:space-y-8 items-center text-center w-full"
              initial="hidden" animate="visible" variants={staggerContainer}
            >
              <div className="space-y-0 flex flex-col items-center text-center w-full ">
                {/* Thai Heading Accent */}
                <motion.span
                  variants={fadeInUp}
                  className="inline-block text-[#010000] font-light uppercase text-[18px] md:text-[32px] lg:text-[45px]"
                >
                  ริซเซ่ มอยซ์ ซูอิ
                </motion.span>

                <div className="space-y-0 text-white -mt-2 md:-mt-5">
                  <motion.h1
                    variants={fadeInUp}
                    className="font-display text-4xl md:text-7xl lg:text-[95px] font-black leading-[0.9] tracking-tighter text-[#010000]"
                  >
                    RICHSE <span className="text-white">SUI</span>
                  </motion.h1>
                  <motion.h2
                    variants={fadeInUp}
                    className="font-display text-[#F394B8] text-4xl md:text-7xl lg:text-[95px] font-black tracking-tighter leading-[0.9] -mt-2 md:-mt-5"
                  >
                    MOISTURIZER
                  </motion.h2>
                </div>
              </div>

              {/* Functional Description - Balanced Block */}
              <motion.div variants={fadeInUp} className="space-y-3 md:space-y-4 max-w-xl">
                <p className="text-[16px] md:text-[20px] lg:text-[22px] text-white font-light leading-tight drop-shadow-md -mt-4 md:-mt-7">
                  &quot;ครีมบำรุงเกราะป้องกันผิว สำหรับผิวแพ้ง่ายโดยเฉพาะ&quot;
                </p>
                <p className="text-[10px] md:text-[14px] lg:text-[16px] text-white/70 font-normal tracking-[0.1em] leading-relaxed uppercase -mt-2 md:-mt-5">
                  &quot;SKIN BARRIER STRENGTHENER CREAM SPECIFICALLY FORMULATED FOR SENSITIVE SKIN&quot;
                </p>
              </motion.div>

              {/* CTA - Bottom of block */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 md:gap-5 pt-4 -mt-4 md:-mt-7">
                <Link
                  href="/ProductAll"
                  className="bg-[#010000] text-white px-6 md:px-10 py-2 rounded-xl font-light tracking-[0.1em] text-[16px] md:text-[20px] lg:text-[24px] shadow-2xl hover:bg-[#262626] transition-all duration-500 active:scale-95"
                >
                  SHOP NOW
                </Link>
                <Link
                  href="/skin-quiz"
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 md:px-8 py-2 rounded-xl font-light tracking-[0.1em] text-[16px] md:text-[20px] lg:text-[24px] hover:bg-white/20 transition-all duration-500"
                >
                  Skin Quiz
                </Link>
              </motion.div>

              {/* Social Proof - Subtle Left-Aligned Scale */}

            </motion.div>
          </div>
        </div>
      </section>

      {/* --- THE PHILOSOPHY of RICHSE (Premium Editorial Upgrade) --- */}
      <section className="relative py-32 overflow-hidden bg-[#F8E1EB]">

        {/* Silk Mesh Background Layer */}
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
                 radial-gradient(circle at 5% 5%, #F0709810 0%, transparent 35%),
                 radial-gradient(circle at 95% 95%, #F394B810 0%, transparent 35%),
                 radial-gradient(circle at 50% 50%, #F8E1EB 0%, transparent 60%)
               `
          }}
        />

        {/* Large Luxury Typography Layer (The Essence) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-1 overflow-hidden">
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.04, scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="text-[20vw] font-display font-black tracking-[-0.05em] select-none text-[#F07098]"
          >
            ESSENCE
          </motion.h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-24 space-y-4">
            <motion.span variants={fadeInUp} className="text-[#F07098] font-bold tracking-[0.4em] uppercase text-[12px]">Our Core Value</motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-5xl md:text-6xl font-bold tracking-tighter text-[#010000]">
              The Philosophy <span className="text-[#F07098] italic font-medium">of Richse.</span>
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 pt-4">
              <div className="h-[1px] w-12 bg-[#F07098]/30" />
              <div className="text-[#F07098] text-sm">✦</div>
              <div className="h-[1px] w-12 bg-[#F07098]/30" />
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { icon: "shield_with_heart", title: "Dermatologist Tested", desc: "Clinically formulated and rigorously tested by dermatology experts. Pure, gentle, and safe for all skin types, including sensitive skin." },
              { icon: "eco", title: "Clean & Ethical Beauty", desc: "Consciously crafted with 100% Vegan & Cruelty-Free ingredients. Ethical beauty that respects both your skin and the environment." },
              { icon: "auto_awesome", title: "Proven Clinical Results", desc: "Advanced proprietary formulas delivering visible, transformative results. Restores the skin barrier for lasting strength and radiant clarity." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.2 }}
                className="group relative p-10 rounded-[30px] bg-white/40 backdrop-blur-3xl border border-white/50 hover:bg-white/60 transition-all duration-500 shadow-[0_20px_50px_rgba(195,162,171,0.05)] hover:shadow-[0_40px_80px_rgba(195,162,171,0.12)] hover:-translate-y-2"
              >
                {/* Floating Aura Icon Container */}
                <div className="relative mb-8">
                  <div className="absolute -inset-4 bg-[#F07098]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    className="relative size-16 rounded-2xl bg-white border border-[#F07098]/20 flex items-center justify-center text-[#F07098] shadow-[0_10px_25px_rgba(240,112,152,0.08)] group-hover:bg-[#F07098] group-hover:text-white group-hover:scale-110 transition-all duration-300"
                  >
                    <span className="material-symbols-outlined notranslate text-3xl">{feature.icon}</span>
                  </motion.div>
                </div>
                <h3 className="font-display text-2xl font-bold mb-4 text-[#010000] tracking-tight">{feature.title}</h3>
                <p className="text-[17px] text-[#262626] leading-relaxed font-light">{feature.desc}</p>

                {/* Bottom Corner Accent */}
                <div className="absolute bottom-6 right-6 text-[#F07098]/10 text-xl group-hover:text-[#F07098]/30 transition-colors">✦</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- THE ICONS of RICHSE (Elite Gallery Upgrade) --- */}
      <section className="relative py-32 overflow-hidden bg-[#010000]">

        {/* Pearlescent Silk Mesh Layer */}
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at 80% 20%, #F0709810 0%, transparent 45%),
                            radial-gradient(circle at 20% 80%, #26262640 0%, transparent 45%)`
          }}
        />

        {/* Large "COLLECTION" Background Typography */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-1 overflow-hidden">
          <motion.h2
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 0.03, x: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="text-[22vw] font-display font-black tracking-[-0.05em] select-none text-white whitespace-nowrap uppercase"
          >
            COLLECTION
          </motion.h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-3">
              <motion.span variants={fadeInUp} className="text-[#F07098] font-bold tracking-[0.5em] uppercase text-[12px] block">Iconic Selection</motion.span>
              <motion.h2 variants={fadeInUp} className="font-display text-5xl md:text-6xl font-bold tracking-tighter text-white">
                The Icons <span className="text-[#F07098] italic font-medium">of Richse.</span>
              </motion.h2>
            </motion.div>

            {/* Diamond-Cut Navigation Buttons */}
            <div className="flex gap-4 p-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl">
              <button
                onClick={() => scroll('left')}
                className="size-14 rounded-full border border-white/10 bg-white/5 text-white flex items-center justify-center hover:bg-[#F07098] hover:border-[#F07098] hover:scale-110 transition-all duration-300 group"
              >
                <span className="material-symbols-outlined notranslate text-2xl transition-transform group-hover:-translate-x-1">chevron_left</span>
              </button>
              <button
                onClick={() => scroll('right')}
                className="size-14 rounded-full border border-white/10 bg-white/5 text-white flex items-center justify-center hover:bg-[#F07098] hover:border-[#F07098] hover:scale-110 transition-all duration-300 group"
              >
                <span className="material-symbols-outlined notranslate text-2xl transition-transform group-hover:translate-x-1">chevron_right</span>
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-10 overflow-x-auto no-scrollbar pb-16 snap-x snap-mandatory items-stretch scroll-smooth px-4"
          >
            {loadingProducts ? (
              <div className="py-20 px-6 text-[#F07098]/60 tracking-[0.3em] uppercase text-xs w-full text-center font-bold">Revealing Best Sellers...</div>
            ) : products.length > 0 ? (
              products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.15 }}
                  style={{ perspective: 1200 }}
                  className="w-[300px] md:w-[380px] shrink-0 group snap-start"
                >
                  <motion.div
                    whileHover={{ rotateY: 8, rotateX: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative aspect-[3/4] rounded-[40px] overflow-hidden bg-white mb-6 shadow-[0_20px_50px_rgba(240,112,152,0.08)] group-hover:shadow-[0_45px_100px_rgba(240,112,152,0.15)] transition-all border border-white/50"
                  >
                    {/* Inner Radiant Glow */}
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#F07098]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <Link href={`/product/${product.id}`} className="block h-full">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                        style={{ backgroundImage: `url('${product.image || "/G11.png"}')` }}
                      >
                        {/* Subtle Glare Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>

                    {/* Elite Glassmorphism Tag */}
                    <div className="absolute bottom-6 left-6 right-6 p-6 rounded-[28px] bg-white/40 backdrop-blur-3xl border border-white/50 translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <span className="text-[#F07098] text-[10px] font-bold uppercase tracking-[0.2em] block mb-1">Luxury Ritual</span>
                          <h3 className="font-display text-xl font-bold text-[#010000] tracking-tight truncate max-w-[160px]">{product.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[#F07098] font-display text-lg font-bold">฿{product.flashSalePrice || product.price}</p>
                        </div>
                      </div>
                    </div>

                    {/* Limited Edition Pulse Badge */}
                    {product.id === 3 && (
                      <div className="absolute top-6 left-6 flex items-center gap-2 bg-[#F07098] text-white px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#F07098]/30 animate-pulse">
                        <span className="size-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                        Limited
                      </div>
                    )}

                    {/* Quick Add Shimmer Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        const now = new Date();
                        const isFlashSale = product.flashSalePrice && product.flashSaleStart && product.flashSaleEnd && now >= new Date(product.flashSaleStart) && now <= new Date(product.flashSaleEnd);
                        addToCart({
                          ...product,
                          price: isFlashSale ? product.flashSalePrice : product.price,
                          qty: 1
                        });
                        window.dispatchEvent(new Event('cart-updated'));
                        toast.success("Added to ritual collection");
                      }}
                      className="absolute top-6 right-6 size-12 rounded-full bg-white text-[#F07098] flex items-center justify-center shadow-xl md:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#F07098] hover:text-white z-20"
                    >
                      <span className="material-symbols-outlined notranslate text-xl">shopping_bag</span>
                    </motion.button>
                  </motion.div>

                  {/* รายละเอียด */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <p className="font-display text-2xl font-bold leading-tight line-clamp-1 text-white">{product.name}</p>
                      <p className="text-[17px] text-white/60 line-clamp-2 h-12 overflow-hidden">{product.description}</p>
                    </div>

                    <div className="pt-2">
                      {hasMounted && product.flashSalePrice && product.flashSaleStart && product.flashSaleEnd && new Date() >= new Date(product.flashSaleStart) && new Date() <= new Date(product.flashSaleEnd) ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600 text-[21px]">
                              ฿{product.flashSalePrice.toLocaleString()}
                            </span>
                            <span className="text-gray-400 line-through text-[15px] font-medium">
                              ฿{product.price.toLocaleString()}
                            </span>
                          </div>
                          <CountdownTimer targetDate={product.flashSaleEnd} />
                        </div>
                      ) : (
                        <p className="font-bold text-[#F07098] text-[21px]">
                          ฿{product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-10 px-6 text-white/50 w-full text-center">No products available.</div>
            )}
          </div>
        </div>
      </section>

      {/* --- AS SEEN ON TIKTOK (Luxury Gallery) --- */}
      <section className="relative py-28 bg-[#F8E1EB] overflow-hidden">

        {/* Ambient Glow behind section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#F07098]/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center space-y-5">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#F07098]/30 bg-white/50 backdrop-blur-sm shadow-sm">
              <span className="text-[#F07098] font-bold tracking-[0.2em] uppercase text-[10px]">Community Magic</span>
            </div>
            <motion.h2 variants={fadeInUp} className="font-display text-5xl md:text-6xl font-bold tracking-tight text-[#010000]">
              Real Glow, <span className="text-[#F07098] italic font-medium">Real Results.</span>
            </motion.h2>
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#F07098]/60" />
              <span className="text-[#F07098]/50 text-xs">✦</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#F07098]/60" />
            </motion.div>
          </motion.div>
        </div>

        {/* Marquee Container with Perspective */}
        <div className="relative flex overflow-x-hidden w-full group/gallery py-12 perspective-[2000px]">
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100%); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0); }
              50% { transform: translateY(-10px) rotate(2deg); }
            }
            .animate-marquee {
              display: flex;
              flex-shrink: 0;
              width: max-content;
              animation: marquee 45s linear infinite;
            }
            .group\/gallery:hover .animate-marquee {
              animation-play-state: paused;
            }
            .video-card-perspective {
              transform: rotateY(-15deg) skewY(2deg);
              transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            }
            .video-card-perspective:hover {
              transform: rotateY(0) skewY(0) scale(1.08);
              z-index: 50;
            }
          `}</style>

          {[...Array(4)].map((_, containerIndex) => (
            <div key={containerIndex} className="animate-marquee flex gap-10 pr-10" aria-hidden={containerIndex !== 0}>
              {[1, 2, 3, 4, 5].map((item, idx) => (
                <div
                  key={`${containerIndex}-${idx}`}
                  className="video-card-perspective w-[280px] h-[500px] md:w-[300px] md:h-[540px] bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] shrink-0 cursor-pointer relative group/video border border-white/50 backdrop-blur-xl group-hover/gallery:opacity-40 hover:!opacity-100 transition-opacity duration-500"
                  onClick={(e) => {
                    const vid = e.currentTarget.querySelector('video');
                    const overlay = e.currentTarget.querySelector('.play-overlay');
                    if (vid) {
                      if (vid.paused) {
                        vid.muted = false;
                        vid.play().catch(() => { });
                        if (overlay) overlay.style.opacity = '0';
                      } else {
                        vid.pause();
                        if (overlay) overlay.style.opacity = '1';
                      }
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth > 768) {
                      const vid = e.currentTarget.querySelector('video');
                      const overlay = e.currentTarget.querySelector('.play-overlay');
                      if (vid) {
                        vid.muted = false;
                        vid.play().catch(() => {
                          vid.muted = true; vid.play();
                        });
                      }
                      if (overlay) overlay.style.opacity = '0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth > 768) {
                      const vid = e.currentTarget.querySelector('video');
                      const overlay = e.currentTarget.querySelector('.play-overlay');
                      if (vid) vid.pause();
                      if (overlay) overlay.style.opacity = '1';
                    }
                  }}
                >
                  <video
                    className="w-full h-full object-cover scale-[1.05] group-hover/video:scale-100 transition-transform duration-1000 ease-out"
                    src={homeVideos[idx] || `/videos/tiktok-${item}.mp4`}
                    loop
                    playsInline
                    autoPlay
                    muted
                  />

                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010000]/80 via-transparent to-transparent opacity-60 group-hover/video:opacity-40 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Floating Beauty Tags (Random positions) */}
                  <div
                    className="absolute top-12 right-6 z-20 px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-bold text-white uppercase tracking-widest shadow-xl pointer-events-none"
                    style={{ animation: `float ${3 + idx}s ease-in-out infinite` }}
                  >
                    {["Glow ✨", "Results", "Clinically", "100% Real", "Top Rated"][idx]}
                  </div>

                  {/* Play Interface - High End Style */}
                  <div className="play-overlay absolute inset-0 flex flex-col justify-center items-center transition-opacity duration-500 pointer-events-none">
                    <div className="size-16 bg-white/10 backdrop-blur-lg border border-white/40 rounded-full flex items-center justify-center shadow-2xl group-hover/video:scale-110 transition-transform duration-700">
                      <div className="size-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-3xl ml-1 opacity-95">play_arrow</span>
                      </div>
                    </div>
                  </div>

                  {/* User Handle - Glassmorphism Pill */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[80%]">
                    <a
                      href="https://www.tiktok.com/@richse.888?_r=1&_t=ZS-94v5EesyoiY"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block w-full py-3 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-center hover:bg-white hover:text-[#010000] transition-all duration-500 shadow-xl group/handle"
                    >
                      <p className="text-white group-hover/handle:text-[#010000] font-medium text-[12px] tracking-[0.2em] uppercase">
                        @richse.888
                      </p>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* --- COMMUNITY VOICES (Interactive Floating Social Cloud Update to Black) --- */}
      <section ref={communityRef} className="relative py-40 overflow-hidden text-white min-h-[900px] flex items-center w-full bg-[#010000]">

        {/* Premium Background Layer (Deep Mesh Gradient for Black Theme) */}
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
                 radial-gradient(circle at 10% 10%, #F0709815 0%, transparent 40%),
                 radial-gradient(circle at 90% 10%, #F394B815 0%, transparent 40%),
                 radial-gradient(circle at 50% 50%, #010000 0%, transparent 70%),
                 radial-gradient(circle at 80% 80%, #F0709810 0%, transparent 40%),
                 radial-gradient(circle at 20% 80%, #F394B810 0%, transparent 40%)
               `
          }}
        />

        {/* Subtle Diamond Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply z-1"
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/white-diamond-dark.png')` }}
        />

        {/* Animated Light Orbs for Depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-2">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[#F07098]/8 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, -100, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-[#F394B8]/12 blur-[100px] rounded-full"
          />
        </div>

        {/* The Cloud Layer - Now Interactive & Draggable (The Ultimate Spread Fix) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden block z-10">
          {[
            // --- PILLS (Short Praise Spread) ---
            { t: "ใช้ดีมาก!", x: "12%", y: "15%", d: 0, s: 15, type: "pill" },
            { t: "Glow ✨", x: "85%", y: "10%", d: 1.5, s: 18, type: "pill" },
            { t: "10/10", x: "25%", y: "82%", d: 2.2, s: 16, type: "pill" },
            { t: "ต้องมี!", x: "90%", y: "78%", d: 0.8, s: 14, type: "pill" },
            { t: "Glass Skin", x: "32%", y: "7%", d: 5.5, s: 20, type: "pill" },
            { t: "Worth it", x: "65%", y: "92%", d: 3.2, s: 12, type: "pill" },
            { t: "ผิวฉ่ำวาว", x: "18%", y: "55%", d: 0.5, s: 17, type: "pill" },
            { t: "ที่สุด!", x: "78%", y: "25%", d: 4.5, s: 22, type: "pill" },
            { t: "Luxury ✨", x: "88%", y: "52%", d: 2, s: 14, type: "pill" },
            { t: "เลิฟเลย", x: "15%", y: "94%", d: 3, s: 18, type: "pill" },
            { t: "ซ้ำแน่นอน", x: "82%", y: "28%", d: 1.5, s: 16, type: "pill" },
            { t: "Radiance", x: "48%", y: "18%", d: 5, s: 19, type: "pill" },
            { t: "ผิวแข็งแรง", x: "55%", y: "12%", d: 2.2, s: 13, type: "pill" },
            { t: "Love it", x: "94%", y: "85%", d: 0.5, s: 16, type: "pill" },
            { t: "Best ✨", x: "5%", y: "30%", d: 1.8, s: 15, type: "pill" },
            { t: "ฉ่ำมาก!", x: "72%", y: "5%", d: 2.5, s: 17, type: "pill" },

            // --- MINI PROFILES ---
            { n: "Kanokwan.", i: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0c3DaMxV1mAx2B_8VNuOcVQ89pawk0Z4fBYI1rOC00uDVCHfcEXZG1V-29Lwavf5RGIeEtiFs-YNDJXPxftzTMhBRmyqSrBogpiLDm1gkOGzpK2yDJKtfnt12WjMqeLUAPT4UJlh3HSJXnKXa4B_6lwrSBaLBaVIFxB2xw-4UHXcUdZ4frNI2X-geIKaYo7eetxumNtnLpPMknOWFK8eErg_BSUAOmyc2rHh4ifGOJPrQ_ZGVQPA7yoJv1n_w9SOTohpCcOW2mRM", x: "20%", y: "32%", d: 2, s: 25, type: "profile" },
            { n: "Teerapat W.", i: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFadPtDcIKL6h9YR-z6iN2Y0Q2-NKdEg6D9JRA0uYotIU6tglfx2MzmFOSUAAwV1A4dmj17g1WS4jf6z93h8sFp8ny-fGMzrG5SHOZNwmwDdxK_Qhg3yVH3_6RJTKFTdJP7MfDc8J4GQltptoVUuFhOLLUyYzWr6Un6GBgJcqFLFtppIz0-z_8Dcdk26F_NMzkBDTPC9_giJraKCnfVohUfpLDyrYCAmHWbKdbpMO7XriaB471Bv6VOhUUP2C3BjaoF7MCZJb3f_E", x: "75%", y: "42%", d: 4, s: 30, type: "profile" },
            { n: "Sopee J.", i: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyqQzej49jQsMHMfWBUzE3zrxHX6wOli8fQCT7Z1G-hZct04vc2qXRHX84sl_OVfjNj8ARr4ifUFWND9RH-oaFcgLlOXdn_g1i5a9M8Nnc--xOelDgAqQb9wHVqgOEFaWzGOIV8TK7SsQhZyFRiZ9Pu_1L1uPZWBMoNlPT2V8J4D2Uo5L_lfueV_fWDy4zwh_h_K1jDlrsVQwOnKz6T7dmGG69pBR7Q5oZSIdLgqioHSVI_M4g7heHOa4EeqNz_fY0tP1dOJxpohw", x: "32%", y: "68%", d: 0.5, s: 28, type: "profile" },
            { n: "Nutcha.", i: "https://lh3.googleusercontent.com/a/ACg8ocL_pXy8rQ=s96-c", x: "82%", y: "65%", d: 3.5, s: 26, type: "profile" },

            // --- QUOTES ---
            { q: "ผิวเรียบเนียนขึ้นใน 2 สัปดาห์! รักเลย ✨", x: "50%", y: "45%", d: 3, s: 22, type: "quote" },
            { q: "ใช้แล้วไม่แพ้ ผิวนุ่มมาก Amazing Results.", x: "12%", y: "58%", d: 1.5, s: 24, type: "quote" },
            { q: "ที่สุดของสกินแคร์หรู 💎 Richse Magic is real.", x: "70%", y: "62%", d: 6, s: 26, type: "quote" },
            { q: "Visible results without irritation. ผิวดีขึ้นจริงๆ", x: "35%", y: "8%", d: 2.2, s: 19, type: "quote" },
            { q: "ใครยังไม่มี ต้องลองนะ! Perfect for skin barrier.", x: "65%", y: "82%", d: 4.8, s: 23, type: "quote" },
            { q: "The transformation is undeniable. Highly recommend!", x: "28%", y: "85%", d: 1.2, s: 21, type: "quote" }
          ].map((item, i) => (
            <motion.div
              key={i}
              drag
              dragConstraints={communityRef}
              dragElastic={0.5}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              whileHover={{ scale: 1.1, zIndex: 60, boxShadow: '0 0 30px rgba(240, 112, 152, 0.3)' }}
              whileDrag={{ scale: 1.25, zIndex: 100, cursor: 'grabbing', boxShadow: '0 30px 60px rgba(240, 112, 152, 0.4)' }}
              animate={{
                x: [0, 20, -20, 0],
                y: [0, -25, 25, 0],
                rotate: [0, 1.5, -1.5, 0]
              }}
              transition={{
                duration: item.s,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.d
              }}
              className={`absolute cursor-grab select-none backdrop-blur-3xl transition-all duration-300 transform scale-[0.6] sm:scale-100
                ${item.type === 'pill' ? 'bg-[#F07098]/15 border border-[#F07098]/40 rounded-full px-5 py-2.5 sm:px-8 sm:py-3.5 text-[11px] sm:text-[14px] font-bold text-[#F07098] tracking-[0.1em] uppercase shadow-[0_10px_20px_rgba(240,112,152,0.1)]' :
                  item.type === 'profile' ? 'bg-white/10 border border-white/20 rounded-[35px] px-4 py-3 sm:px-6 sm:py-4.5 flex items-center gap-3 sm:gap-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)]' :
                    'bg-white/5 border border-white/10 rounded-[30px] px-6 py-5 sm:px-10 sm:py-8 max-w-[200px] sm:max-w-[320px] shadow-[0_20px_40px_rgba(0,0,0,0.3)]'}`}
              style={{
                left: item.x,
                top: item.y
              }}
            >
              {item.type === 'pill' && <span className="flex items-center gap-2">{item.t}</span>}
              {item.type === 'profile' && (
                <>
                  <div className="size-8 sm:size-11 rounded-full bg-cover bg-center shrink-0 border border-[#F07098]/20" style={{ backgroundImage: `url('${item.i}')` }} />
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-[13px] font-bold tracking-tight text-white">{item.n}</span>
                    <div className="flex gap-0.5 text-[#F07098] text-[8px] sm:text-[10px]">
                      {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined fill-1" style={{ fontSize: '10px' }}>star</span>)}
                    </div>
                  </div>
                </>
              )}
              {item.type === 'quote' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] sm:text-[16px] italic leading-relaxed text-white/80 font-light">{item.q}</span>
                  <div className="h-[1px] sm:h-[1.5px] w-8 sm:w-12 bg-[#F07098]/40 mt-2 sm:mt-3" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pointer-events-none">
          <div className="border border-white/10 rounded-[40px] p-12 md:p-24 relative overflow-hidden bg-white/5 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            {/* Corner Accents */}
            <div className="absolute top-8 left-8 text-[#F07098] opacity-40 text-xl">✦</div>
            <div className="absolute top-8 right-8 text-[#F07098] opacity-40 text-xl">✦</div>
            <div className="absolute bottom-8 left-8 text-[#F07098] opacity-40 text-xl">✦</div>
            <div className="absolute bottom-8 right-8 text-[#F07098] opacity-40 text-xl">✦</div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center space-y-6 relative z-20">
              <motion.span variants={fadeInUp} className="text-[#F07098] font-bold tracking-[0.4em] uppercase text-[12px]">Community Magic</motion.span>
              <motion.h2 variants={fadeInUp} className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white">
                Loved by <span className="text-[#F07098] italic font-medium">Thousands.</span>
              </motion.h2>
              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-6 pt-2">
                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#F07098]/40 to-[#F07098]" />
                <span className="text-[#F07098] text-xl">✦</span>
                <div className="h-[1px] w-32 bg-gradient-to-l from-transparent via-[#F07098]/40 to-[#F07098]" />
              </motion.div>
              <motion.p variants={fadeInUp} className="text-white/60 font-medium tracking-[0.2em] uppercase text-xs pt-8">
                Discover why Richse is the choice for radiant skin
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- RICHSE EXCLUSIVE CLUB (Updating to Pink Theme) --- */}
      <section className="relative py-32 overflow-hidden bg-[#F394B8]">

        {/* Vibrant Pink Silk Mesh Background */}
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at 10% 10%, #F8E1EB 0%, transparent 40%),
                            radial-gradient(circle at 90% 90%, #F07098 0%, transparent 40%)`
          }}
        />

        {/* Large "EXCLUSIVE" Background Typography */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-1 overflow-hidden">
          <motion.h2
            initial={{ opacity: 0, scale: 1.2 }}
            whileInView={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="text-[25vw] font-display font-black tracking-[-0.05em] select-none text-white whitespace-nowrap"
          >
            EXCLUSIVE
          </motion.h2>
        </div>

        {/* Floating Diamond Dust Particles */}
        <div className="absolute inset-0 pointer-events-none z-2">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-0.5 bg-white/20 rounded-full"
              initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0 }}
              animate={{
                y: [null, (Math.random() - 0.5) * 200 + "%"],
                opacity: [0, 0.4, 0]
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10
              }}
            />
          ))}
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.span variants={fadeInUp} className="text-[#010000] font-bold tracking-[0.5em] uppercase text-[12px] mb-4 block">Private Membership</motion.span>
          <motion.h2 variants={fadeInUp} className="font-display text-5xl md:text-6xl font-bold mb-6 text-white tracking-tighter">
            Richse <span className="text-[#010000] italic font-medium">Exclusive Club.</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-white/80 mb-12 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Join our elite inner circle for early access to new rituals, exclusive events, and expert skincare advice tailored for the few.
          </motion.p>

          <motion.form
            variants={fadeInUp}
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto p-2 rounded-[24px] bg-white/40 backdrop-blur-3xl border border-white/50 shadow-2xl"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded-[18px] bg-transparent border-none focus:ring-1 focus:ring-[#010000]/50 px-8 py-5 text-[#010000] placeholder:text-[#010000]/40 transition-all font-medium"
            />
            <motion.button
              type="submit"
              disabled={loading}
              className="bg-[#010000] text-white px-10 py-5 rounded-[18px] font-bold tracking-widest text-sm hover:bg-[#262626] transition-all disabled:opacity-50"
            >
              {loading ? "Joining..." : "JOIN THE CLUB"}
            </motion.button>
          </motion.form>

          {message && <p className="text-sm mt-6 w-full text-center text-[#F07098] font-medium tracking-wide">{message}</p>}

          <motion.p variants={fadeInUp} className="text-[10px] text-[#010000]/50 mt-10 uppercase tracking-[0.3em] font-medium opacity-60">
            Privacy Respected. Membership is Discrete.
          </motion.p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
