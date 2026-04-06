"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Package, User as UserIcon, MapPin, LogOut, Heart } from "lucide-react";
import LoadingRichse from "@/app/components/LoadingRichse";

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
    return <LoadingRichse fullScreen message="Authenticating your sanctuary..." />;
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
    <div className="min-h-screen bg-[#010000] text-white selection:bg-[#F07098] selection:text-white flex flex-col font-sans">
      <Navbar />
      
      {/* Background Decorative Glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#F07098]/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#F394B8]/5 rounded-full blur-[110px] pointer-events-none z-0" />

      <div className="flex-1 pt-32 pb-12 md:pt-40 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
              <div className="p-8 bg-white/5 border-b border-white/5">
                <h3 className="text-[20px] font-display font-bold text-white truncate tracking-tight">
                  Hello, <span className="text-[#F07098]">{session.user?.name?.split(' ')[0] || "Customer"}</span> ✦
                </h3>
                <p className="text-[12px] text-white/30 truncate mt-1 uppercase tracking-widest font-light">{session.user?.email}</p>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-5 py-4 text-[14px] font-bold rounded-2xl transition-all duration-300 uppercase tracking-widest ${
                        isActive
                          ? "bg-[#F07098] text-white shadow-[0_10px_20px_rgba(240,112,152,0.3)]"
                          : "text-white/50 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon className={`mr-4 h-5 w-5 ${isActive ? "text-white" : "text-white/30"}`} />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-white/5 mt-4">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center px-5 py-4 text-[14px] font-bold rounded-2xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 uppercase tracking-widest"
                  >
                    <LogOut className="mr-4 h-5 w-5 text-white/20" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F07098]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
