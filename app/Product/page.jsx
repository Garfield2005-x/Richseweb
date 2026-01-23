
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from 'next/link'

function page() {
  return (
    <div>
      <title>Richse | Lumière Regenerating Serum</title>
 <Navbar />

    <main className="max-w-360 mx-auto px-6 lg:px-12 py-12 md:py-20">


<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start landing-section">
<div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
<div className="flex-1 bg-white dark:bg-gray-900 rounded-xl overflow-hidden aspect-4/5 relative group cursor-zoom-in border border-gray-100 dark:border-gray-800 shadow-sm">
  <div
    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
    data-alt="Premium glass bottle of Lumiere serum on a marble surface"
    style={{
      backgroundImage:
        "url('/G13.png')",
    }}
  />
</div>

<div className="flex md:flex-col gap-3 overflow-x-auto no-scrollbar">
  <div className="size-20 md:size-24 shrink-0 rounded-lg border-2 border-[#c3a2ab] overflow-hidden cursor-pointer">
    <div
      className="w-full h-full bg-cover bg-center"
      data-alt="Close up of serum texture"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB2bscotRIKSrS69HYmFrXnBT3c-BU0pKVFHHjIR04ZqvKFjQTRym8Hx4CZIwlFGa0g5p8jYGY8_MWb29V3JHFsotFifgt_2Jzi8V7ZtdVqpBhuOO1GE7R7uKGZkeDNwQEQZz4nbcJYYBF-XWcZ3Ww3ZaddTJe8EM9w5Iy2yTCI8Z_V-GdEQ53gdch_onVjRBAeU6o66-pCM9X7jyiWsSBUq-aOOY6z38MLuxgqM1v_oU1iGNolOuEQkUx-DZmlwWn-oK7zkk6c1uU')",
      }}
    />
  </div>

  <div className="size-20 md:size-24 shrink-0 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:border-primary transition-colors">
    <div
      className="w-full h-full bg-cover bg-center"
      data-alt="Model applying serum to cheek"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPu3a6Vc8bs4XOQ68XBZLNmB4q9T7VhrPvj_3jArP7T6T7oWXrkWI8LdqJc-cCpCOvrdVuorqsRHvAYKMt8yLfFOG6eWgU947pKdRj6VGPEQJmqKQiKLmVrQSpUYFdDkGtlmJy5KkFe_dir6LBgtvuq_NRLZxUVcnJBCeRkFBptvMPMgIe_TxrSPJ5M4UpWwcnUHw9kPmU7yEWbI-SNFsCBW6IJVWChJsK3J-qZAW93nvkp0Ca7Gdrt4EOzHpdzq_JEVYwA2Vd6XA')",
      }}
    />
  </div>

  <div className="size-20 md:size-24 shrink-0 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:border-primary transition-colors">
    <div
      className="w-full h-full bg-cover bg-center"
      data-alt="Serum ingredients spread out"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACNhDN4pXva7qRXx3wRqagcJOsMkxiwNS78CVYbWHoLVQqtv0LZOETFfp2zQbx4b3XvLsz9rkBDPGgEkPzYqynSAUL32CNxE2wKbiMU1qt6W0a9VZ42uZGjG_xOk13hV4m5KT3mjrkqJKM6fMKFCMW1epsCD35BLOOyMan_8vc4rhvkk5qjKBLsSZ2DBaqSBedQibVgSlFrucCFpPw522EBkvPwiPjuicmwL0yEZThKMlO_yeLPqkRmSWFRKtG3KbWoIJrheb1K5Y')",
      }}
    />
  </div>
</div>

</div>
<div className="lg:col-span-5 sticky top-12">
<div className="flex flex-col gap-6">
<div>
<span className="text-xs uppercase tracking-[0.2em] text-[#c3a2ab] font-bold mb-3 block">The Radiance Collection</span>
<h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#161314] dark:text-white leading-tight mb-4">Lumière Regenerating Serum</h2>
<div className="flex items-center gap-4">
<div className="flex items-center text-[#C9A961]">
<span className="material-symbols-outlined fill-1">star</span>
<span className="material-symbols-outlined fill-1">star</span>
<span className="material-symbols-outlined fill-1">star</span>
<span className="material-symbols-outlined fill-1">star</span>
<span className="material-symbols-outlined">star_half</span>
<span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-sans">4.9 (124 reviews)</span>
</div>
</div>
</div>
<div className="flex items-baseline gap-4">
<span className="text-3xl font-light text-[#161314] dark:text-white">$145.00</span>
<span className="text-sm text-gray-500 dark:text-gray-400">50ml / 1.7 fl. oz.</span>
</div>
<p className="text-gray-600 dark:text-gray-400 leading-relaxed font-sans text-lg">
                    A transformational serum infused with stabilized vitamin C and botanical peptides. Designed to restore elasticity  brighten complexion, and deliver a lit-from-within glow in just 7 days.
                </p>
<div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
<div className="flex items-center gap-4">
<div className="flex-1 flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
<button className="material-symbols-outlined text-sm">remove</button>
<span className="font-medium">1</span>
<button className="material-symbols-outlined text-sm">add</button>
</div>
<button className="flex-3 bg-[#c3a2ab] hover:bg-[#c3a2ab]/90 text-white font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 uppercase tracking-widest text-sm">
                            Add to Cart
                        </button>
</div>
<button className="w-full border-2 border-[#161314] dark:border-white text-[#161314] dark:text-white font-bold py-4 rounded-lg hover:bg-[#161314] hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-widest text-sm">
                        Buy It Now
                    </button>
</div>
<div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
<div className="flex flex-col items-center text-center gap-2">
<span className="material-symbols-outlined text-[#C9A961] text-3xl">local_shipping</span>
<span className="text-[10px] uppercase font-bold tracking-tighter">Free Priority Shipping</span>
</div>
<div className="flex flex-col items-center text-center gap-2">
<span className="material-symbols-outlined text-[#C9A961] text-3xl">eco</span>
<span className="text-[10px] uppercase font-bold tracking-tighter">Cruelty-Free</span>
</div>
<div className="flex flex-col items-center text-center gap-2">
<span className="material-symbols-outlined text-[#C9A961] text-3xl">verified_user</span>
<span className="text-[10px] uppercase font-bold tracking-tighter">100% Vegan</span>
</div>
</div>
</div>
</div>
</div>

<div className="mt-32 space-y-32">
<section className="landing-section">
<div className="text-center mb-16">
<span className="text-xs uppercase tracking-[0.2em] text-[#c3a2ab] font-bold mb-3 block">Purity &amp; Science</span>
<h3 className="text-4xl font-display mb-4">Luminous Ingredients</h3>
<p className="text-gray-500 max-w-lg mx-auto">Sourced from the heart of the French Alps, refined with modern science to ensure visible results without irritation.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
<div className="bg-white dark:bg-gray-900 p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all duration-500">
<div className="size-20 bg-[#c3a2ab]/10 rounded-full flex items-center justify-center mx-auto mb-8">
<span className="material-symbols-outlined text-[#c3a2ab] text-4xl">water_drop</span>
</div>
<h4 className="font-display text-2xl mb-4">Hyaluronic Acid</h4>
<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Triple-weight molecule technology for intense hydration across all skin layers, plumping from within.</p>
</div>
<div className="bg-white dark:bg-gray-900 p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all duration-500">
<div className="size-20 bg-[#c3a2ab]/10 rounded-full flex items-center justify-center mx-auto mb-8">
<span className="material-symbols-outlined text-[#c3a2ab] text-4xl">shutter_speed</span>
</div>
<h4 className="font-display text-2xl mb-4">Retinol-Gold Complex</h4>
<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Time-released vitamin A wrapped in gold micro-particles to minimize irritation while maximizing cell turnover.</p>
</div>
<div className="bg-white dark:bg-gray-900 p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all duration-500">
<div className="size-20 bg-[#c3a2ab]/10 rounded-full flex items-center justify-center mx-auto mb-8">
<span className="material-symbols-outlined text-primary text-4xl">psychology_alt</span>
</div>
<h4 className="font-display text-2xl mb-4">Niacinamide B3</h4>
<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Highly concentrated vitamin B3 to visibly reduce pores, even skin tone, and strengthen the barrier.</p>
</div>
</div>
</section>
<section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-[#fdf2f4] dark:bg-primary/5 rounded-[3rem] p-12 lg:p-24 overflow-hidden relative landing-section">
<div className="relative z-10">
<span className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 block">Application</span>
<h3 className="text-4xl font-display mb-10">The Daily Ritual</h3>
<div className="space-y-10">
<div className="flex gap-8 items-start">
<span className="text-5xl font-display text-primary/20 leading-none">01</span>
<div>
<h5 className="font-bold text-lg mb-2">Cleanse</h5>
<p className="text-gray-600 dark:text-gray-400">Prepare your canvas with the Richse Gentle Cleansing Milk to ensure maximum absorption of active ingredients.</p>
</div>
</div>
<div className="flex gap-8 items-start">
<span className="text-5xl font-display text-primary/20 leading-none">02</span>
<div>
<h5 className="font-bold text-lg mb-2">Apply</h5>
<p className="text-gray-600 dark:text-gray-400">Gently press 2-3 drops into face and neck while skin is slightly damp. Focus on areas with fine lines.</p>
</div>
</div>
<div className="flex gap-8 items-start">
<span className="text-5xl font-display text-primary/20 leading-none">03</span>
<div>
<h5 className="font-bold text-lg mb-2">Massage</h5>
<p className="text-gray-600 dark:text-gray-400">Use upward, outward motions until fully absorbed. Follow with moisturizer to lock in the transformation.</p>
</div>
</div>
</div>
</div>
<div
  className="aspect-square bg-cover bg-center rounded-2xl shadow-2xl rotate-2 border-12 border-white dark:border-gray-800"
  data-alt="Close up of serum being massaged into skin"
  style={{
    backgroundImage:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCoRUddNASEYEYeCM3lxd_TgP7r3yuKZ4a9XpwkqwoF3YsLcrqY1N-IVB_FsaX7_W_7hVObZ74jUDYLf3Bg-RbTf4Ac2ZIYh2Pxka9lcitvfJlfhfqPXZyCg8aoGrNlXOjM7gqX5FxBqcFp5-MY_LXWZ_QdP8D--SqqKy0P-ucfYb4fVXo_cUoXJghEkLhITSMryHLHXYTThumSkmya7To-y5iba4GYye9vuijR7-Xvz0w8JRF8-2paJwG6VKmoxP4Fd8XMdW0MFhA')",
  }}
/>

</section>
<section className="landing-section">
<div className="flex flex-col lg:flex-row gap-16 p-12 lg:p-16 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-primary/5">
<div className="flex flex-col gap-6 lg:w-1/3">
<h3 className="text-4xl font-display">Customer Praise</h3>
<div className="space-y-1">
<p className="text-7xl font-display font-bold text-[#c3a2ab]">4.9</p>
<div className="flex gap-1 text-[#C9A961]">
<span className="material-symbols-outlined fill-1 text-2xl">star</span>
<span className="material-symbols-outlined fill-1 text-2xl">star</span>
<span className="material-symbols-outlined fill-1 text-2xl">star</span>
<span className="material-symbols-outlined fill-1 text-2xl">star</span>
<span className="material-symbols-outlined fill-1 text-2xl">star</span>
</div>
<p className="text-sm text-gray-500">Based on 124 verified purchasers</p>
</div>
</div>
<div className="flex-1 flex flex-col justify-center space-y-6">
<div className="grid grid-cols-[30px_1fr_45px] items-center gap-6">
<span className="text-sm font-bold">5</span>
<div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
<div
  className="h-full bg-[#c3a2ab]"
  style={{ width: '87%' }}
/>

</div>
<span className="text-sm text-gray-500 font-medium">87%</span>
</div>
<div className="grid grid-cols-[30px_1fr_45px] items-center gap-6">
<span className="text-sm font-bold">4</span>
<div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
<div
  className="h-full bg-[#c3a2ab]"
  style={{ width: '10%' }}
/>

</div>
<span className="text-sm text-gray-500 font-medium">10%</span>
</div>
<div className="grid grid-cols-[30px_1fr_45px] items-center gap-6">
<span className="text-sm font-bold">3</span>
<div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
<div
  className="h-full bg-[#c3a2ab]"
  style={{ width: '2%' }}
/>

</div>
<span className="text-sm text-gray-500 font-medium">2%</span>
</div>
<div className="grid grid-cols-[30px_1fr_45px] items-center gap-6">
<span className="text-sm font-bold">2</span>
<div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
<div
  className="h-full bg-[#c3a2ab]"
  style={{ width: '1%' }}
/>

</div>
<span className="text-sm text-gray-500 font-medium">1%</span>
</div>
<div className="grid grid-cols-[30px_1fr_45px] items-center gap-6">
<span className="text-sm font-bold">1</span>
<div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
<div
  className="h-full bg-[#c3a2ab]"
  style={{ width: '0%' }}
/>

</div>
<span className="text-sm text-gray-500 font-medium">0%</span>
</div>
</div>
</div>
</section>
<section className="landing-section">
<div className="flex justify-between items-end mb-12">
<h3 className="text-3xl font-display">Complete Your Regimen</h3>
<a className="text-sm font-bold border-b-2 border-[#c3a2ab] text-[#c3a2ab] pb-1 tracking-widest uppercase" href="#">Explore More</a>
</div>
<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
<div className="group cursor-pointer">
<div className="aspect-3/4 bg-white dark:bg-gray-800 rounded-xl overflow-hidden mb-6 relative shadow-sm transition-shadow group-hover:shadow-md">
<div
  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
  data-alt="Milk Cleanser bottle"
  style={{
    backgroundImage:
      "url('/G11.png')",
  }}
/>

</div>
<h4 className="font-display text-xl mb-1">Velvet Cleansing Milk</h4>
<p className="text-gray-500 text-sm">$45.00</p>
</div>
<div className="group cursor-pointer">
<div className="aspect-3/4 bg-white dark:bg-gray-800 rounded-xl overflow-hidden mb-6 relative shadow-sm transition-shadow group-hover:shadow-md">
<div
  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
  data-alt="Luxury Eye Cream jar"
  style={{
    backgroundImage:
      "url('/G12.png')",
  }}
/>

</div>
<h4 className="font-display text-xl mb-1">Eclat Eye Contour</h4>
<p className="text-gray-500 text-sm">$85.00</p>
</div>
<div className="group cursor-pointer">
<div className="aspect-3/4 bg-white dark:bg-gray-800 rounded-xl overflow-hidden mb-6 relative shadow-sm transition-shadow group-hover:shadow-md">
<div
  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
  data-alt="Luxury Eye Cream jar"
  style={{
    backgroundImage:
      "url('/G14.png')",
  }}
/>

</div>
<h4 className="font-display text-xl mb-1">Midnight Renewal Cream</h4>
<p className="text-gray-500 text-sm">$120.00</p>
</div>
<div className="group cursor-pointer">
<div className="aspect-3/4 bg-white dark:bg-gray-800 rounded-xl overflow-hidden mb-6 relative shadow-sm transition-shadow group-hover:shadow-md">
<div
  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
  data-alt="Luxury Eye Cream jar"
  style={{
    backgroundImage:
      "url('/G13.png')",
  }}
/>

</div>
<h4 className="font-display text-xl mb-1">Rosewater Glace Mist</h4>
<p className="text-gray-500 text-sm">$35.00</p>
</div>
</div>
</section>
</div>

</main>

     <Footer />
    </div>
  )
}

export default page
