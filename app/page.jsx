"use client";

import { useCart } from "@/context/CartContext"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Link from 'next/link';
import CountdownTimer from "./components/CountdownTimer";

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
  const { addToCart } = useCart()

  useEffect(() => {
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

  return (
    <div>
      <title>Richse | Luxury Skincare - Radiance Refined</title>
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="hero-mesh dark:bg-background-dark py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Context Side */}
            <motion.div 
              className="order-2 lg:order-1 space-y-8"
              initial="hidden" animate="visible" variants={staggerContainer}
            >
              <div className="space-y-4">
                <motion.span variants={fadeInUp} className="text-[#c3a2ab] font-bold tracking-widest uppercase text-xs">
                  New Collection: L éclat
                </motion.span>
                <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl font-bold leading-[1.1] text-[#161314] dark:text-white">
                  Radiance <br/>
                  <span className="text-[#C9A961] font-display italic font-medium">Refined.</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                  Thoughtfully crafted skincare that blends refined formulation with a modern approach to skin wellness, designed to support a naturally radiant and healthy-looking complexion.
                </motion.p>
              </div> 
              
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link className="bg-[#c3a2ab] text-white px-10 py-4 rounded-xl font-bold tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20" href="/ProductAll">
                  The Collection
                </Link>
                <Link href="/skin-quiz" className="border border-[#dfd8da] dark:border-white/10 px-10 py-4 rounded-xl font-bold tracking-wide hover:bg-white dark:hover:bg-white/5 transition-all">
                  Take Skin Quiz
                </Link>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="pt-8 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <div className="size-10 rounded-full border-2 border-white bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOkU_KsqoSbhbtjJ5OK9CLJa6qSuYp3FafH-5nN4-H_9gRQAwdEge5ePpZlee9flZzUHCC5Eqg5W-PocN0GRdG-6eYGM0CtwOHiaZtCPmghKObx7bLetYpi-upa72L4tRUipvZVaBED4KGN31iBxkekVRd14csqj41oXrqCnFYDhL0Q1aEInkrj_s4Q9i-wjyGpzBmUDJpMb1gEkQ7PqFeht3_H4uYGOKXz39j_WZJpCKIIJS7Alfg1cSmsWuFW1sfy5NvAGJoqCU')" }} />
                  <div className="size-10 rounded-full border-2 border-white bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDszfLbZT1XnVheqbKqCnnJvupr51auXLy8rZ_dvzHG157egPBmPKxb7WT-_cHGSqLMExoNRLiFIRww8HhXiX_MZq2hpr22pscgo1fzgY0bLrcacqJJCdctMfyb7Z_fWfKnyWY9iVQxSht9YnIFWje2A27e5NfRoqVnj6bJu7yFJxnzFJXV_Ly6A00t9rbXf5YQ9yGBU20jriE_6U0hOl3JGZit5vAmK9WuHAtvMX74FZT_ZiqkT_F3XzPfykhevxTCIZAQEzzU2LA')" }} />
                  <div className="size-10 rounded-full border-2 border-white bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAzAfdMu-3RKvQBQQmbeIFjWUf1wlZXlQhh7P9e4sICbkGiXGKs3s4X_QULfM-xcRQ0PEJ1s8Kytvagkp8RZ9GD7Oj7l1paVsQodOYMyWZTgHLI4r1hQy1w8fbaIYPFXImsAlLUwLPD8qje6En3dZBaZ2_gvJ1oL2YMsNtPn3dkHNRXhaA8AM3lprxZppX0n4fJU4HnljWJVgFF8ozB8oh9aWOng5h-GiZdunpLCqPhFligY32ziY7jDoJ8ftgm-53q8Qj5WObdXnk')" }} />
                </div>
                <p className="text-sm font-medium text-gray-500 italic">The most luminous my skin has ever looked. &mdash; Harper&apos;s Bazaar</p>
              </motion.div>
            </motion.div>

            {/* Image Side */}
            <div className="order-1 lg:order-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                  style={{ backgroundImage: "url('https://i.postimg.cc/PqnMmmvZ/IMG-8008.png')" }}
                ></div>
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 hidden md:block">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">Featured Product</p>
                      <p className="text-white/80 text-sm">Richse Night Cream</p>
                    </div>  
                    <div className="text-white font-display text-xl">฿290</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>

      {/* --- WHY RICHSE --- */}
      <section className="py-20 bg-white dark:bg-background-dark/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16 space-y-4">
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold">Why Richse</motion.h2>
            <motion.div variants={fadeInUp} className="w-16 h-0.5 bg-[#c3a2ab] mx-auto"></motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: "shield_with_heart", title: "Dermatologist Tested", desc: "Developed with professional skincare insight and thoughtfully tested to ensure it is gentle and suitable for everyday use, including sensitive skin." },
              { icon: "eco", title: "Ethical Beauty", desc: "Created with a mindful approach to beauty, focusing on thoughtful formulation and carefully chosen packaging that reflects a commitment to responsible and refined skincare." },
              { icon: "auto_awesome", title: "Clinical Results", desc: "Developed with insights from modern skincare research, focusing on formulas designed to support hydration, comfort, and a smoother-looking complexion with consistent use." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.15 }}
                className="p-8 rounded-2xl border border-[#dfd8da] dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="size-12 rounded-xl bg-[#c3a2ab]/10 flex items-center justify-center text-[#c3a2ab] mb-6 group-hover:bg-[#c3a2ab] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CURATED SELECTION (BEST SELLERS) --- */}
      <section className="py-20 hero-mesh overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-end mb-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.span variants={fadeInUp} className="text-[#c3a2ab] font-bold tracking-widest uppercase text-xs">Curated Selection</motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold mt-2">Best Sellers</motion.h2>
          </motion.div>
          <div className="flex gap-2">
            <button className="size-10 rounded-full border border-[#dfd8da] dark:border-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="size-10 rounded-full border border-[#dfd8da] dark:border-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        
        <div className="flex gap-6 px-6 md:px-20 overflow-x-auto no-scrollbar pb-10">
          <div className="overflow-x-auto">
            <div className="flex gap-6 w-max px-6">
              {loadingProducts ? (
                <div className="py-10 px-6 text-gray-500 tracking-widest uppercase text-sm">Loading Best Sellers...</div>
              ) : products.length > 0 ? (
                products.map((product, i) => (
                  <motion.div 
                    key={product.id} 
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.1 }}
                    className="min-w-[280px] group"
                  >
                    {/* รูปสินค้า */}
                    <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                      <Link href={`/product/${product.id}`}>
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url('${product.image || "/G11.png"}')` }}
                        />
                      </Link>

                      {/* ป้าย Limited */}
                      {product.id === 3 && (
                        <div className="absolute top-4 left-4 bg-[#c3a2ab] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Limited Edition
                        </div>
                      )}

                      {/* Quick Add */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const now = new Date();
                          const isFlashSale = product.flashSalePrice && product.flashSaleStart && product.flashSaleEnd && now >= new Date(product.flashSaleStart) && now <= new Date(product.flashSaleEnd);
                          addToCart({ 
                            ...product, 
                            price: isFlashSale ? product.flashSalePrice : product.price,
                            originalPrice: product.price,
                            taxe: product.description 
                          })
                        }}
                        className="absolute bottom-4 left-4 right-4 bg-white text-[#161314] py-3 rounded-xl font-bold text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl text-center"
                      >
                        Quick Add
                      </button>
                    </div>

                    {/* รายละเอียด */}
                    <div className="space-y-1">
                      <p className="font-display text-lg font-bold">{product.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1 truncate block">{product.description}</p>
                      <div className="mt-2">
                        {product.flashSalePrice && product.flashSaleStart && product.flashSaleEnd && new Date() >= new Date(product.flashSaleStart) && new Date() <= new Date(product.flashSaleEnd) ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-red-600 text-[16px]">
                                ฿{product.flashSalePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-gray-400 line-through text-xs font-medium">
                                ฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <CountdownTimer targetDate={product.flashSaleEnd} />
                          </div>
                        ) : (
                          <p className="font-bold text-[#c3a2ab] text-[16px]">
                            ฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-10 px-6 text-gray-500">No products available.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- AS SEEN ON TIKTOK --- */}
      <section className="py-24 bg-[#fdf2f4] dark:bg-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center space-y-4">
            <motion.span variants={fadeInUp} className="text-[#c3a2ab] font-bold tracking-widest uppercase text-xs">
              As Seen On
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-4xl md:text-5xl font-bold">
              TikTok Creators
            </motion.h2>
            <motion.div variants={fadeInUp} className="w-16 h-0.5 bg-[#c3a2ab] mx-auto"></motion.div>
          </motion.div>
        </div>

        {/* Marquee Container */}
        <div className="relative flex overflow-x-hidden w-full group py-4">
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              display: flex;
              flex-shrink: 0;
              width: max-content;
              animation: marquee 35s linear infinite;
            }
            .group:hover .animate-marquee {
              animation-play-state: paused;
            }
          `}</style>
          
          {/* We use multiple identical blocks animating at -100% of their own width. 4 blocks ensures no gaps even on Ultrawide screens */}
          {[...Array(4)].map((_, containerIndex) => (
            <div key={containerIndex} className="animate-marquee flex gap-6 pr-6" aria-hidden={containerIndex === 1}>
              {[1, 2, 3, 4, 5].map((item, idx) => (
                <div 
                  key={`${containerIndex}-${idx}`}
                  className="w-[260px] h-[460px] md:w-[280px] md:h-[520px] bg-[#f8f6f4] rounded-[2rem] overflow-hidden outline outline-1 outline-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] shrink-0 cursor-pointer relative group/video hover:shadow-[0_20px_40px_rgba(195,162,171,0.2)] transition-all duration-700 hover:-translate-y-2"
                  onClick={(e) => {
                    const vid = e.currentTarget.querySelector('video');
                    const overlay = e.currentTarget.querySelector('.play-overlay');
                    if (vid) {
                      if (vid.paused) {
                        vid.muted = false;
                        vid.play().catch(() => console.log("Play blocked"));
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
                          vid.muted = true;
                          vid.play();
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
                  {/* Note: Insert actual vertical .mp4 paths here */}
                  <video 
                    className="w-full h-full object-cover scale-[1.02] group-hover/video:scale-100 transition-transform duration-700 ease-out"
                    src={`/videos/tiktok-${item}.mp4`}
                    loop
                    playsInline
                  />
                  
                  {/* Elegant Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 group-hover/video:opacity-80 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Play Icon Overlay */}
                  <div className="play-overlay absolute inset-0 flex flex-col justify-center items-center transition-opacity duration-500 pointer-events-none">
                    <div className="size-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-transform duration-500">
                      <span className="material-symbols-outlined text-white text-2xl ml-0.5 opacity-90">play_arrow</span>
                    </div>
                  </div>

                  <a 
                    href="https://www.tiktok.com/@richse.888?_r=1&_t=ZS-94v5EesyoiY" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-6 left-6 right-6 text-white z-10 block w-fit"
                  >
                     <p className="font-serif text-[10px] md:text-[11px] tracking-[0.15em] uppercase bg-white/10 backdrop-blur-md w-fit px-5 py-2.5 rounded-full border border-white/20 hover:bg-white hover:text-[#161314] transition-colors duration-500">
                        @richse.888
                     </p>
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* --- COMMUNITY VOICES --- */}
      <section className="py-24 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.span variants={fadeInUp} className="text-primary font-bold tracking-widest uppercase text-xs">Community Voices</motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold mt-2">Shared Experiences</motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "“ดิฉันประทับใจในความอ่อนโยนและประสิทธิภาพที่พิสูจน์ได้จริง ผิวแลดูเรียบเนียนและแข็งแรงขึ้นภายในสองสัปดาห์ นับเป็นผลิตภัณฑ์ที่โดดเด่นอย่างยิ่งค่ะ”", name: "กนกวรรณ ศรีอำไพ", title: "Vogue Contributor", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0c3DaMxV1mAx2B_8VNuOcVQ89pawk0Z4fBYI1rOC00uDVCHfcEXZG1V-29Lwavf5RGIeEtiFs-YNDJXPxftzTMhBRmyqSrBogpiLDm1gkOGzpK2yDJKtfnt12WjMqeLUAPT4UJlh3HSJXnKXa4B_6lwrSBaLBaVIFxB2xw-4UHXcUdZ4frNI2X-geIKaYo7eetxumNtnLpPMknOWFK8eErg_BSUAOmyc2rHh4ifGOJPrQ_ZGVQPA7yoJv1n_w9SOTohpCcOW2mRM" },
              { text: "“ผลิตภัณฑ์นี้ให้ผลลัพธ์เชิงประจักษ์ภายในระยะเวลาอันสั้น โดยไม่ก่อให้เกิดการระคายเคืองต่อผิวแพ้ง่าย ถือเป็นอีกมาตรฐานที่น่าชื่นชมในกลุ่มสกินแคร์ระดับสูง”", name: "ธีรภัทร วัฒนศิริ", title: "Skincare Specialist", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFadPtDcIKL6h9YR-z6iN2Y0Q2-NKdEg6D9JRA0uYotIU6tglfx2MzmFOSUAAwV1A4dmj17g1WS4jf6z93h8sFp8ny-fGMzrG5SHOZNwmwDdxK_Qhg3yVH3_6RJTKFTdJP7MfDc8J4GQltptoVUuFhOLLUyYzWr6Un6GBgJcqFLFtppIz0-z_8Dcdk26F_NMzkBDTPC9_giJraKCnfVohUfpLDyrYCAmHWbKdbpMO7XriaB471Bv6VOhUUP2C3BjaoF7MCZJb3f_E" },
              { text: "“ในที่สุดก็พบผลิตภัณฑ์ระดับพรีเมียมที่อ่อนโยนต่อผิวบอบบางอย่างแท้จริง เห็นการเปลี่ยนแปลงของผิวอย่างชัดเจนภายในสองสัปดาห์ ประสิทธิภาพน่าประทับใจมากค่ะ”", name: "โสภี จันทร์เพ็ญ", title: "Lifestyle Influencer", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyqQzej49jQsMHMfWBUzE3zrxHX6wOli8fQCT7Z1G-hZct04vc2qXRHX84sl_OVfjNj8ARr4ifUFWND9RH-oaFcgLlOXdn_g1i5a9M8Nnc--xOelDgAqQb9wHVqgOEFaWzGOIV8TK7SsQhZyFRiZ9Pu_1L1uPZWBMoNlPT2V8J4D2Uo5L_lfueV_fWDy4zwh_h_K1jDlrsVQwOnKz6T7dmGG69pBR7Q5oZSIdLgqioHSVI_M4g7heHOa4EeqNz_fY0tP1dOJxpohw" }
            ].map((quote, i) => (
              <motion.div 
                key={i} 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.15 }}
                className="hero-mesh dark:bg-white/5 p-8 rounded-2xl relative"
              >
                <div className="flex gap-1 text-[#C9A961] mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <span key={idx} className="material-symbols-outlined fill-1">star</span>
                  ))}
                </div>
                <p className="italic text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {quote.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${quote.img}')` }} />
                  <div>
                    <p className="font-bold text-sm">{quote.name}</p>
                    <p className="text-xs text-gray-500">{quote.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- JOIN THE INNER CIRCLE --- */}
      <section className="py-20 bg-[#c3a2ab]/10 border-t border-[#c3a2ab]/20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-200 mx-auto px-6 text-center">
          <motion.h2 variants={fadeInUp} className="font-display text-3xl font-bold mb-4">Join The Inner Circle</motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-600 dark:text-gray-400 mb-8">
            Receive early access to new rituals, exclusive events, and expert skincare advice.
          </motion.p>

          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded-xl bg-white border-none focus:ring-2 focus:ring-primary px-6 py-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#c3a2ab] text-white font-bold px-10 py-4 rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Subscribe"}
            </button>
          </motion.form>
          {message && <p className="text-sm mt-2 w-full text-center">{message}</p>}
          <motion.p variants={fadeInUp} className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest">
            Privacy Respected. Unsubscribe Anytime.
          </motion.p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
