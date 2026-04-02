"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import NextImage from "next/image";
import { Package, MapPin, Award, Camera, Loader2, User as UserIcon, LayoutDashboard, Ticket } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function AccountOverview() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<{ points?: number } | null>(null);
  const [discounts, setDiscounts] = useState<{code: string, discount_percent: number, min_purchase: number | null, max_discount: number | null, description: string}[]>([]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/account/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
    
    async function fetchDiscounts() {
      try {
        const res = await fetch("/api/account/discounts");
        if (res.ok) {
          const data = await res.json();
          setDiscounts(data);
        }
      } catch (e) {
        console.error("Failed to load discounts", e);
      }
    }

    fetchProfile();
    fetchDiscounts();
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-sm flex items-center justify-center relative">
              {avatar ? (
                <NextImage src={avatar} alt="Profile" fill className="object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-gray-400" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-[#c3a2ab] text-white p-2 rounded-full shadow-md hover:bg-[#a88891] transition-colors focus:outline-none disabled:opacity-50"
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
          <div>
            <h1 className="text-[36px] font-display font-medium text-gray-900 uppercase tracking-widest">
              Account Overview
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {session?.user?.name || "Guest"}! Manage your orders, addresses, and account details here.
            </p>
          </div>
        </div>
        
        {/* Points Display */}
        <div className="bg-gradient-to-r from-[#c3a2ab] to-[#e4cbd1] p-6 rounded-2xl shadow-sm text-white flex items-center gap-4 min-w-[240px]">
          <div className="bg-white/20 p-3 rounded-full">
            <Award className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-[22px] font-medium opacity-90 uppercase tracking-wider">Richse Points</p>
            <h2 className="text-[44px] font-display font-bold">
              {profile ? profile.points?.toLocaleString() : "..."}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(session?.user as { role?: string })?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="group block p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:border-[#c3a2ab]"
          >
            <div className="flex items-center">
              <div className="flex bg-[#f8f6f4] p-3 rounded-lg text-[#c3a2ab]">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-[26px] font-medium text-gray-900 group-hover:text-[#c3a2ab] transition-colors">
                  Admin Dashboard
                </h3>
                <p className="mt-1 text-[22px] text-gray-500">
                  Manage products, orders, and rewards
                </p>
              </div>
            </div>
          </Link>
        )}
        <Link
          href="/account/orders"
          className="group block p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:border-[#c3a2ab]"
        >
          <div className="flex items-center">
            <div className="flex bg-[#f8f6f4] p-3 rounded-lg text-[#c3a2ab]">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-[26px] font-medium text-gray-900 group-hover:text-[#c3a2ab] transition-colors">
                My Orders
              </h3>
              <p className="mt-1 text-[22px] text-gray-500">
                Track, return, or buy things again
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/account/address"
          className="group block p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow hover:border-[#c3a2ab]"
        >
          <div className="flex items-center">
            <div className="flex bg-[#f8f6f4] p-3 rounded-lg text-[#c3a2ab]">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-[26px] font-medium text-gray-900 group-hover:text-[#c3a2ab] transition-colors">
                Address Book
              </h3>
              <p className="mt-1 text-[22px] text-gray-500">
                Edit addresses for orders and gifts
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* My Coupons Section */}
      <div className="pt-6 border-t border-gray-100">
         <div className="flex items-center gap-2 mb-6">
            <Ticket className="w-6 h-6 text-[#c3a2ab]" />
            <h3 className="text-[30px] font-display font-bold text-gray-900">My Coupons / โค้ดส่วนลดของคุณ</h3>
         </div>
         
         {discounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {discounts.map((discount) => (
                  <div key={discount.code} className="border border-gray-100 rounded-2xl p-5 hover:border-[#c3a2ab] hover:shadow-lg hover:shadow-[#c3a2ab]/10 transition-all bg-white flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-2">
                           <span className="bg-[#f8f6f4] text-[#c3a2ab] text-[20px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{discount.discount_percent}% OFF</span>
                        </div>
                        <h4 className="text-[26px] font-bold text-gray-900 mt-2 tracking-wide break-all">{discount.code}</h4>
                        <p className="text-[22px] text-gray-500 mt-1">{discount.description}</p>
                     </div>
                     <button
                        onClick={() => {
                           navigator.clipboard.writeText(discount.code);
                           toast.success("คัดลอกโค้ดส่วนลดแล้ว!");
                        }}
                        className="mt-4 w-full bg-gray-50 text-gray-700 hover:bg-[#c3a2ab] hover:text-white font-bold py-2 rounded-xl transition-colors text-[22px]"
                     >
                        Copy Code
                     </button>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
               <p className="text-gray-500 font-medium">คุณยังไม่มีโค้ดส่วนลดชั่วคราวในขณะนี้</p>
            </div>
         )}
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-[26px] font-medium text-gray-900 mb-4">Personal Details</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-[22px] font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-[22px] text-gray-900">{session?.user?.name || "N/A"}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-[22px] font-medium text-gray-500">Email address</dt>
            <dd className="mt-1 text-[22px] text-gray-900">{session?.user?.email || "N/A"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
