"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import NextImage from "next/image";
import { Package, MapPin, Award, Camera, User as UserIcon, LayoutDashboard, Ticket } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import LoadingRichse from "@/app/components/LoadingRichse";

export default function AccountOverview() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<{ points?: number } | null>(null);
  const [discounts, setDiscounts] = useState<{code: string, discount_percent: number, min_purchase: number | null, max_discount: number | null, description: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, discountsRes] = await Promise.all([
          fetch("/api/account/profile"),
          fetch("/api/account/discounts")
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
        }
        if (discountsRes.ok) {
          const data = await discountsRes.json();
          setDiscounts(data);
        }
      } catch (e) {
        console.error("Failed to load account data", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.image && !avatar) {
      setAvatar(session.user.image);
    }
  }, [session, avatar]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        uploadToServer(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const uploadToServer = async (base64Image: string) => {
    setUploading(true);
    try {
      const res = await fetch("/api/account/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      if (res.ok) {
        setAvatar(base64Image);
        alert("อัปโหลดรูปโปรไฟล์สำเร็จ!");
      } else {
        alert("Failed to update profile picture.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <LoadingRichse message="Syncing your profile data..." />;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 shadow-2xl flex items-center justify-center relative transition-all duration-500 group-hover:border-[#F07098]/50">
              {avatar ? (
                <NextImage src={avatar} alt="Profile" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <UserIcon className="w-12 h-12 text-white/20" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <LoadingRichse inline message="" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 bg-[#F07098] text-white p-2.5 rounded-full shadow-xl hover:bg-[#F394B8] transition-all duration-300 focus:outline-none disabled:opacity-50 scale-90 group-hover:scale-100"
              title="Change Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-[32px] md:text-[44px] font-luxury font-bold text-white uppercase tracking-tight">
              Account <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">Overview</span>
            </h1>
            <p className="text-white/40 font-light tracking-wide text-[13px] uppercase tracking-[0.2em]">
              Welcome back, <span className="text-white font-bold">{session?.user?.name || "Guest"}</span> ✦
            </p>
          </div>
        </div>
        
        {/* Points Display - Luxury Card */}
        <div className="bg-gradient-to-br from-[#F07098] via-[#F394B8] to-[#F07098] p-8 rounded-[2.5rem] shadow-[0_20px_40px_rgba(240,112,152,0.2)] text-white flex items-center gap-6 min-w-[300px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md relative z-10">
            <Award className="h-8 w-8 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[12px] font-bold opacity-80 uppercase tracking-[0.3em] mb-1">Richse Points</p>
            <h2 className="text-[48px] font-luxury font-black leading-tight tracking-tight">
              {profile ? profile.points?.toLocaleString() : "..."}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(session?.user as { role?: string })?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="group block p-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-sm hover:border-[#F07098]/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F07098]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center relative z-10">
              <div className="flex bg-white/5 p-4 rounded-2xl text-[#F07098] border border-white/5 group-hover:bg-[#F07098] group-hover:text-white transition-colors duration-500">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div className="ml-6">
                <h3 className="text-[20px] font-bold text-white group-hover:text-[#F07098] transition-colors uppercase tracking-widest">
                  Admin Panel
                </h3>
                <p className="mt-1 text-[13px] text-white/30 font-light tracking-wide">
                  Master dashboard for brand management
                </p>
              </div>
            </div>
          </Link>
        )}
        <Link
          href="/account/orders"
          className="group block p-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-sm hover:border-[#F07098]/30 transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#F394B8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center relative z-10">
            <div className="flex bg-white/5 p-4 rounded-2xl text-[#F07098] border border-white/5 group-hover:bg-[#F07098] group-hover:text-white transition-colors duration-500">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-6">
              <h3 className="text-[20px] font-bold text-white group-hover:text-[#F07098] transition-colors uppercase tracking-widest">
                My Orders
              </h3>
              <p className="mt-1 text-[13px] text-white/30 font-light tracking-wide">
                Track your ritual collections
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/account/address"
          className="group block p-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-sm hover:border-[#F07098]/30 transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#F07098]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center relative z-10">
            <div className="flex bg-white/5 p-4 rounded-2xl text-[#F07098] border border-white/5 group-hover:bg-[#F07098] group-hover:text-white transition-colors duration-500">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="ml-6">
              <h3 className="text-[20px] font-bold text-white group-hover:text-[#F07098] transition-colors uppercase tracking-widest">
                Address Book
              </h3>
              <p className="mt-1 text-[13px] text-white/30 font-light tracking-wide">
                Manage your shipping destinations
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* My Coupons Section */}
      <div className="pt-12 border-t border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2 bg-[#F07098]/10 rounded-lg">
              <Ticket className="w-5 h-5 text-[#F07098]" />
            </div>
            <h3 className="text-[24px] font-luxury font-bold text-white tracking-tight uppercase">My Rewards <span className="italic font-light">✦</span></h3>
          </div>
         
         {discounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {discounts.map((discount) => (
                  <div key={discount.code} className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-[#F07098]/50 transition-all duration-500 overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-tr from-[#F07098]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                           <span className="bg-[#F07098] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-[#F07098]/20">{discount.discount_percent}% OFF</span>
                        </div>
                        <h4 className="text-[22px] font-luxury font-bold text-white mt-4 tracking-tight break-all uppercase group-hover:text-[#F07098] transition-colors">{discount.code}</h4>
                        <p className="text-[13px] text-white/40 mt-2 font-light line-clamp-2">{discount.description}</p>
                        
                        <button
                          onClick={() => {
                             navigator.clipboard.writeText(discount.code);
                             toast.success("คัดลอกโค้ดส่วนลดแล้ว!", {
                               style: { background: '#010000', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                             });
                          }}
                          className="mt-6 w-full bg-white/5 text-white/60 hover:bg-[#F07098] hover:text-white font-bold py-3.5 rounded-xl transition-all duration-300 text-[12px] uppercase tracking-widest border border-white/5 group-hover:border-[#F07098]"
                        >
                          Copy Ritual Code
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
               <Ticket className="w-12 h-12 text-white/10 mx-auto mb-4" />
               <p className="text-white/30 font-light text-[15px] tracking-wide uppercase tracking-[0.1em]">No rewards available yet</p>
            </div>
         )}
      </div>

      <div className="pt-12 border-t border-white/5">
        <h3 className="text-[24px] font-luxury font-bold text-white mb-8 tracking-tight uppercase">Profile Details <span className="italic font-light">✦</span></h3>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 max-w-2xl bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <div className="space-y-1">
            <dt className="text-[10px] font-bold text-[#F07098] uppercase tracking-[0.3em]">Full Name</dt>
            <dd className="text-[18px] text-white font-medium">{session?.user?.name || "N/A"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-[10px] font-bold text-[#F07098] uppercase tracking-[0.3em]">Email Portal</dt>
            <dd className="text-[18px] text-white font-medium break-all">{session?.user?.email || "N/A"}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}
