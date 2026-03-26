"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function RewardsCatalog() {
  const { status } = useSession();
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/account/points").then((r) => r.json()),
        fetch("/api/rewards").then((r) => r.json()),
        fetch("/api/rewards/my-redemptions").then(r => r.json())
      ])
        .then(([pointsData, rewardsData, redemptionsData]) => {
          setPoints(pointsData?.points || 0);
          setRewards(rewardsData || []);
          if (!redemptionsData.error) {
            setMyRedemptions(redemptionsData || []);
          }
        })
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      fetch("/api/rewards").then((r) => r.json()).then(data => setRewards(data || [])).finally(() => setLoading(false));
    }
  }, [status]);

  const handleRedeem = async (reward) => {
    if (status !== "authenticated") {
      toast.error("Please login to redeem rewards");
      return;
    }

    if (points < reward.points_required) {
      toast.error("Not enough points to redeem this item!");
      return;
    }

    if (reward.stock <= 0) {
      toast.error("Out of stock!");
      return;
    }

    if (!confirm(`Are you sure you want to redeem your ${reward.points_required} points for ${reward.name}?`)) {
      return;
    }

    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId: reward.id })
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Redemption successful! Your item will be shipped shortly.");
      setPoints((prev) => prev - reward.points_required);
      setRewards((prev) =>
        prev.map((r) => (r.id === reward.id ? { ...r, stock: r.stock - 1 } : r))
      );
      // Refresh redemptions to show the newly claimed one
      fetch("/api/rewards/my-redemptions").then(r => r.json()).then(data => {
        if (!data.error) setMyRedemptions(data);
      });
    } else {
      toast.error(data.error || "Failed to redeem reward.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-32 pb-10">
      <Navbar />
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 md:pt-10">
        
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-[#c3a2ab] to-[#e4cdd2] rounded-3xl p-10 flex items-center justify-between text-white shadow-xl mb-12 relative overflow-hidden">
          <div className="relative z-10 w-full md:w-1/2">
            <h1 className="text-4xl font-serif mb-3 leading-tight">Richse Rewards Center</h1>
            <p className="opacity-90 leading-relaxed mb-6">
              Turn your purchases into exclusive gifts. Shop your favorite items, earn points, and unlock premium rewards curated just for you.
            </p>
            {status === "authenticated" ? (
              <div className="bg-white/20 backdrop-blur-md inline-block rounded-2xl p-6 border border-white/30 shadow-sm">
                <span className="text-white/80 text-sm uppercase tracking-wider font-semibold mb-1 block">Your Balance</span>
                <span className="text-5xl font-bold">{points.toLocaleString()} <span className="text-xl font-normal">Pts</span></span>
              </div>
            ) : (
              <a href="/login?callbackUrl=/rewards" className="bg-white text-[#c3a2ab] shadow-sm px-8 py-3 rounded-full font-bold hover:shadow-lg transition-transform hover:-translate-y-1 inline-block">
                Sign in to view balance
              </a>
            )}
          </div>
          {/* Decorative element right side */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%), radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '50px 50px', backgroundPosition: '0 0, 25px 25px' }}></div>
        </section>

        {/* My Claimed Rewards Section */}
        {status === "authenticated" && myRedemptions.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-serif text-gray-800 mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-[#c3a2ab] rounded-full inline-block"></span>
              My Claimed Rewards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRedemptions.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 bg-[#f8f6f4] rounded-xl flex items-center justify-center shrink-0">
                     {r.reward.image && (r.reward.image.startsWith("http") || r.reward.image.startsWith("/")) ? (
                        <img src={r.reward.image} alt={r.reward.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-4xl">{r.reward.image || "🎁"}</span>
                      )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm mb-1 leading-tight line-clamp-2" title={r.reward.name}>{r.reward.name}</h4>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {new Date(r.created_at).toLocaleDateString("th-TH")}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${r.status === 'SHIPPED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.status === 'SHIPPED' ? '🚀 Shipped' : '⏳ Pending'}
                    </span>
                    {r.tracking_number && (
                      <div className="mt-2 text-[10px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                        <span className="tracking-wider uppercase">{r.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catalog Grid */}
        <h2 className="text-3xl font-serif text-gray-800 mb-8 flex items-center gap-3">
          <span className="w-8 h-1 bg-[#c3a2ab] rounded-full inline-block"></span>
          Exclusive Gifts
        </h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#c3a2ab]"></div>
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-20 break-words w-full">
            <p className="text-gray-500 text-lg">No rewards are currently available. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {rewards.map((reward) => (
              <div key={reward.id} className="group bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden relative">
                
                {reward.stock <= 0 && (
                  <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Sold Out
                  </div>
                )}

                <div className="relative w-full aspect-square bg-[#f8f6f4] rounded-2xl mb-5 flex items-center justify-center overflow-hidden p-4">
                  {reward.image && (reward.image.startsWith("http") || reward.image.startsWith("/")) ? (
                    <img 
                      src={reward.image} 
                      alt={reward.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{reward.image || "🎁"}</span>
                  )}
                </div>
                
                <div className="flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-2" title={reward.name}>{reward.name}</h3>
                  <div className="mt-auto">
                    <p className="text-[#c3a2ab] font-bold text-xl mb-4 flex items-center gap-1.5 break-normal">
                      <span>💎</span> {reward.points_required.toLocaleString()} <span className="text-sm font-normal text-gray-500">Pts</span>
                    </p>
                    
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={reward.stock <= 0 || points < reward.points_required}
                      className={`w-full py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-md ${
                        reward.stock <= 0 
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
                          : points >= reward.points_required
                            ? "bg-[#c3a2ab] hover:bg-[#b08e96] text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      }`}
                    >
                      {reward.stock <= 0 ? "Out of Stock" : "Redeem Now"}
                    </button>
                    {points < reward.points_required && reward.stock > 0 && status === "authenticated" && (
                      <p className="text-[11px] text-center text-red-400 mt-2 font-medium">Not enough points</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer className="mt-auto" />
    </div>
  );
}
