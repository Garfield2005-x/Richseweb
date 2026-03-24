"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import Link from "next/link";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/admin/customers");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        } else {
          toast.error("Failed to fetch customers");
        }
      } catch (error) {
        toast.error("An error occurred while loading customers");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const term = searchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(term)) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.includes(term))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Customers</h1>
          <p className="text-gray-500">View and manage all registered users.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full md:w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm shadow-sm"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading customers...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="py-4 px-6 font-medium">Customer Info</th>
                  <th className="py-4 px-6 font-medium">Contact</th>
                  <th className="py-4 px-6 font-medium">Shipping Address</th>
                  <th className="py-4 px-6 font-medium">Points</th>
                  <th className="py-4 px-6 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                            {customer.image ? (
                              <img src={customer.image} alt={customer.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-gray-400 text-lg">person</span>
                            )}
                          </div>
                          <Link href={`/admin/customers/${customer.id}`} className="flex flex-col group block">
                            <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{customer.name || "N/A"}</span>
                            <span className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">{customer.email}</span>
                          </Link>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">{customer.phone || "-"}</span>
                      </td>
                      <td className="py-4 px-6">
                        {customer.address ? (
                          <div className="text-sm text-gray-600 max-w-[250px] truncate" title={`${customer.address} ${customer.subdistrict} ${customer.district} ${customer.province} ${customer.postal_code}`}>
                            {customer.address} {customer.subdistrict} {customer.district}<br/>
                            {customer.province} {customer.postal_code}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No address provided</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {customer.points?.toLocaleString() || 0} pts
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider
                          ${customer.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                          {customer.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No customers found matching &quot;{searchTerm}&quot;</td>
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
