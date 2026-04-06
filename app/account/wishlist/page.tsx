"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import LoadingRichse from "@/app/components/LoadingRichse";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }

  const removeWishlist = async (productId: number) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setWishlist(wishlist.filter((w: { productId: number }) => w.productId !== productId));
        toast.success("Removed from wishlist");
      }
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return <LoadingRichse message="Recalling your saved desires..." />;
  }

  return (
    <div className="space-y-12">
      <div className="border-b border-white/5 pb-8">
        <h1 className="text-[32px] md:text-[44px] font-luxury font-bold text-white uppercase tracking-tight">
          Your <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">Wishlist</span>
        </h1>
        <p className="mt-4 text-white/30 font-light tracking-[0.2em] text-[12px] uppercase">Curate your next transformation</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 space-y-8">
          <div className="space-y-2">
            <h3 className="text-[24px] font-display font-bold text-white">Your list of desires is empty</h3>
            <p className="text-white/30 font-light tracking-wide text-[16px]">Seek and your skin shall find.</p>
          </div>
          <Link
            href="/ProductAll"
            className="inline-flex items-center px-12 py-5 border border-transparent text-[12px] font-bold rounded-2xl shadow-xl text-white bg-[#F07098] hover:bg-[#F394B8] hover:shadow-[0_10px_40px_rgba(240,112,152,0.3)] transition-all duration-500 uppercase tracking-[0.2em]"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item: { id: string; productId: number; product: { name: string; image: string | null; price: number } }) => (
            <div key={item.id} className="group bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-[#F07098]/30 transition-all duration-500 relative flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <button
                onClick={() => removeWishlist(item.productId)}
                className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-3 rounded-full text-[#F07098] hover:bg-[#F07098] hover:text-white z-10 transition-all duration-300 shadow-xl border border-white/5"
                title="Remove from ritual"
              >
                <span className="material-symbols-outlined notranslate block text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </button>
              
              <Link href={`/product/${item.productId}`} className="relative aspect-square overflow-hidden bg-white/5 border-b border-white/5">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                  style={{ backgroundImage: `url('${item.product.image || "/G11.png"}')` }} 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
              </Link>
              
              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-bold text-white text-[18px] tracking-tight group-hover:text-[#F07098] transition-colors truncate">{item.product.name}</h3>
                <p className="text-[#F394B8] font-black mt-2 text-xl tracking-tighter">฿{item.product.price.toLocaleString()}</p>
                
                <Link 
                  href={`/product/${item.productId}`} 
                  className="mt-8 block text-center w-full bg-white/5 text-white/50 border border-white/10 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#F07098] hover:text-white hover:border-[#F07098] hover:shadow-[0_10px_30px_rgba(240,112,152,0.3)] transition-all duration-500"
                >
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
