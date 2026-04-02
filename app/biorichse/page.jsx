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
                            className="md:col-span-2 group relative overflow-hidden signature-gradient p-5 md:p-8 rounded-[1.5rem] flex flex-row md:flex-col items-center md:justify-between min-h-[100px] md:min-h-[220px] active:scale-[0.98] transition-transform gap-4 md:gap-0"
                            href="https://line.me/ti/g2/dQQu0-rhnBQKiAdDn3L02Ro7id7RDruC02Q5NA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="md:absolute top-0 right-0 p-0 md:p-8 opacity-40 md:opacity-20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line Logo" className="w-12 h-12 md:w-32 md:h-32" />
                            </div>
                            <div className="relative z-10 flex-grow">
                                <span className="hidden md:inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[0.6rem] md:text-[0.65rem] uppercase tracking-tighter text-white mb-3 md:mb-4 font-bold">
                                    High Intent Opportunity
                                </span>
                                <h2 className="text-xl md:text-4xl lg:text-5xl font-bold text-[#4b0027] leading-tight">
                                    Group Affiliate Community
                                </h2>
                                <div className="md:hidden mt-1">
                                    <span className="text-[#4b0027]/80 text-sm font-bold uppercase tracking-widest">Share & Earn 15%</span>
                                </div>
                            </div>
                            <div className="relative z-10 flex items-center justify-between md:mt-10 md:w-full">
                                <span className="hidden md:inline-block text-2xl md:text-3xl font-bold text-[#4b0027]">Com 10-15%</span>
                                <div className="bg-[#4b0027] text-white p-2 md:px-8 md:py-3 rounded-full text-sm md:text-base flex items-center gap-2 group-hover:gap-4 transition-all uppercase font-bold tracking-widest shadow-xl">
                                    <span className="hidden md:inline">Join Now</span> <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line" className="w-4 h-4 md:w-5 md:h-5 brightness-0 invert" />
                                </div>
                            </div>
                        </a>

                        {/* Shopee Tile */}
                        <a
                            className="glass-tile p-5 md:p-8 rounded-[1.5rem] flex flex-row md:flex-col items-center md:justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98] gap-4"
                            href="https://th.shp.ee/awo2JNVD"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="shrink-0 flex justify-between items-start md:w-full">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-500/20 rounded-xl flex items-center justify-center p-2 md:p-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" alt="Shopee Logo" className="h-6 md:h-8 w-auto object-contain" />
                                </div>
                                <span className="hidden md:inline-block text-[#ff88b4] font-bold text-lg md:text-xl tracking-tighter uppercase">Official</span>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-lg md:text-2xl font-bold mb-0.5 md:mb-2">Shopee Store</h3>
                                <p className="text-xs md:text-base text-[#acaab1] md:mb-6">Exclusive brand discounts & deals.</p>
                                <div className="md:hidden mt-1 text-[#ff88b4] text-[0.6rem] font-bold uppercase tracking-widest">Shop Online</div>
                            </div>
                            <div className="shrink-0 text-[#ff88b4] text-xs md:text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                <span className="hidden md:inline">Shop Now</span> <span className="material-symbols-outlined text-sm md:text-sm">arrow_forward</span>
                            </div>
                        </a>

                        {/* Line Consult Tile */}
                        <a
                            className="glass-tile p-5 md:p-8 rounded-[1.5rem] flex flex-row md:flex-col items-center md:justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98] gap-4"
                            href="https://line.me/R/ti/p/@338mcudr?oat_content=url&ts=02170245"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="shrink-0 flex justify-between items-start md:w-full">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-500/20 rounded-xl flex items-center justify-center p-2 md:p-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line Logo" className="w-7 h-7 md:w-8 md:h-8" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-lg md:text-2xl font-bold mb-0.5 md:mb-2">Consultation</h3>
                                <p className="text-xs md:text-base text-[#acaab1] md:mb-6">Official Line Support</p>
                                <div className="md:hidden mt-1 text-green-500 text-[0.6rem] font-bold uppercase tracking-widest">Connect Support</div>
                            </div>
                            <div className="shrink-0 text-green-500 text-xs md:text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                <span className="hidden md:inline">Chat Now</span> <span className="material-symbols-outlined text-sm md:text-sm">chat</span>
                            </div>
                        </a>

                        {/* Instagram Tile */}
                        <a
                            className="glass-tile p-5 md:p-8 rounded-[1.5rem] flex flex-row md:flex-col items-center md:justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98] gap-4"
                            href="https://www.instagram.com/richse_official/?utm_source=ig_embed&ig_rid=866aee39-6af1-4bd0-9f3d-6504b9238b17"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="shrink-0 flex justify-between items-start md:w-full">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-xl flex items-center justify-center p-2 md:p-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram Logo" className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-lg md:text-2xl font-bold mb-0.5 md:mb-2">Instagram</h3>
                                <p className="text-xs md:text-base text-[#acaab1] md:mb-6">Updates & Lifestyle</p>
                                <div className="md:hidden mt-1 text-[#ac89ff] text-[0.6rem] font-bold uppercase tracking-widest">Follow Story</div>
                            </div>
                            <div className="shrink-0 text-[#ac89ff] text-xs md:text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                <span className="hidden md:inline">View Feed</span> <span className="material-symbols-outlined text-sm md:text-sm">grid_view</span>
                            </div>
                        </a>

                        {/* Facebook Tile */}
                        <a
                            className="glass-tile p-5 md:p-8 rounded-[1.5rem] flex flex-row md:flex-col items-center md:justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98] gap-4"
                            href="https://www.facebook.com/chnay.chi.ta.ra.ni.nakh.ratn.siri.kul/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="shrink-0 flex justify-between items-start md:w-full">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/20 rounded-xl flex items-center justify-center p-2 md:p-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook Logo" className="w-8 h-8 md:w-10 md:h-10 md:w-12 md:h-12" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-lg md:text-2xl font-bold mb-0.5 md:mb-2">Facebook</h3>
                                <p className="text-xs md:text-base text-[#acaab1] md:mb-6">Official Brand Page</p>
                                <div className="md:hidden mt-1 text-blue-400 text-[0.6rem] font-bold uppercase tracking-widest">Join Community</div>
                            </div>
                            <div className="shrink-0 text-blue-400 text-xs md:text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                <span className="hidden md:inline">Follow Us</span> <span className="material-symbols-outlined text-sm md:text-sm">thumb_up</span>
                            </div>
                        </a>

                        {/* Primary Tile: Official Website (Moved to Bottom) */}
                        <Link
                            className="md:col-span-2 group relative overflow-hidden bg-white text-[#0e0e13] p-5 md:p-8 rounded-[1.5rem] flex flex-row md:flex-col items-center md:justify-between min-h-[100px] md:min-h-[160px] active:scale-[0.98] transition-transform hover:bg-[#ff88b4] hover:text-[#4b0027] gap-4 md:gap-0"
                            href="/"
                        >
                            <div className="md:absolute top-0 right-0 p-0 md:p-8 opacity-20 md:opacity-10 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                <img src="/logo.png" alt="Richse Logo" className="w-14 h-14 md:w-32 md:h-32 md:w-48 md:h-48" />
                            </div>
                            <div className="relative z-10 flex-grow">
                                <span className="hidden md:inline-block bg-[#0e0e13]/10 px-3 py-1 rounded-full text-[0.6rem] md:text-[0.65rem] uppercase tracking-tighter mb-3 md:mb-4 font-bold">
                                    Direct to Store
                                </span>
                                <h2 className="text-xl md:text-4xl lg:text-5xl font-bold leading-tight">Official Website</h2>
                                <div className="md:hidden mt-0.5 text-[#0e0e13]/60 text-xs font-bold uppercase tracking-widest">Shop Online Store</div>
                            </div>
                            <div className="relative z-10 flex items-center justify-between md:mt-4 md:mt-6">
                                <p className="hidden md:block text-sm md:text-base md:text-lg opacity-80 font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">Shop our full collection & offers.</p>
                                <div className="bg-[#0e0e13] text-white p-2.5 md:px-8 md:py-3 rounded-full text-base flex items-center gap-2 group-hover:bg-[#4b0027] transition-all font-bold shadow-xl">
                                    <span className="hidden md:inline">Visit Now</span> <span className="material-symbols-outlined text-base md:text-lg">open_in_new</span>
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