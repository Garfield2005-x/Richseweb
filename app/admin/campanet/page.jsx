"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, Trash2 } from "lucide-react";

export default function AdminCampanet() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch("/api/admin/campanet");
        if (res.ok) {
          const data = await res.json();
          setForms(data);
        } else {
          toast.error("Failed to fetch registrations");
        }
      } catch (error) {
        toast.error("An error occurred while loading registrations");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    
    try {
      const res = await fetch(`/api/admin/campanet?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setForms(forms.filter(f => f.id !== id));
        toast.success("Registration deleted");
      } else {
        toast.error("Failed to delete registration");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const filteredForms = forms.filter(form => {
    const term = searchTerm.toLowerCase();
    return (
      (form.name && form.name.toLowerCase().includes(term)) ||
      (form.phone && form.phone.includes(term)) ||
      (form.order && form.order.includes(term))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Campanet Registrations</h1>
          <p className="text-gray-500">View customer information submitted from the Campanet page.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full md:w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm shadow-sm"
            placeholder="Search by name, phone, or order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading registrations...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Customer Name</th>
                  <th className="py-4 px-6 font-medium">Phone Number</th>
                  <th className="py-4 px-6 font-medium">Order Number</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredForms.length > 0 ? (
                  filteredForms.map((form) => (
                    <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(form.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">{form.name}</td>
                      <td className="py-4 px-6 text-gray-600">{form.phone}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                          {form.order}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No registrations found matching &quot;{searchTerm}&quot;</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
