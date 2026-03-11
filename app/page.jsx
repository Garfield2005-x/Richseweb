"use client";

import { products } from "@/data/products"
import { useCart } from "@/context/CartContext"
import { useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Link from 'next/link'

export default function Home() {
      const [email, setEmail] = useState("");
      const [message, setMessage] = useState("");
      const [loading, setLoading] = useState(false);
      const { addToCart } = useCart()
 

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }

    setLoading(false);
  };

  return (
    <div>
        <title>Richse | Luxury Skincare - Radiance Refined</title>
      <Navbar />
      <section className="hero-mesh dark:bg-background-dark py-12 md:py-20">
<div className="max-w-7xl mx-auto px-6">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
<div className="order-2 lg:order-1 space-y-8">
<div className="space-y-4">
<span className="text-[#c3a2ab] font-bold tracking-widest uppercase text-xs">New Collection: L éclat</span>
<h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] text-[#161314] dark:text-white">
                                Radiance <br/><span className="text-[#C9A961] font-display italic font-medium">
  Refined.
</span>



</h1>
<p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                               Thoughtfully crafted skincare that blends refined formulation with a modern approach to skin wellness, designed to support a naturally radiant and healthy-looking complexion.
                            </p>
</div> 
<div className="flex flex-wrap gap-4">
<Link className="bg-[#c3a2ab] text-white px-10 py-4 rounded-xl font-bold tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20" href="/ProductAll">
                                Shop All
                            </Link>
{/* <button className="border border-[#dfd8da] dark:border-white/10 px-10 py-4 rounded-xl font-bold tracking-wide hover:bg-white dark:hover:bg-white/5 transition-all">
                                Take Skin Quiz
                            </button> */}
</div>
<div className="pt-8 flex items-center gap-6">
<div className="flex -space-x-3">
  <div
    className="size-10 rounded-full border-2 border-white bg-cover bg-center"
    data-alt="Customer avatar profile photo"
    style={{
      backgroundImage:
        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOkU_KsqoSbhbtjJ5OK9CLJa6qSuYp3FafH-5nN4-H_9gRQAwdEge5ePpZlee9flZzUHCC5Eqg5W-PocN0GRdG-6eYGM0CtwOHiaZtCPmghKObx7bLetYpi-upa72L4tRUipvZVaBED4KGN31iBxkekVRd14csqj41oXrqCnFYDhL0Q1aEInkrj_s4Q9i-wjyGpzBmUDJpMb1gEkQ7PqFeht3_H4uYGOKXz39j_WZJpCKIIJS7Alfg1cSmsWuFW1sfy5NvAGJoqCU')",
    }}
  />

  <div
    className="size-10 rounded-full border-2 border-white bg-cover bg-center"
    data-alt="Customer avatar profile photo"
    style={{
      backgroundImage:
        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDszfLbZT1XnVheqbKqCnnJvupr51auXLy8rZ_dvzHG157egPBmPKxb7WT-_cHGSqLMExoNRLiFIRww8HhXiX_MZq2hpr22pscgo1fzgY0bLrcacqJJCdctMfyb7Z_fWfKnyWY9iVQxSht9YnIFWje2A27e5NfRoqVnj6bJu7yFJxnzFJXV_Ly6A00t9rbXf5YQ9yGBU20jriE_6U0hOl3JGZit5vAmK9WuHAtvMX74FZT_ZiqkT_F3XzPfykhevxTCIZAQEzzU2LA')",
    }}
  />

  <div
    className="size-10 rounded-full border-2 border-white bg-cover bg-center"
    data-alt="Customer avatar profile photo"
    style={{
      backgroundImage:
        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAzAfdMu-3RKvQBQQmbeIFjWUf1wlZXlQhh7P9e4sICbkGiXGKs3s4X_QULfM-xcRQ0PEJ1s8Kytvagkp8RZ9GD7Oj7l1paVsQodOYMyWZTgHLI4r1hQy1w8fbaIYPFXImsAlLUwLPD8qje6En3dZBaZ2_gvJ1oL2YMsNtPn3dkHNRXhaA8AM3lprxZppX0n4fJU4HnljWJVgFF8ozB8oh9aWOng5h-GiZdunpLCqPhFligY32ziY7jDoJ8ftgm-53q8Qj5WObdXnk')",
    }}
  />
</div>

<p className="text-sm font-medium text-gray-500 italic">The most luminous my skin has ever looked. — Harper is Bazaar</p>
</div>
<div className="pt-8 flex items-center gap-6">
<div className="flex -space-x-3">

</div>
</div>
</div>
<div className="order-1 lg:order-2">
<div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-2xl">
<div
  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
  data-alt="Close-up of glowing model skin with premium product bottle"
  style={{
    backgroundImage:
      "url('https://i.postimg.cc/PqnMmmvZ/IMG-8008.png')",
  }}
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
</div>
</div>
</div>
</div>
</section>

<section className="py-20 bg-white dark:bg-background-dark/50">
<div className="max-w-7xl mx-auto px-6">
<div className="text-center mb-16 space-y-4">
<h2 className="font-display text-3xl md:text-4xl font-bold">Why Richse</h2>
<div className="w-16 h-0.5 bg-[#c3a2ab] mx-auto"></div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
<div className="p-8 rounded-2xl border border-[#dfd8da] dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all group">
<div className="size-12 rounded-xl bg-[#c3a2ab]/10 flex items-center justify-center text-[#c3a2ab] mb-6 group-hover:bg-[#c3a2ab] group-hover:text-white transition-colors">
<span className="material-symbols-outlined">shield_with_heart</span>
</div>
<h3 className="font-display text-xl font-bold mb-3">Dermatologist Tested</h3>
<p className="text-gray-600 dark:text-gray-400 leading-relaxed">Developed with professional skincare insight and thoughtfully tested to ensure it is gentle and suitable for everyday use, including sensitive skin.</p>
</div>
<div className="p-8 rounded-2xl border border-[#dfd8da] dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all group">
<div className="size-12 rounded-xl bg-[#c3a2ab]/10 flex items-center justify-center text-[#c3a2ab] mb-6 group-hover:bg-[#c3a2ab] group-hover:text-white transition-colors">
<span className="material-symbols-outlined">eco</span>
</div>
<h3 className="font-display text-xl font-bold mb-3">Ethical Beauty</h3>
<p className="text-gray-600 dark:text-gray-400 leading-relaxed">Created with a mindful approach to beauty, focusing on thoughtful formulation and carefully chosen packaging that reflects a commitment to responsible and refined skincare.</p>
</div>
<div className="p-8 rounded-2xl border border-[#dfd8da] dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all group">
<div className="size-12 rounded-xl bg-[#c3a2ab]/10 flex items-center justify-center text-[#c3a2ab] mb-6 group-hover:bg-[#c3a2ab] group-hover:text-white transition-colors">
<span className="material-symbols-outlined">auto_awesome</span>
</div>
<h3 className="font-display text-xl font-bold mb-3">Clinical Results</h3>
<p className="text-gray-600 dark:text-gray-400 leading-relaxed">Developed with insights from modern skincare research, focusing on formulas designed to support hydration, comfort, and a smoother-looking complexion with consistent use.</p>
</div>
</div>
</div>
</section>

<section className="py-20  hero-mesh overflow-hidden">
<div className="max-w-7xl mx-auto px-6 flex justify-between items-end mb-10">
<div>
<span className="text-[#c3a2ab] font-bold tracking-widest uppercase text-xs">Curated Selection</span>
<h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Best Sellers</h2>
</div>
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

        {products.map((product) => (
          <div key={product.id} className="min-w-75 group">

            {/* รูปสินค้า */}
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 mb-4">

              <Link href={`/Product${product.id}`}>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${product.image}')` }}
                />
              </Link>

              {/* ป้าย Limited (ตัวอย่าง: แสดงเฉพาะ id 3) */}
              {product.id === 3 && (
                <div className="absolute top-4 left-4 bg-[#c3a2ab] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Limited Edition
                </div>
              )}

              {/* Quick Add */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  addToCart(product)
                }}
                className="absolute bottom-4 left-4 right-4
                           bg-white text-[#161314]
                           py-3 rounded-xl font-bold text-sm
                           opacity-0 translate-y-4
                           group-hover:opacity-100 group-hover:translate-y-0
                           transition-all duration-300
                           shadow-xl text-center"
              >
                Quick Add
              </button>
            </div>

            {/* รายละเอียด */}
            <div className="space-y-1">
              <p className="font-display text-lg font-bold">
                {product.name}
              </p>

              <p className="text-sm text-gray-500">
                {product.taxe}
              </p>

              <p className="font-bold text-[#c3a2ab] mt-2">
                ฿{product.price}
              </p>
            </div>

          </div>
        ))}

      </div>
    </div>



</div>
</section>

<section className="py-20 bg-[#fdf2f4] dark:bg-white/5 overflow-hidden">
  <div className="max-w-360 mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
      
      {/* Image side */}
      <div className="relative h-100 lg:h-auto">
        <div
          className="absolute inset-0 bg-cover bg-center"
          data-alt="Abstract soft focus floral and skin texture"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDLVXHf6xGALyLqVndNiAE1VuS-foRnne7691w9no7pMvul8jMP86dDOoctV7rt1A19zXorGl_vLnWdGwfKPU6R8UQpUx8v5rCizadRfcLOFforlIRIGQiG9XtClgL_qaq8k1tWIECOQRuD16GI1zeHRf5EX-hMSqTeWAJmBc5iWnnWQqT8LNZWDa7_ETWwsdea8yFfrY4xYidZLxhkciiKfKe2iy_lhWjimJBKrl9cemIxM05KgMtoZvaiVSPMV_BP3K7PNe6Kngo')",
          }}
        />
      </div>

      {/* Content side */}
      <div className="p-10 md:p-24 flex flex-col justify-center space-y-8 bg-white dark:bg-background-dark">
        <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
          Crafted for the Modern Matriarch.
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          

RICHSE was created with the vision of thoughtful skincare that blends timeless care with a modern approach to skin wellness. We believe skincare is more than a routine — it is a moment of self-care, confidence, and quiet luxury in everyday life.

        </p>

        <div className="h-px w-24 bg-[#C9A961]" />

        <a
          href="#"
          className="inline-flex items-center gap-2 text-[#c3a2ab] font-bold uppercase tracking-widest text-sm group"
        >
          Read Our Manifesto
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
            arrow_right_alt
          </span>
        </a>
      </div>
    </div>
  </div>
</section>


<section className="py-24 bg-white  dark:bg-background-dark">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-16">
      <span className="text-primary font-bold tracking-widest uppercase text-xs">
        Community Voices
      </span>
      <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
        Shared Experiences
      </h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* Card 1 */}
      <div className="hero-mesh dark:bg-white/5 p-8 rounded-2xl relative">
        <div className="flex gap-1 text-[#C9A961] mb-4">
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
        </div>

        <p className="italic text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
         “ดิฉันประทับใจในความอ่อนโยนและประสิทธิภาพที่พิสูจน์ได้จริง ผิวแลดูเรียบเนียนและแข็งแรงขึ้นภายในสองสัปดาห์ นับเป็นผลิตภัณฑ์ที่โดดเด่นอย่างยิ่งค่ะ”
        </p>

        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0c3DaMxV1mAx2B_8VNuOcVQ89pawk0Z4fBYI1rOC00uDVCHfcEXZG1V-29Lwavf5RGIeEtiFs-YNDJXPxftzTMhBRmyqSrBogpiLDm1gkOGzpK2yDJKtfnt12WjMqeLUAPT4UJlh3HSJXnKXa4B_6lwrSBaLBaVIFxB2xw-4UHXcUdZ4frNI2X-geIKaYo7eetxumNtnLpPMknOWFK8eErg_BSUAOmyc2rHh4ifGOJPrQ_ZGVQPA7yoJv1n_w9SOTohpCcOW2mRM')",
            }}
          />
          <div>
            <p className="font-bold text-sm">กนกวรรณ ศรีอำไพ</p>
            <p className="text-xs text-gray-500">Vogue Contributor</p>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="hero-mesh dark:bg-white/5 p-8 rounded-2xl relative">
        <div className="flex gap-1 text-[#C9A961] mb-4">
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
        </div>

        <p className="italic text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          “ผลิตภัณฑ์นี้ให้ผลลัพธ์เชิงประจักษ์ภายในระยะเวลาอันสั้น โดยไม่ก่อให้เกิดการระคายเคืองต่อผิวแพ้ง่าย ถือเป็นอีกมาตรฐานที่น่าชื่นชมในกลุ่มสกินแคร์ระดับสูง”
        </p>

        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAFadPtDcIKL6h9YR-z6iN2Y0Q2-NKdEg6D9JRA0uYotIU6tglfx2MzmFOSUAAwV1A4dmj17g1WS4jf6z93h8sFp8ny-fGMzrG5SHOZNwmwDdxK_Qhg3yVH3_6RJTKFTdJP7MfDc8J4GQltptoVUuFhOLLUyYzWr6Un6GBgJcqFLFtppIz0-z_8Dcdk26F_NMzkBDTPC9_giJraKCnfVohUfpLDyrYCAmHWbKdbpMO7XriaB471Bv6VOhUUP2C3BjaoF7MCZJb3f_E')",
            }}
          />
          <div>
            <p className="font-bold text-sm">ธีรภัทร วัฒนศิริ</p>
            <p className="text-xs text-gray-500">Skincare Specialist</p>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="hero-mesh dark:bg-white/5 p-8 rounded-2xl relative">
        <div className="flex gap-1 text-[#C9A961] mb-4">
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
          <span className="material-symbols-outlined fill-1">star</span>
        </div>

        <p className="italic text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          “ในที่สุดก็พบผลิตภัณฑ์ระดับพรีเมียมที่อ่อนโยนต่อผิวบอบบางอย่างแท้จริง เห็นการเปลี่ยนแปลงของผิวอย่างชัดเจนภายในสองสัปดาห์ ประสิทธิภาพน่าประทับใจมากค่ะ”
        </p>

        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyqQzej49jQsMHMfWBUzE3zrxHX6wOli8fQCT7Z1G-hZct04vc2qXRHX84sl_OVfjNj8ARr4ifUFWND9RH-oaFcgLlOXdn_g1i5a9M8Nnc--xOelDgAqQb9wHVqgOEFaWzGOIV8TK7SsQhZyFRiZ9Pu_1L1uPZWBMoNlPT2V8J4D2Uo5L_lfueV_fWDy4zwh_h_K1jDlrsVQwOnKz6T7dmGG69pBR7Q5oZSIdLgqioHSVI_M4g7heHOa4EeqNz_fY0tP1dOJxpohw')",
            }}
          />
          <div>
            <p className="font-bold text-sm">โสภี จันทร์เพ็ญ</p>
            <p className="text-xs text-gray-500">Lifestyle Influencer</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

          <section className="py-20 bg-[#c3a2ab]/10 border-t border-[#c3a2ab]/20">
  <div className="max-w-200 mx-auto px-6 text-center">
    <h2 className="font-display text-3xl font-bold mb-4">
      Join The Inner Circle
    </h2>

    <p className="text-gray-600 dark:text-gray-400 mb-8">
      Receive early access to new rituals, exclusive events, and expert skincare advice.
    </p>

    <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto"
      >
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

        {message && (
          <p className="text-sm mt-2 w-full text-center">
            {message}
          </p>
        )}
      </form>

    <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest">
      Privacy Respected. Unsubscribe Anytime.
    </p>
  </div>
</section>

         

<Footer />
    </div>
  );
}
