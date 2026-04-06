"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingRichse from "@/app/components/LoadingRichse";

export default function AccountAddress() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    subdistrict: "",
    district: "",
    province: "",
    postal_code: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/account/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            subdistrict: data.subdistrict || "",
            district: data.district || "",
            province: data.province || "",
            postal_code: data.postal_code || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Address updated successfully");
      } else {
        toast.error("Failed to update address");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingRichse message="Locating your sanctuary..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="border-b border-white/5 pb-8">
        <h1 className="text-[32px] md:text-[44px] font-luxury font-bold text-white uppercase tracking-tight">
          Address <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">Portal</span>
        </h1>
        <p className="mt-4 text-white/30 font-light tracking-[0.2em] text-[12px] uppercase">Coordinate your ritual deliveries</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F07098]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-10 relative z-10">
          <div className="sm:col-span-2 group">
            <label htmlFor="name" className="block text-[12px] font-bold text-[#F07098] uppercase tracking-[0.3em] mb-4 ml-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
              placeholder="Your divine name"
            />
          </div>

          <div className="sm:col-span-2 group">
            <label htmlFor="phone" className="block text-[12px] font-bold text-[#F07098] uppercase tracking-[0.3em] mb-4 ml-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
              placeholder="0XX-XXX-XXXX"
            />
          </div>

          <div className="sm:col-span-2 group">
            <label htmlFor="address" className="block text-[12px] font-bold text-[#F07098] uppercase tracking-[0.3em] mb-4 ml-1">
              Delivery Address
            </label>
            <textarea
              name="address"
              id="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px] resize-none"
              placeholder="House no., Building, Street, etc."
            />
          </div>

          <div className="group">
            <label htmlFor="subdistrict" className="block text-[12px] font-bold text-[#F07098] uppercase tracking-[0.3em] mb-4 ml-1">
              Sub-district / แขวง/ตำบล
            </label>
            <input
              type="text"
              name="subdistrict"
              id="subdistrict"
              value={formData.subdistrict}
              onChange={handleChange}
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
            />
          </div>

          <div className="group">
            <label htmlFor="district" className="block text-[12px] font-bold text-[#F07098] uppercase tracking-[0.3em] mb-4 ml-1">
              District / เขต/อำเภอ
            </label>
            <input
              type="text"
              name="district"
              id="district"
              value={formData.district}
              onChange={handleChange}
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
            />
          </div>

          <div className="group">
            <label htmlFor="province" className="block text-[12px] font-bold text-[#F07098] uppercase tracking-[0.3em] mb-4 ml-1">
              Province / จังหวัด
            </label>
            <input
              type="text"
              name="province"
              id="province"
              value={formData.province}
              onChange={handleChange}
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
            />
          </div>

          <div className="group">
            <label htmlFor="postal_code" className="block text-[12px] font-bold text-[#F07098] uppercase tracking-[0.3em] mb-4 ml-1">
              Postal Code / รหัสไปรษณีย์
            </label>
            <input
              type="text"
              name="postal_code"
              id="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className="block w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#F07098] focus:border-[#F07098] transition-all duration-300 text-[18px]"
            />
          </div>

          <div className="sm:col-span-2 pt-10">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex justify-center items-center px-16 py-5 border border-transparent text-[14px] font-bold rounded-2xl shadow-xl text-white bg-[#F07098] hover:bg-[#F394B8] hover:shadow-[0_10px_40px_rgba(240,112,152,0.4)] active:scale-[0.98] focus:outline-none transition-all duration-500 uppercase tracking-[0.3em] disabled:opacity-50"
            >
              {saving ? "Persisting changes..." : "Save Ritual Address"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
