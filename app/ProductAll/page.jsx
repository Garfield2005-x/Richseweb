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
  
  // Filtering & Sorting State
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [skinTypeFilter, setSkinTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

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

  async function fetchWishlist() {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.map(item => item.productId));
      }
    } catch (e) { console.error(e); }
  }

  // --- Filter and Sort Logic ---
  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === "All" || (product.category && product.category.toLowerCase().includes(categoryFilter.toLowerCase().replace(/s$/, "")));
    const matchesSkinType = skinTypeFilter === "All" || (product.skinType && product.skinType.toLowerCase().includes(skinTypeFilter.toLowerCase().replace(" skin", "")));
    return matchesCategory && matchesSkinType;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  return (
    <div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-16 md:pt-40 md:pb-24">
        <header className="text-center mb-12 md:mb-16">
          <h1 className="font-display text-5xl md:text-7xl font-light mb-12 tracking-tight">The Collection</h1>
          
          <div className="space-y-8">
            {/* Category Filter */}
            <nav className="flex flex-wrap justify-center gap-4 md:gap-10">
              {["All", "Serum", "Cream", "Moisturizer", "Mask"].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs uppercase tracking-[0.2em] font-bold pb-1 transition-all border-b-2 ${
                    categoryFilter === cat ? "border-[#c3a2ab] text-[#161314]" : "border-transparent text-gray-400 hover:text-[#c3a2ab]"
                  }`}
                >
                  {cat === "All" ? "All" : cat + "s"}
                </button>
              ))}
            </nav>

            {/* Skin Type & Sort Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Skin Type:</span>
                {["All", "Dry", "Oily", "Sensitive"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSkinTypeFilter(type)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                      skinTypeFilter === type 
                        ? "bg-[#c3a2ab] text-white" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {type === "All" ? "All Skins" : type}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none cursor-pointer border-b border-gray-200 pb-1"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-24">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-500 tracking-widest uppercase">
              Loading Collection...
            </div>
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map(product => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-gray-50 mb-6">
                  <Link
                    href={`/product/${product.id}`}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${product.image || "/G11.png"}')` }}
                  />
                  
                  {/* Category Tag */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.category && (
                      <div className="bg-white/90 backdrop-blur-sm text-[#161314] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        {product.category}
                      </div>
                    )}
                    {product.id === 3 && (
                      <div className="bg-[#c3a2ab] text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        Limited
                      </div>
                    )}
                  </div>

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <div className="bg-gray-900 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                        Out of Stock
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/70 hover:bg-white backdrop-blur-sm transition-all shadow-sm"
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
                               font-bold text-[10px] tracking-widest uppercase
                               opacity-0 translate-y-4
                               group-hover:opacity-100 group-hover:translate-y-0
                               transition-all duration-500
                               shadow-xl z-10"
                  >
                    View Details
                  </Link>
                </div>

                <div className="space-y-1 px-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display text-xl font-bold line-clamp-1">{product.name}</h3>
                    {product.skinType && (
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pt-1.5 whitespace-nowrap">
                        {product.skinType.replace(" skin", "")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-light line-clamp-1">{product.description}</p>
                  
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
            <div className="col-span-full py-32 text-center space-y-4">
              <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined notranslate text-gray-300">search_off</span>
              </div>
              <p className="text-gray-500 tracking-widest uppercase text-xs font-bold">No products found matching filters</p>
              <button 
                onClick={() => { setCategoryFilter("All"); setSkinTypeFilter("All"); }}
                className="text-[#c3a2ab] text-[10px] font-bold uppercase tracking-widest border-b border-[#c3a2ab] pb-0.5"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
        
        <div className="py-24 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Discover your ritual</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

