/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Link from 'next/link'

function Footer() {
  return (
    <><div>
         
      <footer className="bg-[#010000] py-20 border-t border-white/5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F07098]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-16 relative z-10">
          <div className="max-w-sm space-y-8">
            <Link className="flex items-center gap-4 group" href="/">
              <div className="h-14 w-12 transition-transform duration-500 group-hover:scale-110">
                <img src="/logo.png" alt="Logo" className="h-full w-auto brightness-0 invert opacity-90"/>
              </div>
              <span className="font-display text-3xl font-bold tracking-tighter text-white">Richse<span className="text-[#F07098]">.</span></span>
            </Link>
            <p className="text-[18px] text-[#F8E1EB]/60 leading-relaxed font-light">Science-backed luxury for your most luminous skin. Defining the future of premium beauty rituals with clinical precision. ✨</p>
            <div className="flex gap-4">
              <a className="size-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#F07098] hover:border-[#F07098] hover:text-white transition-all text-[#F8E1EB]/40" href="https://www.tiktok.com/@richse.888?_r=1&_t=ZS-94v5EesyoiY" target="_blank" rel="noopener noreferrer" title="TikTok"><span className="material-symbols-outlined notranslate text-lg">video_library</span></a>
              <a className="size-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#F07098] hover:border-[#F07098] hover:text-white transition-all text-[#F8E1EB]/40" href="https://www.instagram.com/richse_official?igsh=dmt5Yjc2ZGJudnZk" target="_blank" rel="noopener noreferrer" title="Instagram"><span className="material-symbols-outlined notranslate text-lg">camera</span></a>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-16 md:gap-32">
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.3em] mb-8 text-white/40">Shop Elite</h4>
              <ul className="space-y-5 text-[17px] text-[#F8E1EB]/70">
                <li><Link className="hover:text-[#F07098] transition-colors" href="/ProductAll">The Collection</Link></li>
                <li><Link className="hover:text-[#F07098] transition-colors" href="/skin-quiz">Skin Ritual Quiz</Link></li>
                <li><Link className="hover:text-[#F07098] transition-colors" href="/rewards">Club Rewards</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-[0.3em] mb-8 text-white/40">Maison Richse</h4>
              <ul className="space-y-5 text-[17px] text-[#F8E1EB]/70">
                <li><Link className="hover:text-[#F07098] transition-colors" href="/account">My Registry</Link></li>
                <li><Link className="hover:text-[#F07098] transition-colors" href="/Contact">Concierge</Link></li>
                <li><Link className="hover:text-[#F07098] transition-colors" href="/Contact">Our Story</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <p className="text-[12px] text-white/30 uppercase tracking-[0.3em] font-medium">© {new Date().getFullYear()} Richse Maison. All Rights Reserved.</p>
          <div className="flex gap-8 text-[12px] text-white/30 uppercase tracking-[0.3em] font-medium">
            <Link className="hover:text-[#F07098] transition-colors" href="/Contact">Privacy</Link>
            <Link className="hover:text-[#F07098] transition-colors" href="/Contact">Terms</Link>
          </div>
        </div>
      </footer>
          
    </div></>
  )
}

export default Footer
