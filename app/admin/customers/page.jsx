"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, Users, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

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
    const matchesSearch = 
      (customer.name && customer.name.toLowerCase().includes(term)) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.includes(term));
    const matchesRole = filterRole === "ALL" || customer.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Calculate quick metrics
  const totalCustomers = customers.length;
  const totalAdmins = customers.filter(c => c.role === "ADMIN").length;
  const avgPoints = totalCustomers > 0 
    ? Math.round(customers.reduce((acc, curr) => acc + (curr.points || 0), 0) / totalCustomers) 
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Metrics */}
      <div className="flex flex-col gap-6 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 text-gray-900">Customer Intelligence</h1>
            <p className="text-gray-500">Manage user profiles, loyalty points, and roles seamlessly.</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between group hover:border-[#c3a2ab] transition-all">
            <div>
              <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Total Users</p>
              <p className="text-3xl font-display font-bold text-gray-900">{totalCustomers}</p>
            </div>
            <div className="w-14 h-14 bg-gray-50 group-hover:bg-[#c3a2ab]/10 rounded-2xl flex items-center justify-center transition-colors">
              <Users className="w-6 h-6 text-gray-400 group-hover:text-[#c3a2ab] transition-colors" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between group hover:border-red-200 transition-all">
            <div>
              <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Admins/Staff</p>
              <p className="text-3xl font-display font-bold text-gray-900">{totalAdmins}</p>
            </div>
            <div className="w-14 h-14 bg-gray-50 group-hover:bg-red-50 rounded-2xl flex items-center justify-center transition-colors">
              <ShieldCheck className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between group hover:border-purple-200 transition-all">
            <div>
              <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Avg. Loyalty Points</p>
              <p className="text-3xl font-display font-bold text-gray-900">{avgPoints}</p>
            </div>
            <div className="w-14 h-14 bg-gray-50 group-hover:bg-purple-50 rounded-2xl flex items-center justify-center transition-colors">
              <Award className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border-none bg-gray-50 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab] sm:text-sm transition-shadow"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
           {["ALL", "USER", "ADMIN"].map((role) => (
             <button
               key={role}
               onClick={() => setFilterRole(role)}
               className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider transition-all duration-300 ${
                  filterRole === role 
                   ? "bg-[#161314] text-white shadow-md shadow-black/10" 
                   : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
               }`}
             >
               {role}
             </button>
           ))}
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#c3a2ab] rounded-full animate-spin"></div>
              <p className="font-medium tracking-wider uppercase text-sm">Loading profiles...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest font-bold">
                <tr>
                  <th className="py-5 px-8">Customer Profile</th>
                  <th className="py-5 px-8 shrink-0">Contact</th>
                  <th className="py-5 px-8 max-w-[200px]">Primary Address</th>
                  <th className="py-5 px-8 text-center">Loyalty</th>
                  <th className="py-5 px-8 text-center">Status</th>
                  <th className="py-5 px-8 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-[#fdf2f4]/30 transition-colors group">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 flex-shrink-0 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                            {customer.image ? (
                              <img src={customer.image} alt={customer.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined notranslate text-[#c3a2ab]/40 text-2xl">person</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                                <Link href={`/admin/customers/${customer.id}`} className="font-bold text-gray-900 hover:text-[#c3a2ab] transition-colors truncate max-w-[150px] md:max-w-xs">{customer.name || "Anonymous User"}</Link>
                                {customer.accounts && customer.accounts.some(a => a.provider === 'google') && (
                                    <span className="text-[8px] bg-red-50 text-red-500 border border-red-100 font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ml-2 shadow-sm">Google</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px] md:max-w-xs">{customer.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-8 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          {customer.phone || "No phone"}
                        </span>
                      </td>
                      <td className="py-5 px-8 max-w-[250px]">
                        {customer.address ? (
                          <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed" title={`${customer.address} ${customer.subdistrict} ${customer.district} ${customer.province} ${customer.postal_code}`}>
                            {customer.address}, {customer.district}, {customer.province}
                          </div>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Unspecified</span>
                        )}
                      </td>
                      <td className="py-5 px-8 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-100 text-purple-700">
                           <Award className="w-3.5 h-3.5" />
                           <span className="text-sm font-bold">{customer.points?.toLocaleString() || 0}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border
                          ${customer.role === "ADMIN" 
                             ? "bg-red-50 text-red-600 border-red-100" 
                             : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {customer.role}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                         <Link 
                           href={`/admin/customers/${customer.id}`} 
                           className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-[#c3a2ab] hover:border-[#c3a2ab] hover:shadow-md transition-all"
                           title="Manage Customer"
                         >
                           <span className="material-symbols-outlined notranslate text-[20px]">chevron_right</span>
                         </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                       <div className="flex flex-col items-center justify-center text-gray-400 space-y-3">
                          <Search className="w-12 h-12 text-gray-200" />
                          <p className="text-lg font-medium text-gray-500">No customers found</p>
                          <p className="text-sm">Try adjusting your search or filters.</p>
                       </div>
                    </td>
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
