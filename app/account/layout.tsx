"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Package, User as UserIcon, MapPin, LogOut, Heart } from "lucide-react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c3a2ab]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { name: "Overview", href: "/account", icon: UserIcon },
    { name: "My Orders", href: "/account/orders", icon: Package },
    { name: "Wishlist", href: "/account/wishlist", icon: Heart },
    { name: "Address Book", href: "/account/address", icon: MapPin },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] bg-gray-50 pt-32 pb-12 md:pt-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 bg-[#f8f6f4] border-b border-gray-100">
                <h3 className="text-lg font-display font-medium text-gray-900 truncate">
                  Hello, {session.user?.name || "Customer"} 🤍
                </h3>
                <p className="text-sm text-gray-500 truncate mt-1">{session.user?.email}</p>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#c3a2ab] text-white"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                  <LogOut className="mr-3 h-5 w-5 text-red-400" />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
