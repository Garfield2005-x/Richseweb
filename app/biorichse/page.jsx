"use client";

import React from "react";
import Link from "next/link";

export default function BiorichsePage() {
    return (
        <div className="bg-[#0e0e13] text-[#f8f5fd] font-sans selection:bg-[#ff88b4] selection:text-[#4b0027] min-h-screen flex flex-col overflow-x-hidden">
            {/* Custom Styles */}
            <style jsx global>{`
        .glass-tile {
          background: rgba(31, 31, 38, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .signature-gradient {
          background: linear-gradient(135deg, #ff88b4 0%, #e1007f 100%);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

            {/* Main Content */}
            <main className="flex-grow pt-16 pb-20 px-6 max-w-7xl mx-auto w-full">
                {/* Logo Section */}
                <div className="flex justify-center mb-12">
                    <img
                        className="w-20 h-20 object-contain rounded-full border-2 border-[#ff88b4]/20 p-1 shadow-lg shadow-[#ff88b4]/5 bg-white"
                        alt="Richse Brand Logo"
                        src="/logo.png"
                    />
                </div>

                {/* Hero Section */}
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* Left Editorial Column */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-[#ff88b4]/10 rounded-[2rem] blur-2xl group-hover:bg-[#ff88b4]/20 transition-all duration-700"></div>
                            <img
                                className="relative w-48 h-48 lg:w-64 lg:h-64 object-contain rounded-[2rem] shadow-2xl bg-white/10 backdrop-blur-md p-4"
                                alt="Richse Brand Official Logo"
                                src="/logo.png"
                            />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-[#f8f5fd]">
                                RICH&apos;SE <span className="text-[#ff88b4]">BRAND</span> ★
                            </h1>
                            <p className="text-xl lg:text-2xl text-[#acaab1] font-light leading-relaxed max-w-md">
                                &apos;ยินดีต้อนรับสู่เบบี้ของริชเช่&apos; พื้นที่นี้เป็นพื้นที่ปลอดภัยสำหรับคุณ🫶🏻
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="glass-tile px-6 py-4 rounded-xl flex flex-col">
                                <span className="text-3xl font-bold text-[#ff88b4]">188.4K</span>
                                <span className="text-[0.65rem] uppercase tracking-widest text-[#acaab1]">Followers</span>
                            </div>
                            <div className="glass-tile px-6 py-4 rounded-xl flex flex-col">
                                <span className="text-3xl font-bold text-[#ac89ff]">Active</span>
                                <span className="text-[0.65rem] uppercase tracking-widest text-[#acaab1]">Community</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Bento Grid Column */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Highlight Tile: Group Affiliate */}
                        <a
                            className="md:col-span-2 group relative overflow-hidden signature-gradient p-8 rounded-[1.5rem] flex flex-col justify-between min-h-[220px] active:scale-[0.98] transition-transform"
                            href="https://line.me/ti/g2/dQQu0-rhnBQKiAdDn3L02Ro7id7RDruC02Q5NA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line Logo" className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[0.65rem] uppercase tracking-tighter text-white mb-4 inline-block font-bold">
                                    High Intent Opportunity
                                </span>
                                <h2 className="text-4xl lg:text-5xl font-bold text-[#4b0027] leading-tight">
                                    Group Affiliate
                                    <br />
                                    Community
                                </h2>
                            </div>
                            <div className="relative z-10 flex items-center justify-between mt-10">
                                <span className="text-3xl font-bold text-[#4b0027]">ค่าคอมมิชชั่น 12-20%</span>
                                <div className="bg-[#4b0027] text-white px-8 py-3 rounded-full text-base flex items-center gap-2 group-hover:gap-4 transition-all uppercase font-bold tracking-widest shadow-xl">
                                    Join Now <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line" className="w-5 h-5 brightness-0 invert" />
                                </div>
                            </div>
                        </a>

                        {/* Shopee Tile */}
                        <a
                            className="glass-tile p-8 rounded-[1.5rem] flex flex-col justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98]"
                            href="https://th.shp.ee/awo2JNVD"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center p-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" alt="Shopee Logo" className="h-8 w-auto object-contain" />
                                </div>
                                <span className="text-[#ff88b4] font-bold text-xl tracking-tighter uppercase">Official</span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold mb-2">Shopee Store</h3>
                                <p className="text-base text-[#acaab1] mb-6">Exclusive brand discounts & deals.</p>
                                <div className="text-[#ff88b4] text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Shop Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </div>
                            </div>
                        </a>

                        {/* Line Consult Tile */}
                        <a
                            className="glass-tile p-8 rounded-[1.5rem] flex flex-col justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98]"
                            href="https://line.me/R/ti/p/@338mcudr?oat_content=url&ts=02170245"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center p-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line Logo" className="w-8 h-8" />
                                </div>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold mb-2">Consultation</h3>
                                <p className="text-base text-[#acaab1] mb-6">ปรึกษาปัญหาผิว (Official Line)</p>
                                <div className="text-green-500 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Chat Now <span className="material-symbols-outlined text-sm">chat</span>
                                </div>
                            </div>
                        </a>

                        {/* Instagram Tile */}
                        <a
                            className="glass-tile p-8 rounded-[1.5rem] flex flex-col justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98]"
                            href="https://www.instagram.com/richse_official/?utm_source=ig_embed&ig_rid=866aee39-6af1-4bd0-9f3d-6504b9238b17"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center p-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram Logo" className="w-10 h-10" />
                                </div>
                            </div>
                            <div className="mt-10">
                                <h3 className="text-2xl font-bold mb-2">Instagram</h3>
                                <p className="text-base text-[#acaab1] mb-6">Behind the scenes & updates.</p>
                                <div className="text-[#ac89ff] text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    View Feed <span className="material-symbols-outlined text-sm">grid_view</span>
                                </div>
                            </div>
                        </a>

                        {/* Facebook Tile */}
                        <a
                            className="glass-tile p-8 rounded-[1.5rem] flex flex-col justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98]"
                            href="https://www.facebook.com/chnay.chi.ta.ra.ni.nakh.ratn.siri.kul/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center p-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook Logo" className="w-10 h-10 md:w-12 md:h-12" />
                                </div>
                            </div>
                            <div className="mt-10">
                                <h3 className="text-2xl font-bold mb-2">Facebook</h3>
                                <p className="text-base text-[#acaab1] mb-6">Join our official brand page.</p>
                                <div className="text-blue-400 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                    Follow Us <span className="material-symbols-outlined text-sm">thumb_up</span>
                                </div>
                            </div>
                        </a>

                        {/* Primary Tile: Official Website (Moved to Bottom) */}
                        <Link
                            className="md:col-span-2 group relative overflow-hidden bg-white text-[#0e0e13] p-8 rounded-[1.5rem] flex flex-col justify-between min-h-[160px] active:scale-[0.98] transition-transform hover:bg-[#ff88b4] hover:text-[#4b0027]"
                            href="/"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <img src="/logo.png" alt="Richse Logo" className="w-32 h-32 md:w-48 md:h-48" />
                            </div>
                            <div className="relative z-10">
                                <span className="bg-[#0e0e13]/10 px-3 py-1 rounded-full text-[0.65rem] uppercase tracking-tighter mb-4 inline-block font-bold">
                                    Direct to Store
                                </span>
                                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">Official Website</h2>
                            </div>
                            <div className="relative z-10 flex items-center justify-between mt-6">
                                <p className="text-base md:text-lg opacity-80 font-medium">Shop our full collection & exclusive offers.</p>
                                <div className="bg-[#0e0e13] text-white px-8 py-3 rounded-full text-base flex items-center gap-2 group-hover:bg-[#4b0027] transition-all font-bold shadow-xl">
                                    Visit Now <span className="material-symbols-outlined text-lg">open_in_new</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Context Banner */}
                <div className="mt-20 glass-tile rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative border border-[#48474d]/5">
                    <div className="absolute left-0 top-0 w-1/3 h-full bg-[#ff88b4]/5 blur-3xl rounded-full"></div>
                    <div className="relative z-10 max-w-xl">
                        <span className="text-[#ff88b4] text-[0.65rem] uppercase tracking-[0.3em] mb-4 block">
                            Exclusive Online Store
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
                            สัมผัสประสบการณ์ช้อปปิ้งระดับพรีเมียม
                        </h2>
                        <p className="text-[#acaab1] text-lg">
                            พบกับสินค้าราคาพิเศษ พร้อมโปรโมชั่นเฉพาะที่เว็บไซต์ทางการของ RICH&apos;SE เท่านั้น
                        </p>
                    </div>
                    <div className="relative z-10 flex -space-x-4">
                        <img
                            className="w-32 h-44 object-cover rounded-2xl border-4 border-[#0e0e13] shadow-xl rotate-[-6deg]"
                            alt="Richse Website Experience"
                            src="/biorichse/website.png"
                        />
                        <img
                            className="w-32 h-44 object-cover rounded-2xl border-4 border-[#0e0e13] shadow-xl translate-y-4"
                            alt="Richse Premium Product"
                            src="/biorichse/product.png"
                        />
                        <img
                            className="w-32 h-44 object-cover rounded-2xl border-4 border-[#0e0e13] shadow-xl rotate-[6deg]"
                            alt="Richse Luxury Unboxing"
                            src="/biorichse/lifestyle.png"
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full flex flex-col items-center justify-center gap-4 px-8 bg-black py-8">
                <div className="text-sm font-bold text-[#f8f5fd] uppercase tracking-widest">RICH&apos;SE BRAND ★</div>
                <div className="flex gap-8">
                    <a className="text-[0.75rem] uppercase tracking-widest text-[#55545a] hover:text-white transition-all" href="#">
                        Privacy Policy
                    </a>
                    <a className="text-[0.75rem] uppercase tracking-widest text-[#55545a] hover:text-white transition-all" href="#">
                        Contact
                    </a>
                </div>
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[#55545a] mt-4">Powered by Richse</p>
            </footer>
        </div>
    );
}