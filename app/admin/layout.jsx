import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import "../globals.css";

export default async function AdminLayout({ children }) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-display font-bold text-[#161314]">RICHSE</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="font-medium">Products</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="font-medium">Orders</span>
            </Link>

            <Link
              href="/admin/discounts"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">local_activity</span>
              <span className="font-medium">Discounts</span>
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">group</span>
              <span className="font-medium">Customers</span>
            </Link>

            <Link
              href="/admin/campanet"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">assignment</span>
              <span className="font-medium">Campanet</span>
            </Link>

            <Link
              href="/admin/reviews"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">reviews</span>
              <span className="font-medium">Reviews</span>
            </Link>

            <Link
              href="/admin/rewards"
              className="flex flex-1 items-center gap-3 px-4 py-3 text-indigo-700 hover:bg-indigo-50 bg-indigo-50/50 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined">redeem</span>
              <span className="font-medium font-bold">Rewards</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span className="text-sm font-medium">Back to Store</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
