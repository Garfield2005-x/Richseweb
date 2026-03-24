'use client'

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from 'next/link';
import CountdownTimer from "../components/CountdownTimer";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function Page() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    if (session) {
      fetchWishlist();
    }
  }, [session]);

  async function fetchWishlist() {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.map(item => item.productId));
      }
    } catch (e) { console.error(e); }
  }

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to save items");
      return;
    }
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const { wishlisted } = await res.json();
        if (wishlisted) {
          setWishlist([...wishlist, productId]);
          toast.success("Added to wishlist");
        } else {
          setWishlist(wishlist.filter(id => id !== productId));
          toast.success("Removed from wishlist");
        }
      }
    } catch {
      toast.error("Error updating wishlist");
    }
  };
  return (
    <div>
       <Navbar />
      
            <main className="max-w-360 mx-auto px-6 md:px-10 pt-32 pb-16 md:pt-40 md:pb-24">
             <header className="text-center mb-16 md:mb-24">
<h1 className="font-display text-5xl md:text-7xl font-light mb-8 tracking-tight">The Collection</h1>
{/* <nav className="flex flex-wrap justify-center gap-6 md:gap-12">
<button className="text-xs uppercase tracking-[0.2em] font-bold border-b-2 border-[#c3a2ab] pb-1">All</button>
<button className="text-xs uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-[#c3a2ab] transition-colors pb-1">Cleansers</button>
<button className="text-xs uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-[#c3a2ab] transition-colors pb-1">Serums</button>
<button className="text-xs uppercase tracking-[0.2em] font-medium text-gray-400 hover:text-[#c3a2ab] transition-colors pb-1">Moisturizers</button>
</nav> */}
</header>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-24">
  {loading ? (
    <div className="col-span-full py-20 text-center text-gray-500 tracking-widest uppercase">
      Loading Collection...
    </div>
  ) : products.length > 0 ? (
    products.map(product => (
      <div key={product.id} className="group cursor-pointer">
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-soft-beige mb-6">
          <Link
            href={`/product/${product.id}`}
            className="absolute inset-0 bg-cover bg-center product-card-image"
            style={{ backgroundImage: `url('${product.image || "/G11.png"}')` }}
          />
          {product.id === 3 && ( // Using same logic as before, just an example decoration
            <div className="absolute top-4 left-4 bg-[#c3a2ab] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider z-10">Limited</div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-4 left-4 bg-gray-900/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider z-10">
              Out of Stock
            </div>
          )}
          <button
            onClick={(e) => toggleWishlist(e, product.id)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/50 hover:bg-white backdrop-blur-sm transition-colors"
          >
            <span className={`material-symbols-outlined text-[20px] ${wishlist.includes(product.id) ? "text-red-500 fill-red-500" : "text-gray-600"}`} style={{ fontVariationSettings: wishlist.includes(product.id) ? "'FILL' 1" : "'FILL' 0" }}>
              favorite
            </span>
          </button>
          <Link
            href={`/product/${product.id}`}
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
            View Details
          </Link>
        </div>
        <div className="space-y-1 px-1">
          <h3 className="font-display text-xl font-bold">{product.name}</h3>
          <p className="text-sm text-gray-500 font-light truncate">{product.description}</p>
          <div className="mt-3">
            {product.flashSalePrice && product.flashSaleStart && product.flashSaleEnd && new Date() >= new Date(product.flashSaleStart) && new Date() <= new Date(product.flashSaleEnd) ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600 text-xl">
                    ฿{product.flashSalePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-gray-400 line-through text-sm font-medium">
                    ฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <CountdownTimer targetDate={product.flashSaleEnd} />
              </div>
            ) : (
              <p className="text-lg font-medium text-[#c3a2ab]">
                ฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full py-20 text-center text-gray-500 tracking-widest">
      No products found in the collection.
    </div>
  )}
</div>
<div className="py-24 text-center">
<p className="text-xs uppercase tracking-[0.4em] text-gray-400">Discover your ritual</p>
</div>
</main>

        <Footer />
    </div>
  )
}

