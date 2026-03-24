
"use client";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useState, useEffect, use, useMemo } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import CountdownTimer from "@/app/components/CountdownTimer";

export default function ProductDetailPage(props) {
  const params = use(props.params);
  const id = params.id;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const { data: session } = useSession();

  const fetchWishlistStatus = useMemo(() => async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.some((item) => item.productId === parseInt(id)));
      }
    } catch (e) { console.error(e); }
  }, [id]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (e) { console.error(e); }
      finally { setReviewsLoading(false); }
    }
    if (id) {
      fetchProduct();
      fetchReviews();
      if (session) fetchWishlistStatus();
    }
  }, [id, session, fetchWishlistStatus]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const toggleWishlist = async () => {
    if (!session) {
      toast.error("Please login to save items");
      return;
    }
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        const { wishlisted } = await res.json();
        setIsWishlisted(wishlisted);
        toast.success(wishlisted ? "Added to wishlist" : "Removed from wishlist");
      }
    } catch {
      toast.error("Error updating wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-display text-gray-500 tracking-widest uppercase">Loading...</div>
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  const increase = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div>
      <title>Richse | {product.name}</title>
      <Navbar />

      <main className="max-w-360 mx-auto px-6 lg:px-12 pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start landing-section">
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl overflow-hidden aspect-4/5 relative group cursor-zoom-in border border-gray-100 dark:border-gray-800 shadow-sm">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                data-alt={product.name}
                style={{
                  backgroundImage: `url('${product.image || "/G11.png"}')`,
                }}
              />
            </div>
          </div>
          <div className="lg:col-span-5 sticky top-12">
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#c3a2ab] font-bold mb-3 block">
                  The Radiance Collection
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#161314] dark:text-white leading-tight mb-4">
                  {product.name}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-[#C9A961]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`material-symbols-outlined ${s <= Math.round(avgRating || 5) ? "fill-1" : ""}`}>
                        {s <= Math.floor(avgRating || 5) ? "star" : (s <= Math.round(avgRating || 5) ? "star_half" : "star")}
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-sans">
                      {avgRating || "5.0"} ({reviews.length} Reviews)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                {product.flashSalePrice && product.flashSaleStart && product.flashSaleEnd && new Date() >= new Date(product.flashSaleStart) && new Date() <= new Date(product.flashSaleEnd) ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-light text-red-600">
                        ฿{product.flashSalePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xl text-gray-400 line-through font-medium">
                        ฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <CountdownTimer targetDate={product.flashSaleEnd} />
                  </div>
                ) : (
                  <span className="text-3xl font-light text-[#161314] dark:text-white">
                    ฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-sans text-lg whitespace-pre-wrap">
                {product.description ||
                  "RICHSE is a skincare brand dedicated to enhancing natural beauty through thoughtful care and refined formulas. Focused on quality, balance, and skin wellness, RICHSE helps support healthier-looking, radiant skin as part of a modern self-care routine."}
              </p>
              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-full bg-gray-50/50">
                    <button
                      onClick={decrease}
                      disabled={product.stock === 0}
                      className="px-4 py-3 text-gray-500 hover:text-[#161314] hover:bg-gray-100 rounded-l-full transition-colors disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium font-sans">
                      {quantity}
                    </span>
                    <button
                      onClick={increase}
                      disabled={product.stock === 0}
                      className="px-4 py-3 text-gray-500 hover:text-[#161314] hover:bg-gray-100 rounded-r-full transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (product.stock === 0) return;
                      const now = new Date();
                      const isFlashSale = product.flashSalePrice && product.flashSaleStart && product.flashSaleEnd && now >= new Date(product.flashSaleStart) && now <= new Date(product.flashSaleEnd);
                      addToCart({ 
                        ...product, 
                        price: isFlashSale ? product.flashSalePrice : product.price,
                        originalPrice: product.price 
                      }, quantity);
                      alert("Added to cart");
                    }}
                    className="flex-3 bg-[#c3a2ab] hover:bg-[#c3a2ab]/90 text-white font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 uppercase tracking-widest text-sm disabled:opacity-50"
                    disabled={product.stock <= 0}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className="flex-1 max-w-[64px] rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-colors flex items-center justify-center bg-white"
                  >
                    <span className={`material-symbols-outlined text-xl ${isWishlisted ? "text-red-500 fill-red-500" : ""}`} style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
                      favorite
                    </span>
                  </button>
                </div>
                {product.stock > 0 && (
                  <Link
                    href="/Checkout"
                    className="w-full border-2 border-[#161314] dark:border-white text-[#161314] dark:text-white font-bold py-4 rounded-lg hover:bg-[#161314] hover:text-white dark:hover:bg-white dark:hover:text-black transition-all uppercase tracking-widest text-sm block text-center"
                  >
                    Buy It Now
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="material-symbols-outlined text-[#C9A961] text-3xl">
                    local_shipping
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-tighter">
                    Free Priority Shipping
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="material-symbols-outlined text-[#C9A961] text-3xl">
                    eco
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-tighter">
                    Cruelty-Free
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="material-symbols-outlined text-[#C9A961] text-3xl">
                    verified_user
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-tighter">
                    100% Vegan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 space-y-32">
          <section className="landing-section">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.2em] text-[#c3a2ab] font-bold mb-3 block">
                Purity & Science
              </span>
              <h3 className="text-4xl font-display mb-4">Luminous Ingredients</h3>
              <p className="text-gray-500 max-w-lg mx-auto">
                Sourced from the heart of the French Alps, refined with modern science to ensure visible results without irritation.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all duration-500">
                <div className="size-20 bg-[#c3a2ab]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="material-symbols-outlined text-[#c3a2ab] text-4xl">
                    water_drop
                  </span>
                </div>
                <h4 className="font-display text-2xl mb-4">Balanced Hydration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Thoughtfully developed to support skin hydration and everyday comfort, helping maintain a soft, smooth, and refreshed-looking complexion.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all duration-500">
                <div className="size-20 bg-[#c3a2ab]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="material-symbols-outlined text-[#c3a2ab] text-4xl">
                    shutter_speed
                  </span>
                </div>
                <h4 className="font-display text-2xl mb-4">Refined Renewal</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  A carefully balanced approach to skincare designed to support smoother, healthier-looking skin while respecting the skin’s natural balance.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-2xl transition-all duration-500">
                <div className="size-20 bg-[#c3a2ab]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="material-symbols-outlined text-[#c3a2ab] text-4xl">
                    psychology_alt
                  </span>
                </div>
                <h4 className="font-display text-2xl mb-4">Skin Harmony</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Formulated with attention to skin harmony, helping maintain a calm, balanced, and naturally radiant appearance.
                </p>
              </div>
            </div>
          </section>
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-[#fdf2f4] dark:bg-primary/5 rounded-[3rem] p-12 lg:p-24 overflow-hidden relative landing-section">
            <div className="relative z-10">
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4 block">
                Application
              </span>
              <h3 className="text-4xl font-display mb-10">The Daily Ritual</h3>
              <div className="space-y-10">
                <div className="flex gap-8 items-start">
                  <span className="text-5xl font-display text-primary/20 leading-none">01</span>
                  <div>
                    <h5 className="font-bold text-lg mb-2">Treat</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      Apply Richse Milk Hya Serum (Cellular renewal formula) with 2–3 drops onto face and neck to deeply hydrate and support skin renewal.
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 items-start">
                  <span className="text-5xl font-display text-primary/20 leading-none">02</span>
                  <div>
                    <h5 className="font-bold text-lg mb-2">Moisturize</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      Follow with Richse Moist (Moisturizer) to balance skin and lock in hydration for long-lasting comfort.
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 items-start">
                  <span className="text-5xl font-display text-primary/20 leading-none">03</span>
                  <div>
                    <h5 className="font-bold text-lg mb-2">Repair & Glow</h5>
                    <p className="text-gray-600 dark:text-gray-400">
                      Finish your routine with Richse Night Cream for intensive brightening and lifting while you sleep. Use Richse Gold Mask as a special treatment to boost 24-hour moisture.
                    </p>
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
                  <p className="text-7xl font-display font-bold text-[#c3a2ab]">{avgRating || "5.0"}</p>
                  <div className="flex gap-1 text-[#C9A961]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`material-symbols-outlined text-2xl ${s <= Math.round(avgRating || 5) ? "fill-1" : ""}`}>
                        {s <= Math.floor(avgRating || 5) ? "star" : "star"}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 uppercase tracking-widest mt-2">{reviews.length} Verified Reviews</p>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                {reviewsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-gray-400 italic py-10">No reviews yet. Be the first to share your experience!</div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto pr-4 space-y-8 custom-scrollbar">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-gray-50 dark:border-gray-800 pb-8 last:border-0">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {rev.user.image ? (
                                <img src={rev.user.image} alt={rev.user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-gray-400">person</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{rev.user.name || "Verified Buyer"}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{new Date(rev.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex text-amber-400 gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`material-symbols-outlined text-sm ${s <= rev.rating ? "fill-1" : ""}`}>star</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
