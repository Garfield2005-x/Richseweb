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
            <h1 className="text-[36px] font-display font-bold text-[#161314]">RICHSE</h1>
            <p className="text-[20px] text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">inventory_2</span>
              <span className="font-medium">Products</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">shopping_cart</span>
              <span className="font-medium">Orders</span>
            </Link>

            <Link
              href="/admin/discounts"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">local_activity</span>
              <span className="font-medium">Discounts</span>
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">group</span>
              <span className="font-medium">Customers</span>
            </Link>

            <Link
              href="/admin/subscribers"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">mail</span>
              <span className="font-medium">Subscribers</span>
            </Link>

            <Link
              href="/admin/marketing"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate text-[#c3a2ab]">campaign</span>
              <span className="font-medium text-[#c3a2ab]">Marketing</span>
            </Link>

            <Link
              href="/admin/campanet"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">assignment</span>
              <span className="font-medium">Campanet</span>
            </Link>

            <Link
              href="/admin/reviews"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">reviews</span>
              <span className="font-medium">Reviews</span>
            </Link>

            <Link
              href="/admin/rewards"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">redeem</span>
              <span className="font-medium">Rewards</span>
            </Link>

            <Link
              href="/admin/flash-sale"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-orange-500">bolt</span>
              <span className="font-medium">Flash Sale</span>
            </Link>

            <Link
              href="/admin/automations"
              className="flex items-center gap-3 px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-bold"
            >
              <span className="material-symbols-outlined notranslate">magic_button</span>
              <span className="font-bold">Automations</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined notranslate">settings</span>
              <span className="font-medium">Site Settings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">storefront</span>
              <span className="text-[22px] font-medium">Back to Store</span>
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
