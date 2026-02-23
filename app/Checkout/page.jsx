/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function page() {
  return (
  <div className="bg-[#B76E79]/9">

      <Navbar />
      
<main className="max-w-6xl mx-auto px-8 py-12 md:py-24">

<div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
<div className="lg:col-span-7 space-y-20">
<section>
<h2 className="font-display text-2xl font-light mb-12 tracking-wide">Shipping Details</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
<div className="md:col-span-2">
<label className="input-label">Full Name</label>
<div className="md:col-span-2">
  <label className="input-label">Full Name</label>
  <input
    className="elegant-underline"
    type="text"
    defaultValue="Eleanor Thorne"
  />
</div>

<div className="md:col-span-2">
  <label className="input-label">Address</label>
  <input
    className="elegant-underline"
    type="text"
    defaultValue="742 Luxury Lane, Suite 402"
  />
</div>

<div>
  <label className="input-label">City</label>
  <input
    className="elegant-underline"
    type="text"
    defaultValue="Beverly Hills"
  />
</div>

<div>
  <label className="input-label">Zip Code</label>
  <input
    className="elegant-underline"
    type="text"
    defaultValue="90210"
  />
</div>

<div>
  <label className="input-label">Country</label>
  <input
    className="elegant-underline"
    type="text"
    defaultValue="United States"
  />
</div>

<div>
  <label className="input-label">Phone</label>
  <input
    className="elegant-underline"
    type="tel"
    defaultValue="+1 (555) 892-0431"
  />
</div>

<div className="md:col-span-2">
<label className="input-label">Special Instructions</label>
<textarea className="elegant-underline h-12 resize-none pt-2" placeholder="Note to store..."></textarea>
</div>
</div>
</div>
</section>

<section>
<h2 className="font-display text-2xl font-light mb-8 tracking-wide">Delivery Method</h2>
<div className="flex items-center justify-between py-6 border-b border-rose-gold/10">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-rose-gold text-lg">storm</span>
<span className="text-sm font-light tracking-wide italic">Signature Ritual Delivery (2-3 Days)</span>
</div>
<span className="text-[10px] uppercase tracking-widest text-rose-gold-dark font-semibold">Complimentary</span>
</div>
</section>
<section>
<h2 className="font-display text-2xl font-light mb-4 tracking-wide">Payment Method</h2>
<div className="">
<div className="payment-option active">
<div className="flex items-center gap-6">
<div className="w-10 h-6 bg-text-main/5 flex items-center justify-center text-[8px] text-text-main font-bold tracking-widest border border-text-main/10">VISA</div>
<div className="flex flex-col">
<span className="text-sm font-light">Ending in 4429</span>
<span className="text-[9px] text-text-main/40 uppercase tracking-widest">Expires 12/26</span>
</div>
</div>
<div className="indicator"></div>
</div>
<div className="payment-option">
<div className="flex items-center gap-6">
<div className="w-10 h-6 flex items-center justify-center overflow-hidden grayscale">
<svg className="h-4" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 5h75c2.5 0 4.5 2 4.5 4.5v21c0 2.5-2 4.5-4.5 4.5h-75C10 35 8 33 8 30.5v-21C8 7 10 5 12.5 5z" fill="#003D6B" opacity="0.2"></path>
<path d="M25 10c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5h10c2 0 3.5-1.5 3.5-3.5S37 10 35 10H25z" fill="#003D6B"></path>
<path d="M65 23c2 0 3.5-1.5 3.5-3.5s-1.5-3.5-3.5-3.5h-10c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5h10z" fill="#003D6B"></path>
</svg>
</div>
<div className="flex flex-col">
<span className="text-sm font-light">PromptPay QR Code</span>
<span className="text-[9px] text-text-main/40 uppercase tracking-widest">Instant bank transfer via QR</span>
</div>
</div>
<div className="indicator"></div>
</div>
</div>
</section>
</div>
<div className="lg:col-span-5">
<div className="sticky top-12 space-y-12">
<div className="pb-8">
<h3 className="font-display text-xl font-light mb-10 tracking-wide">Bag Summary</h3>
<div className="space-y-8">
<div className="flex items-start gap-6">
<div className="size-24 bg-white border border-rose-gold/5 overflow-hidden shrink-0">
<img alt="Serum" className="w-full h-full object-cover opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEkbJh8VlLWboC1HOSeXbG2KzmwKvZD7KE590snCZntmm-593HiRwaF44kHPiA20sKMu7OBnHlv530wWFCT2qKe0WVApQSaDK58dPT_TCEOrvFR3ENk2czH_ZL5iz5gmpjd2R0Cnq-iux1GiHFrrWk-gC-ynQtomNgmzM0SCU83de4Q3M7SnGBC4GUdaNJJVMNDXdFCukIQUceWQTe73UbJuSa0RQ4E4ZRNT5h2p_QvNfKr39sfgp9huKcl43GTVbi6ILw4LUCoOQ"/>
</div>
<div className="flex-1">
<h4 className="font-display text-sm font-light tracking-wide text-text-main">Gold Radiance Serum</h4>
<p className="text-[10px] text-text-main/40 uppercase tracking-widest mt-1">30ml / Quantity 1</p>
<p className="text-sm font-light mt-2">$120.00</p>
</div>
</div>
<div className="flex items-start gap-6">
<div className="size-24 bg-white border border-rose-gold/5 overflow-hidden shrink-0">
<img alt="Cream" class="w-full h-full object-cover opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9gK41F_E3KD9aC1-KgzvNdSocELgUPFYmEDXHgvfZ_cBwy1wHh8YOsBDjrUmYLbErezeDaa6cQIsN5BmgWB3CSEWPYNzByAseB-v23CHPZgg_GfezQD3stfC0l8subfh9acMYDmT75w2hTWNs29l5TqlJDCRAwYuKDiqdPepdFz0amF0WdbsaRR70WSNBU3AuaqTkWX5U-zM8oe4hoscUmDZzxLIBnIjC0NMBGfCxtjabNNCC9-djscoZxuE731tFXwhOsec9QFg"/>
</div>
<div className="flex-1">
<h4 className="font-display text-sm font-light tracking-wide text-text-main">Deep Hydration Cream</h4>
<p className="text-[10px] text-text-main/40 uppercase tracking-widest mt-1">50ml / Quantity 1</p>
<p className="text-sm font-light mt-2">$95.00</p>
</div>
</div>
</div>
</div>
<div className="space-y-4 border-t border-rose-gold/10 pt-10">
<div className="flex justify-between text-sm font-light">
<span className="text-text-main/60">Subtotal</span>
<span className="tracking-wider">215.00</span>
</div>
<div className="flex justify-between text-sm font-light">
<span className="text-text-main/60">Shipping</span>
<span className="text-[10px] uppercase tracking-widest text-rose-gold-dark font-medium">Complimentary</span>
</div>
<div className="flex justify-between text-sm font-light">
<span className="text-text-main/60">Taxes</span>
<span className="tracking-wider">18.27</span>
</div>
<div className="flex justify-between text-lg pt-6 border-t border-rose-gold/10">
<span className="font-display font-light tracking-widest uppercase text-sm">Total</span>
<span className="font-display text-xl tracking-tight">$233.27</span>
</div>
</div>
<div className="space-y-6">
<button className="w-full bg-dusty-rose text-white py-5 font-light tracking-[0.2em] uppercase text-xs hover:bg-rose-gold transition-colors">
                        Place Order
                    </button>
<div className="flex flex-col items-center gap-4">
<p className="text-[9px] text-text-main/40 uppercase tracking-[0.2em] text-center">
                            Secure Encrypted Checkout
                        </p>
<p className="text-[9px] uppercase tracking-[0.2em] text-rose-gold-dark/60 font-medium">
                            Need Assistance? <span class="border-b border-rose-gold-dark/30 cursor-pointer">Contact Concierge</span>
</p>
</div>
</div>
</div>
</div>
</div>
</main>
<Footer />
    </div>
  )
}

export default page
