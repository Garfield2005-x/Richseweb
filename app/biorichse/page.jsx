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
            <main className="flex-grow pt-4 pb-8 px-6 max-w-7xl mx-auto w-full">

                {/* Hero Section */}
                <div className="flex flex-col gap-4 items-center lg:items-start">
                    {/* Left Editorial Column */}
                    <div className="w-full flex flex-col gap-2 items-center lg:items-start">
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-[#ff88b4]/10 rounded-2xl blur-xl group-hover:bg-[#ff88b4]/20 transition-all duration-700"></div>
                            <img
                                className="relative w-32 h-32 lg:w-40 lg:h-40 object-contain rounded-2xl shadow-xl bg-white/5 backdrop-blur-md p-2"
                                alt="Richse Brand Official Logo"
                                src="/logo.png"
                            />
                        </div>
                        <div className="space-y-1 text-center lg:text-left">
                            <h1 className="text-3xl lg:text-5xl font-bold tracking-tighter text-[#f8f5fd]">
                                RICH&apos;SE <span className="text-[#ff88b4]">BRAND</span> ★
                            </h1>
                            <p className="text-base lg:text-lg text-[#acaab1] font-light leading-relaxed max-w-md">
                                &apos;ยินดีต้อนรับสู่เบบี้ของริชเช่&apos; พื้นที่นี้เป็นพื้นที่ปลอดภัยสำหรับคุณ🫶🏻
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="glass-tile px-4 py-2 rounded-lg flex flex-col items-center">
                                <span className="text-xl font-bold text-[#ff88b4]">188.4K</span>
                                <span className="text-[0.5rem] uppercase tracking-widest text-[#acaab1]">Followers</span>
                            </div>
                            <div className="glass-tile px-4 py-2 rounded-lg flex flex-col items-center">
                                <span className="text-xl font-bold text-[#ac89ff]">Active</span>
                                <span className="text-[0.5rem] uppercase tracking-widest text-[#acaab1]">Community</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Bento Grid Column */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {/* Highlight Tile: Group Affiliate */}
                        <a
                            className="md:col-span-2 group relative overflow-hidden signature-gradient p-4 md:p-6 rounded-[1rem] flex flex-row md:flex-col items-center md:justify-between min-h-[80px] md:min-h-[160px] active:scale-[0.98] transition-transform gap-3 md:gap-0"
                            href="https://line.me/ti/g2/dQQu0-rhnBQKiAdDn3L02Ro7id7RDruC02Q5NA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="md:absolute top-0 right-0 p-0 md:p-4 opacity-40 md:opacity-20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line Logo" className="w-10 h-10 md:w-24 md:h-24" />
                            </div>
                            <div className="relative z-10 flex-grow">
                                <h2 className="text-lg md:text-3xl font-bold text-[#4b0027] leading-tight">
                                    Group Affiliate Community
                                </h2>
                            </div>
                            <div className="relative z-10 flex items-center justify-between md:w-full">
                                <span className="hidden md:inline-block text-xl font-bold text-[#4b0027]">Com 10-15%</span>
                                <div className="bg-[#4b0027] text-white p-2 md:px-6 md:py-2 rounded-full text-xs md:text-sm flex items-center gap-2 transition-all uppercase font-bold tracking-widest shadow-lg">
                                    <span className="hidden md:inline">Join Now</span> <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line" className="w-3 h-3 md:w-4 md:h-4 brightness-0 invert" />
                                </div>
                            </div>
                        </a>

                        {/* Shopee Tile */}
                        <a
                            className="glass-tile p-4 md:p-6 rounded-[1rem] flex flex-row md:flex-col items-center md:justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98] gap-3"
                            href="https://th.shp.ee/awo2JNVD"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="shrink-0 flex justify-between items-start md:w-full">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center p-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" alt="Shopee Logo" className="h-5 w-auto object-contain" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-base md:text-xl font-bold">Shopee Store</h3>
                                <p className="text-[0.7rem] md:text-sm text-[#acaab1]">Exclusive discounts & deals.</p>
                            </div>
                            <div className="shrink-0 text-[#ff88b4]">
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </div>
                        </a>

                        {/* Line Consult Tile */}
                        <a
                            className="glass-tile p-4 md:p-6 rounded-[1rem] flex flex-row md:flex-col items-center md:justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98] gap-3"
                            href="https://line.me/R/ti/p/@338mcudr?oat_content=url&ts=02170245"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="shrink-0 flex justify-between items-start md:w-full">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center p-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line Logo" className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-base md:text-xl font-bold">Consultation</h3>
                                <p className="text-[0.7rem] md:text-sm text-[#acaab1]">Official Line Support</p>
                            </div>
                            <div className="shrink-0 text-green-500">
                                <span className="material-symbols-outlined text-base">chat</span>
                            </div>
                        </a>

                        {/* Instagram Tile */}
                        <a
                            className="glass-tile p-4 md:p-6 rounded-[1rem] flex flex-row md:flex-col items-center md:justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98] gap-3"
                            href="https://www.instagram.com/richse_official/?utm_source=ig_embed&ig_rid=866aee39-6af1-4bd0-9f3d-6504b9238b17"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="shrink-0 flex justify-between items-start md:w-full">
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center p-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram Logo" className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-base md:text-xl font-bold">Instagram</h3>
                                <p className="text-[0.7rem] md:text-sm text-[#acaab1]">Updates & Lifestyle</p>
                            </div>
                            <div className="shrink-0 text-[#ac89ff]">
                                <span className="material-symbols-outlined text-base">grid_view</span>
                            </div>
                        </a>

                        {/* Facebook Tile */}
                        <a
                            className="glass-tile p-4 md:p-6 rounded-[1rem] flex flex-row md:flex-col items-center md:justify-between hover:bg-[#25252c] transition-all group border border-[#48474d]/10 active:scale-[0.98] gap-3"
                            href="https://www.facebook.com/chnay.chi.ta.ra.ni.nakh.ratn.siri.kul/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="shrink-0 flex justify-between items-start md:w-full">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center p-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook Logo" className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-base md:text-xl font-bold">Facebook</h3>
                                <p className="text-[0.7rem] md:text-sm text-[#acaab1]">Official Brand Page</p>
                            </div>
                            <div className="shrink-0 text-blue-400">
                                <span className="material-symbols-outlined text-base">thumb_up</span>
                            </div>
                        </a>

                        {/* Primary Tile: Official Website (Moved to Bottom) */}
                        <Link
                            className="md:col-span-2 group relative overflow-hidden bg-white text-[#0e0e13] p-4 md:p-5 rounded-[1rem] flex flex-row md:flex-col items-center md:justify-between min-h-[70px] md:min-h-[120px] active:scale-[0.98] transition-transform hover:bg-[#ff88b4] hover:text-[#4b0027] gap-3 md:gap-0"
                            href="/"
                        >
                            <div className="md:absolute top-0 right-0 p-0 md:p-3 opacity-20 md:opacity-10 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                <img src="/logo.png" alt="Richse Logo" className="w-10 h-10 md:w-24 md:h-24" />
                            </div>
                            <div className="relative z-10 flex-grow">
                                <h2 className="text-lg md:text-3xl font-bold leading-tight">Official Website</h2>
                            </div>
                            <div className="relative z-10 flex items-center justify-between md:mt-2">
                                <p className="hidden md:block text-[0.7rem] md:text-sm opacity-80 font-medium">Shop our full collection & offers.</p>
                                <div className="bg-[#0e0e13] text-white p-2 md:px-6 md:py-2 rounded-full text-xs md:text-sm flex items-center gap-2 transition-all font-bold shadow-lg">
                                    <span className="hidden md:inline">Visit Now</span> <span className="material-symbols-outlined text-sm md:text-base">open_in_new</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Context Banner */}
                <div className="mt-4 glass-tile rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-center text-center overflow-hidden relative border border-[#48474d]/5">
                    <div className="absolute left-0 top-0 w-1/3 h-full bg-[#ff88b4]/5 blur-3xl rounded-full"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl lg:text-2xl font-bold mb-1 tracking-tight">
                            สัมผัสประสบการณ์ช้อปปิ้งระดับพรีเมียม
                        </h2>
                        <p className="text-[#acaab1] text-sm md:text-base">
                            พบกับสินค้าราคาพิเศษ พร้อมโปรโมชั่นเฉพาะที่เว็บไซต์ทางการของ RICH&apos;SE เท่านั้น
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full flex flex-col items-center justify-center gap-2 px-8 bg-black py-4">
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