"use client";

import { useState, useEffect } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    stock: "",
    isActive: true,
    flashSalePrice: "",
    flashSaleStart: "",
    flashSaleEnd: "",
    category: "Serum",
    skinType: "All skins",
  });

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        description: product.description,
        stock: product.stock.toString(),
        isActive: product.isActive,
        flashSalePrice: product.flashSalePrice ? product.flashSalePrice.toString() : "",
        flashSaleStart: product.flashSaleStart ? (() => {
          const d = new Date(product.flashSaleStart);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        })() : "",
        flashSaleEnd: product.flashSaleEnd ? (() => {
          const d = new Date(product.flashSaleEnd);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        })() : "",
        category: product.category || "Serum",
        skinType: product.skinType || "All skins",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        price: "",
        image: "",
        description: "",
        stock: "",
        isActive: true,
        flashSalePrice: "",
        flashSaleStart: "",
        flashSaleEnd: "",
        category: "Serum",
        skinType: "All skins",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const url = editingId 
        ? `/api/admin/products/${editingId}` 
        : "/api/admin/products";
      
      const method = editingId ? "PUT" : "POST";

      const dataToSave = {
        ...formData,
        flashSaleStart: formData.flashSaleStart ? new Date(formData.flashSaleStart).toISOString() : "",
        flashSaleEnd: formData.flashSaleEnd ? new Date(formData.flashSaleEnd).toISOString() : "",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        fetchProducts();
        handleCloseModal();
      } else {
        alert("Failed to save product");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting product");
    }
  };

  const handleQuickStockUpdate = async (id, newStock) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Number(newStock) }), // Only updating stock
      });

      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, stock: Number(newStock) } : p));
      } else {
        alert("Failed to update stock");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating stock");
    }
  };

  if (loading && products.length === 0) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Products Management</h1>
          <p className="text-gray-500">Add, edit or remove products from your store.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#c3a2ab] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="py-4 px-6 font-medium">Image</th>
                <th className="py-4 px-6 font-medium">Name</th>
                <th className="py-4 px-6 font-medium">Price</th>
                <th className="py-4 px-6 font-medium">Category</th>
                <th className="py-4 px-6 font-medium">Skin Type</th>
                <th className="py-4 px-6 font-medium">Stock</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{product.name}</td>
                    <td className="py-4 px-6">฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{product.category}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{product.skinType}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className={`w-20 border rounded-lg px-2 py-1 text-center font-bold outline-none focus:ring-2 focus:ring-[#c3a2ab] ${
                            product.stock <= 5 ? "border-red-300 text-red-600 bg-red-50" : "border-gray-200 text-gray-700"
                          }`}
                          value={product.stock}
                          onChange={(e) => {
                            // Local instant update for smooth typing
                            setProducts(products.map(p => p.id === product.id ? { ...p, stock: e.target.value } : p));
                          }}
                          onBlur={(e) => handleQuickStockUpdate(product.id, e.target.value)}
                        />
                        {product.stock <= 5 && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {product.isActive ? "ACTIVE" : "HIDDEN"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 text-gray-500">
                        <button onClick={() => handleOpenModal(product)} className="hover:text-blue-600 transition-colors">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="hover:text-red-600 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No products found. Add your first product!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                    placeholder="e.g. Richse Night Cream"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (฿)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>

                <div className="border border-[#c3a2ab]/30 bg-[#c3a2ab]/5 p-4 rounded-xl space-y-4">
                  <h3 className="text-[#c3a2ab] font-bold text-sm tracking-wider uppercase mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">bolt</span> Flash Sale Settings (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Flash Price (฿)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.flashSalePrice}
                        onChange={(e) => setFormData({ ...formData, flashSalePrice: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab] text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={formData.flashSaleStart}
                        onChange={(e) => setFormData({ ...formData, flashSaleStart: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        value={formData.flashSaleEnd}
                        onChange={(e) => setFormData({ ...formData, flashSaleEnd: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab] text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab] bg-white"
                    >
                      <option value="Serum">Serum</option>
                      <option value="Cream">Cream</option>
                      <option value="Moisturizer">Moisturizer</option>
                      <option value="Mask">Mask</option>
                      <option value="Sunscreen">Sunscreen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Skin Type</label>
                    <select
                      value={formData.skinType}
                      onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab] bg-white"
                    >
                      <option value="All skins">All skins</option>
                      <option value="Dry skin">Dry skin</option>
                      <option value="Oily skin">Oily skin</option>
                      <option value="Combination skin">Combination skin</option>
                      <option value="Sensitive skin">Sensitive skin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                    placeholder="e.g. /G11.png or https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description / Tagline</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab] min-h-[100px]"
                    placeholder="Short description or tagline for the product..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-[#c3a2ab] rounded border-gray-300 focus:ring-[#c3a2ab]"
                  />
                  <label htmlFor="isActive" className="text-gray-700 font-medium">Product is active and visible on store</label>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#c3a2ab] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
