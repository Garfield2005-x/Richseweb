"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c3a2ab]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-medium text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-4">
          Address Book
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Set up your primary address for faster checkout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white px-2 py-4">
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c3a2ab] focus:ring-[#c3a2ab] sm:text-sm border p-2"
                placeholder="Name"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c3a2ab] focus:ring-[#c3a2ab] sm:text-sm border p-2"
                placeholder="099-999-9999"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <div className="mt-1">
              <textarea
                name="address"
                id="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c3a2ab] focus:ring-[#c3a2ab] sm:text-sm border p-2"
                placeholder="House no., Building, Street, etc."
              />
            </div>
          </div>

          <div>
            <label htmlFor="subdistrict" className="block text-sm font-medium text-gray-700">
              แขวง/ตำบล
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="subdistrict"
                id="subdistrict"
                value={formData.subdistrict}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c3a2ab] focus:ring-[#c3a2ab] sm:text-sm border p-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">
              เขต/อำเภอ
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="district"
                id="district"
                value={formData.district}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c3a2ab] focus:ring-[#c3a2ab] sm:text-sm border p-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
              จังหวัด
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="province"
                id="province"
                value={formData.province}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c3a2ab] focus:ring-[#c3a2ab] sm:text-sm border p-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              รหัสไปรษณีย์
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="postal_code"
                id="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#c3a2ab] focus:ring-[#c3a2ab] sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="sm:col-span-2 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#c3a2ab] hover:bg-[#b08c95] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c3a2ab] transition-colors disabled:opacity-50 uppercase tracking-widest"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
