'use client'

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from 'next/link'



function page() {
  return (
<div className="bg-[#fcfaf8]">

       <Navbar />

<header className="mb-24 text-center">
<div className="mb-12 flex justify-center">
<div className="w-12 h-12 text-primary opacity-80">

<div className="mt-2 mb-12 flex justify-center items-center">
 
</div>
</div>
</div>
<h1 className="font-serif text-3xl md:text-5xl font-light tracking-tight mb-4">The Social Hub</h1>
<p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.4em] opacity-40">Richse Digital Presence</p>
</header>
<main className="w-full max-w-5xl  mx-auto">
<div className="grid grid-cols-1 md:grid-cols-3 border-t opacity-70">
<a className="social-link border-b border-rich-black/5 md:border-r" href="#">
<span className="material-symbols-outlined font-light">chat_bubble</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">Line Official</span>
</a>
<a className="social-link border-b border-rich-black/5 md:border-r" href="#">
<span className="material-symbols-outlined">camera</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">Instagram</span>
</a>
<a className="social-link border-b border-rich-black/5" href="#">
<span className="material-symbols-outlined">forum</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">Messenger</span>
</a>
<a className="social-link border-b border-rich-black/5 md:border-r" href="#">
<span className="material-symbols-outlined">call</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">WhatsApp</span>
</a>
<a className="social-link border-b border-rich-black/5 md:border-r" href="#">
<span className="material-symbols-outlined">brand_awareness</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">TikTok</span>
</a>
<a className="social-link border-b border-rich-black/5" href="#">
<span className="material-symbols-outlined">play_circle</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">YouTube</span>
</a>
<a className="social-link border-b border-rich-black/5 md:border-r md:border-b-0" href="#">
<span className="material-symbols-outlined">grid_view</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">Pinterest</span>
</a>
<a className="social-link border-b border-rich-black/5 md:border-r md:border-b-0" href="#">
<span className="material-symbols-outlined">close</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">X (Twitter)</span>
</a>
<a className="social-link border-b border-rich-black/5 md:border-b-0" href="#">
<span className="material-symbols-outlined">mail</span>
<span className="font-serif text-lg md:text-xl font-light tracking-wide">Email Support</span>
</a>
</div>
</main>
<div className="mt-24 flex justify-center">
  <p className="font-serif italic text-rich-black/30 text-sm">
    Experience Radiance
  </p>
</div>


        <Footer />
    </div>
  )
}

export default page
