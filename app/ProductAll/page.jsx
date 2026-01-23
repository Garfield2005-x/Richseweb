'use client'

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from 'next/link'

function page() {
  return (
    <div>
       <Navbar />
      
            <main className="max-w-360 mx-auto px-6 md:px-10 py-16 md:py-24">
             <header className="text-center mb-16 md:mb-24">
<h1 className="font-display text-5xl md:text-7xl font-light mb-8 tracking-tight">The Collection</h1>
<nav className="flex flex-wrap justify-center gap-6 md:gap-12">
<button className="text-xs uppercase tracking-[0.2em] font-bold border-b-2 border-[#c3a2ab] pb-1">All</button>
<button className="text-xs uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-[#c3a2ab] transition-colors pb-1">Cleansers</button>
<button className="text-xs uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-[#c3a2ab] transition-colors pb-1">Serums</button>
<button className="text-xs uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-[#c3a2ab] transition-colors pb-1">Moisturizers</button>
</nav>
</header>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-24">
<div className="group cursor-pointer">
<div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-soft-beige mb-6">
<div
  className="absolute inset-0 bg-cover bg-center product-card-image"
  style={{ backgroundImage: "url('/G11.png')" }}
/>

<button className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-md text-[#161314] py-4 rounded-xl font-bold text-sm tracking-widest uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl z-10">
                    Quick Add
                </button>
</div>
<div className="space-y-1 px-1">
<h3 className="font-display text-xl font-bold">Gold Radiance Serum</h3>
<p className="text-sm text-gray-500 font-light">Intensive brightening &amp; clinical lift</p>
<p className="text-lg font-medium text-[#c3a2ab] mt-3">$120.00 USD</p>
</div>
</div>
<div className="group cursor-pointer">
<div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-soft-pink mb-6">
<div
  className="absolute inset-0 bg-cover bg-center product-card-image"
  style={{ backgroundImage: "url('/G12.png')" }}
/>

<button className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-md text-[#161314] py-4 rounded-xl font-bold text-sm tracking-widest uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl z-10">
                    Quick Add
                </button>
</div>
<div className="space-y-1 px-1">
<h3 className="font-display text-xl font-bold">Deep Hydration Cream</h3>
<p className="text-sm text-gray-500 font-light">24-hour moisture lock with ceramides</p>
<p className="text-lg font-medium text-[#c3a2ab] mt-3">$95.00 USD</p>
</div>
</div>
<div className="group cursor-pointer">
<div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-soft-beige mb-6">
<div
  className="absolute inset-0 bg-cover bg-center product-card-image"
  style={{ backgroundImage: "url('/G13.png')" }}
/>

<div className="absolute top-4 left-4 bg-[#c3a2ab] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider z-10">Limited</div>
<Link
  href="/Product"
  className="absolute inset-x-4 bottom-4
             block text-center
             bg-white/90 backdrop-blur-md
             text-[#161314]
             py-4 rounded-xl
             font-bold text-sm tracking-widest uppercase
             opacity-0 translate-y-4
             group-hover:opacity-100 group-hover:translate-y-0
             transition-all duration-500
             shadow-xl z-10"
>
  Quick Add
</Link>
</div>
<div className="space-y-1 px-1">
<h3 className="font-display text-xl font-bold">Night Repair Oil</h3>
<p className="text-sm text-gray-500 font-light">Overnight cellular renewal formula</p>
<p className="text-lg font-medium text-[#c3a2ab] mt-3">$110.00 USD</p>
</div>
</div>
<div className="group cursor-pointer">
<div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-soft-pink mb-6">
<div
  className="absolute inset-0 bg-cover bg-center product-card-image"
  style={{ backgroundImage: "url('/G14.png')" }}
/>

<button className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-md text-[#161314] py-4 rounded-xl font-bold text-sm tracking-widest uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl z-10">
                    Quick Add
                </button>
</div>
<div className="space-y-1 px-1">
<h3 className="font-display text-xl font-bold">Gentle Cleanser</h3>
<p className="text-sm text-gray-500 font-light">pH-balanced purity for sensitive skin</p>
<p className="text-lg font-medium text-[#c3a2ab] mt-3">$65.00 USD</p>
</div>
</div>
<div className="group cursor-pointer">
<div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-soft-beige mb-6">
<div
  className="absolute inset-0 bg-cover bg-center product-card-image"
  style={{ backgroundImage: "url('/G11.png')" }}
/>

<button className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-md text-[#161314] py-4 rounded-xl font-bold text-sm tracking-widest uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl z-10">
                    Quick Add
                </button>
</div>
<div className="space-y-1 px-1">
<h3 className="font-display text-xl font-bold">L éclat Essence</h3>
<p className="text-sm text-gray-500 font-light">Hydrating prep for peak absorption</p>
<p className="text-lg font-medium text-[#c3a2ab] mt-3">$88.00 USD</p>
</div>
</div>
<div className="group cursor-pointer">
<div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-soft-pink mb-6">
<div
  className="absolute inset-0 bg-cover bg-center product-card-image"
  style={{ backgroundImage: "url('/G12.png')" }}
/>

<button className="absolute inset-x-4 bottom-4 bg-white/90 backdrop-blur-md text-[#161314] py-4 rounded-xl font-bold text-sm tracking-widest uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl z-10">
                    Quick Add
                </button>
</div>
<div className="space-y-1 px-1">
<h3 className="font-display text-xl font-bold">Restorative Balm</h3>
<p className="text-sm text-gray-500 font-light">Targeted repair for delicate areas</p>
<p className="text-lg font-medium text-[#c3a2ab] mt-3">$72.00 USD</p>
</div>
</div>
</div>
<div className="py-24 text-center">
<p className="text-xs uppercase tracking-[0.4em] text-gray-400">Discover your ritual</p>
</div>
</main>

        <Footer />
    </div>
  )
}

export default page
