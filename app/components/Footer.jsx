/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Link from 'next/link'

function Footer() {
  return (
    <><div>
         
      <footer className="bg-background-light  py-16 border-t border-[#efecec] ">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                  <div className="col-span-2 md:col-span-1 space-y-6">
                      <a className="flex items-center gap-2" href="#">
                          <div className="h-12 w-10">
 <img src="/logo.png" alt="Logo" className="h-full w-auto"/>
</div>

            <span className="font-display text-2xl font-bold tracking-tight">Richse</span>
                      </a>
                      <p className="text-sm text-gray-500 leading-relaxed">Science-backed luxury for your most luminous skin. Defining the future of premium beauty rituals.</p>
                      <div className="flex gap-4">
                          <a className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="https://www.tiktok.com/@richse.888?_r=1&_t=ZS-94v5EesyoiY" target="_blank" rel="noopener noreferrer" title="TikTok"><span className="material-symbols-outlined notranslate text-sm">video_library</span></a>
                          <a className="size-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all" href="https://www.instagram.com/richse_official?igsh=dmt5Yjc2ZGJudnZk" target="_blank" rel="noopener noreferrer" title="Instagram"><span className="material-symbols-outlined notranslate text-sm">camera</span></a>
                      </div>
                  </div>
                  <div>
                      <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Shop</h4>
                      <ul className="space-y-4 text-sm text-gray-500">
                          <li><a className="hover:text-primary transition-colors" href="#">Best Sellers</a></li>
                          <li><a className="hover:text-primary transition-colors" href="#">New Arrivals</a></li>
                          <li><a className="hover:text-primary transition-colors" href="#">Bundles</a></li>
                          <li><a className="hover:text-primary transition-colors" href="#">Gift Cards</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Support</h4>
                      <ul className="space-y-4 text-sm text-gray-500">
                          <li><a className="hover:text-primary transition-colors" href="#">Track Order</a></li>
                          <li><a className="hover:text-primary transition-colors" href="#">Returns &amp; Exchanges</a></li>
                          <li><a className="hover:text-primary transition-colors" href="#">Shipping Policy</a></li>
                          <li><a className="hover:text-primary transition-colors" href="#">FAQ</a></li>
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Company</h4>
                      <ul className="space-y-4 text-sm text-gray-500">
                          <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                          <li><a className="hover:text-primary transition-colors" href="#">Sustainability</a></li>
                          <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                          <li>
  <Link
    href="/Contact"
    className="transition-colors hover:text-primary"
  >
    Contact
  </Link>
</li>
                      </ul>
                  </div>
              </div>
              <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-200  flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2024 Richse Beauty. All Rights Reserved.</p>
                  <div className="flex gap-6 text-[10px] text-gray-400 uppercase tracking-widest">
                      <a className="hover:text-primary" href="#">Privacy Policy</a>
                      <a className="hover:text-primary" href="#">Terms of Service</a>
                  </div>
              </div>
          </footer>
          
    </div></>
  )
}

export default Footer
