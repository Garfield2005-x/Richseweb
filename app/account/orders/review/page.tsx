"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("orderId");
  const productId = searchParams.get("productId");
  const productName = searchParams.get("productName");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !productId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId: parseInt(productId),
          rating,
          comment
        })
      });

      if (res.ok) {
        toast.success("Review submitted! Thank you for your feedback.");
        router.push("/account/orders");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!orderId || !productId) {
    return (
      <div className="text-center py-20">
        <p>Invalid Review Link</p>
        <button onClick={() => router.back()} className="text-[#c3a2ab] font-bold mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-[36px] font-serif text-gray-800 mb-6 text-center">Write a Review</h1>
      <p className="text-gray-500 text-center mb-8">How was your experience with <strong>{productName}</strong>?</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rating Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Comment Box */}
        <div>
          <label className="block text-[22px] font-medium text-gray-700 mb-2">Your Review</label>
          <textarea
            required
            className="w-full border-2 border-gray-100 p-4 rounded-xl focus:outline-none focus:border-[#c3a2ab] transition-colors min-h-[150px]"
            placeholder="What did you like or dislike? How was the quality?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default function OrderReviewPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f4] pt-32 pb-20 px-4">
      <Navbar />
      <Suspense fallback={<div className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></div>}>
        <ReviewContent />
      </Suspense>
      <Footer />
    </div>
  );
}
