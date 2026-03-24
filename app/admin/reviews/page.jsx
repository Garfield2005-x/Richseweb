"use client";

import { useState, useEffect } from "react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to load reviews", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleHide = async (id, currentHidden) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !currentHidden }),
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === id ? { ...r, isHidden: !currentHidden } : r));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating review");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to completely delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        alert("Failed to delete review");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting review");
    }
  };

  if (loading && reviews.length === 0) {
    return <div className="p-8">Loading reviews...</div>;
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`material-symbols-outlined text-sm ${i < rating ? "text-amber-400" : "text-gray-200"}`} style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>
        star
      </span>
    ));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Product Reviews</h1>
        <p className="text-gray-500">Moderate and manage customer feedback before it appears on the site.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="py-4 px-6 font-medium">Product</th>
                <th className="py-4 px-6 font-medium">Reviewer</th>
                <th className="py-4 px-6 font-medium">Rating</th>
                <th className="py-4 px-6 font-medium w-1/3">Comment</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <tr key={review.id} className={`transition-colors ${review.isHidden ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {review.product.image && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-white p-1">
                            <img src={review.product.image} alt={review.product.name} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <span className="font-bold text-gray-800 text-sm line-clamp-2" title={review.product.name}>
                          {review.product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{review.user.name || "Anonymous"}</p>
                        <p className="text-xs text-gray-500">{review.user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">{renderStars(review.rating)}</div>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString("th-TH")}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`text-sm ${review.isHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {review.comment || <span className="italic text-gray-400">No text provided</span>}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleToggleHide(review.id, review.isHidden)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-colors ${!review.isHidden ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                      >
                        {!review.isHidden ? "VISIBLE" : "HIDDEN"}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                       <div className="flex items-center justify-end">
                        <button onClick={() => handleDelete(review.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete permanently">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No reviews found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
