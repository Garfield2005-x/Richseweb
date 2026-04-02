"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

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
    return <div className="animate-pulse flex space-x-4">Loading wishlist...</div>;
  }

  return (
    <div>
      <h2 className="text-[36px] font-display font-medium text-gray-900 mb-6">Your Wishlist</h2>
      {wishlist.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">You haven&apos;t saved any items yet.</p>
          <Link
            href="/ProductAll"
            className="inline-block bg-[#c3a2ab] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#b08e98] transition-colors"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item: { id: string; productId: number; product: { name: string; image: string | null; price: number } }) => (
            <div key={item.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative">
              <button
                onClick={() => removeWishlist(item.productId)}
                className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-white z-10"
              >
                <span className="material-symbols-outlined notranslate" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </button>
              <div className="aspect-square bg-gray-100 relative">
                <Link href={`/product/${item.productId}`} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${item.product.image || "/G11.png"}')` }} />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                <p className="text-[#c3a2ab] font-medium mt-1">฿{item.product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <Link href={`/product/${item.productId}`} className="mt-3 block text-center w-full bg-gray-900 text-white py-2 rounded-lg text-[22px] font-medium hover:bg-gray-800 transition-colors">
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
