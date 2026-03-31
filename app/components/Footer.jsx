/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Link from 'next/link'

function Footer() {
  return (
    <><div>
         
      <footer className="bg-white py-16 border-t border-[#efecec]">
              <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
                  <div className="max-w-sm space-y-6">
                      <Link className="flex items-center gap-2" href="/">
                          <div className="h-12 w-10">
                            <img src="/logo.png" alt="Logo" className="h-full w-auto"/>
                          </div>
                          <span className="font-display text-2xl font-bold tracking-tight text-[#161314]">Richse</span>
                      </Link>
                      <p className="text-[18px] text-gray-500 leading-relaxed">Science-backed luxury for your most luminous skin. Defining the future of premium beauty rituals.</p>
                      <div className="flex gap-4">
                          <a className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#c3a2ab] hover:border-[#c3a2ab] hover:text-white transition-all text-gray-500" href="https://www.tiktok.com/@richse.888?_r=1&_t=ZS-94v5EesyoiY" target="_blank" rel="noopener noreferrer" title="TikTok"><span className="material-symbols-outlined notranslate text-sm">video_library</span></a>
                          <a className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#c3a2ab] hover:border-[#c3a2ab] hover:text-white transition-all text-gray-500" href="https://www.instagram.com/richse_official?igsh=dmt5Yjc2ZGJudnZk" target="_blank" rel="noopener noreferrer" title="Instagram"><span className="material-symbols-outlined notranslate text-sm">camera</span></a>
                      </div>
                  </div>
                  <div className="flex gap-16 md:gap-24">
                      <div>
                          <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-[#161314]">Shop</h4>
                          <ul className="space-y-4 text-[17px] text-gray-500">
                              <li><Link className="hover:text-[#c3a2ab] transition-colors" href="/ProductAll">All Products</Link></li>
                              <li><Link className="hover:text-[#c3a2ab] transition-colors" href="/skin-quiz">Skin Quiz</Link></li>
                              <li><Link className="hover:text-[#c3a2ab] transition-colors" href="/rewards">Rewards &amp; Points</Link></li>
                          </ul>
                      </div>
                      <div>
                          <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-[#161314]">Support</h4>
                          <ul className="space-y-4 text-[17px] text-gray-500">
                              <li><Link className="hover:text-[#c3a2ab] transition-colors" href="/account">My Account</Link></li>
                              <li><Link className="hover:text-[#c3a2ab] transition-colors" href="/Contact">Contact Us</Link></li>
                          </ul>
                      </div>
                  </div>
              </div>
              <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-[14px] text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} Richse Beauty. All Rights Reserved.</p>
                  <div className="flex gap-6 text-[14px] text-gray-400 uppercase tracking-widest">
                      <Link className="hover:text-[#c3a2ab]" href="/Contact">Privacy Policy</Link>
                      <Link className="hover:text-[#c3a2ab]" href="/Contact">Terms of Service</Link>
                  </div>
              </div>
          </footer>
          
    </div></>
  )
}

export default Footer
