
"use client";
/* eslint-disable @next/next/no-img-element */
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useState, useEffect, use, useMemo } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import CountdownTimer from "@/app/components/CountdownTimer";

const AccordionItem = ({ title, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-5 text-left focus:outline-none focus:ring-none group hover:bg-[#faf9f8] dark:hover:bg-gray-800/50 px-2 -mx-2 rounded-xl transition-all"
      >
        <span className="font-display font-medium text-lg tracking-wide text-[#161314] dark:text-white group-hover:text-[#c3a2ab] transition-colors">
          {title}
        </span>
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-[#f3edf0] transition-colors text-[#161314] dark:text-gray-200">
          {/* Horizontal line */}
          <span className="absolute w-[14px] h-[1.5px] bg-current rounded-full transition-transform duration-300"></span>
          {/* Vertical line - hidden when open */}
          <span className={`absolute w-[1.5px] h-[14px] bg-current rounded-full transition-transform duration-300 ${isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}></span>
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] px-2 ${isOpen ? "max-h-[800px] opacity-100 pb-6" : "max-h-0 opacity-0 pb-0"}`}
      >
        <div className="text-gray-600 dark:text-gray-400 leading-relaxed font-sans text-base whitespace-pre-wrap">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ProductDetailPage(props) {
  const params = use(props.params);
  const id = params.id;
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
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
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(null); // Force user to explicitly select a size to see its specific price/image
          }
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

  const currentVariant = selectedVariant;
  const currentStock = currentVariant ? currentVariant.stock : product.stock;
  
  const now = new Date();
  const isFlashSaleActive = !currentVariant && product.flashSalePrice && product.flashSaleStart && product.flashSaleEnd && now >= new Date(product.flashSaleStart) && now <= new Date(product.flashSaleEnd);
  
  const currentPrice = currentVariant ? currentVariant.price : (isFlashSaleActive ? product.flashSalePrice : product.price);
  const originalPriceDisplay = isFlashSaleActive ? product.price : null;

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
                  backgroundImage: `url('${selectedVariant?.image || product.image || "/G11.png"}')`,
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

                {/* --- Product Analytics & FOMO Badges --- */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {product.totalSold > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide">
                      <span className="material-symbols-outlined notranslate text-sm">local_fire_department</span>
                      ขายไปแล้ว {product.totalSold.toLocaleString()} ชิ้น
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide">
                    <span className="material-symbols-outlined notranslate text-sm">visibility</span>
                    คนกำลังดูสินค้านี้ {product.viewers || 12} คน
                  </div>
                  {currentStock > 0 && currentStock <= 10 && (
                     <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide animate-pulse">
                        <span className="material-symbols-outlined notranslate text-sm">warning</span>
                        ด่วน! สินค้าเหลือเพียง {currentStock} ชิ้นสุดท้าย
                     </div>
                  )}
                </div>

              </div>
              <div className="flex items-baseline gap-4 mt-2">
                {isFlashSaleActive ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-light text-red-600">
                        ฿{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xl text-gray-400 line-through font-medium">
                        ฿{originalPriceDisplay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <CountdownTimer targetDate={product.flashSaleEnd} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {product.variants?.length > 0 && !selectedVariant && (
                      <span className="text-base text-gray-500 font-medium">Starting from</span>
                    )}
                    <span className="text-3xl font-light text-[#161314] dark:text-white">
                      ฿{product.variants?.length > 0 && !selectedVariant 
                          ? Math.min(...product.variants.map(v => v.price)).toLocaleString(undefined, { minimumFractionDigits: 2 })
                          : currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })
                       }
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentStock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              {/* Product Information Accordion */}
              <div className="mt-8 space-y-1">
                 <AccordionItem title="รายละเอียดติตราสินค้า (Description)" defaultOpen={true}>
                    {product.description || "RICHSE is a skincare brand dedicated to enhancing natural beauty through thoughtful care and refined formulas. Focused on quality, balance, and skin wellness, RICHSE helps support healthier-looking, radiant skin as part of a modern self-care routine."}
                 </AccordionItem>
                 
                 <AccordionItem title="การดูแลปัญหาผิว (Skin Type)">
                    <div className="bg-[#fcfaf9] dark:bg-gray-800/50 p-4 rounded-2xl border border-[#f3edf0] dark:border-gray-700 mb-5 inline-flex items-start gap-4 shadow-sm w-full">
                       <span className="material-symbols-outlined text-[#c3a2ab] text-3xl">verified</span>
                       <div>
                          <strong className="block text-[#161314] dark:text-white mb-1">เหมาะสำหรับ</strong>
                          <span className="text-[#161314] dark:text-white font-medium">{product.skinType || "ทุกสภาพผิว (All Skin Types)"}</span>
                       </div>
                    </div>
                    <strong>✨ วิธีการใช้งาน:</strong><br/>
                    {product.howToUse || "หยดเนื้อผลิตภัณฑ์ลงบนฝ่ามือ เล็กน้อย จากนั้นค่อยๆ กดประคบลงบนผิวหน้าและลำคออย่างนุ่มนวล แนะนำให้ใช้เป็นประจำทุกเช้าและก่อนนอน"}
                 </AccordionItem>

                 <AccordionItem title="ข้อมูลจำเพาะ (Product Info)">
                    <ul className="space-y-5 list-none py-2 m-0">
                       <li className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                          <span className="material-symbols-outlined text-gray-400 text-2xl">category</span>
                          <div>
                             <strong className="block text-[#161314] dark:text-white text-sm mb-0.5 uppercase tracking-widest">Category</strong>
                             <span className="text-gray-600">{product.category || "สกินแคร์ / ความงาม"}</span>
                          </div>
                       </li>
                       <li className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                          <span className="material-symbols-outlined text-emerald-500 text-2xl">eco</span>
                          <div>
                             <strong className="block text-[#161314] dark:text-white text-sm mb-0.5 uppercase tracking-widest">Clean Beauty Paradigm</strong>
                             <span className="text-gray-600">100% Vegan & Cruelty-Free ปราศจากการทารุณกรรมสัตว์ ปราศจากพาราเบน ซิลิโคน และสารแต่งกลิ่นสังเคราะห์</span>
                          </div>
                       </li>
                       <li className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                          <span className="material-symbols-outlined text-blue-400 text-2xl">health_and_safety</span>
                          <div>
                             <strong className="block text-[#161314] dark:text-white text-sm mb-0.5 uppercase tracking-widest">Dermatologically Endorsed</strong>
                             <span className="text-gray-600">Formula พัฒนาและผ่านการทดสอบโดยผู้เชี่ยวชาญด้านผิวหนัง อ่อนโยนแต่ให้ผลลัพธ์สูง</span>
                          </div>
                       </li>
                    </ul>
                 </AccordionItem>
                 
                 <AccordionItem title="ส่วนผสมหลัก (Key Ingredients)">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-xl shadow-inner text-sm text-gray-600 dark:text-gray-400 leading-loose">
                       {product.ingredients || "Water, Glycerin, Premium Extracts. (กรุณาสอบถามข้อมูลส่วนผสมโดยละเอียดสำหรับสินค้าล็อตปัจจุบันจากแอดมิน)"}
                    </div>
                 </AccordionItem>
              </div>
              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                {product.variants?.length > 0 && (
                  <div className="mb-6">
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-3 block">Select Size</span>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map(v => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVariant(v);
                            setQuantity(1); // Reset quantity when variant changes
                          }}
                          className={`px-4 py-2 border rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                            selectedVariant?.id === v.id 
                              ? "border-[#161314] bg-[#161314] text-white dark:border-white dark:bg-white dark:text-black" 
                              : v.stock <= 0 
                                ? "border-gray-200 bg-gray-50 text-gray-400 opacity-50 relative overflow-hidden"
                                : "border-gray-200 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {v.name}
                          {v.stock <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-px bg-gray-400 rotate-[-12deg] transform origin-center"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-full bg-gray-50/50">
                    <button
                      onClick={decrease}
                      disabled={currentStock === 0}
                      className="px-4 py-3 text-gray-500 hover:text-[#161314] hover:bg-gray-100 rounded-l-full transition-colors disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium font-sans">
                      {quantity}
                    </span>
                    <button
                      onClick={increase}
                      disabled={currentStock === 0 || quantity >= currentStock}
                      className="px-4 py-3 text-gray-500 hover:text-[#161314] hover:bg-gray-100 rounded-r-full transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (currentStock <= 0) return;
                      if (product.variants?.length > 0 && !selectedVariant) {
                        toast.error("Please select a size first");
                        return;
                      }
                      
                      addToCart({ 
                        ...product, 
                        variantId: selectedVariant?.id,
                        variantName: selectedVariant?.name,
                        price: currentPrice,
                        originalPrice: product.price,
                        stock: currentStock
                      }, quantity);
                      // alert is removed as toast.success is handled in CartContext
                    }}
                    className="flex-3 bg-[#c3a2ab] hover:bg-[#c3a2ab]/90 text-white font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 uppercase tracking-widest text-sm disabled:opacity-50"
                    disabled={currentStock <= 0}
                  >
                    {currentStock > 0 ? "Add to Cart" : "Out of Stock"}
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
                {currentStock > 0 && (
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
                  <span className="material-symbols-outlined notranslate text-[#C9A961] text-3xl">
                    local_shipping
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-tighter">
                    Free Priority Shipping
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="material-symbols-outlined notranslate text-[#C9A961] text-3xl">
                    eco
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-tighter">
                    Cruelty-Free
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <span className="material-symbols-outlined notranslate text-[#C9A961] text-3xl">
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

        <div className="mt-16 sm:mt-32 space-y-16 sm:space-y-32">
          {reviews.length > 0 && (
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
                                <span className="material-symbols-outlined notranslate text-gray-400">person</span>
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
