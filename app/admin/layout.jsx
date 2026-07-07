import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== "ADMIN" && user?.role !== "AFFILIATE") {
    redirect("/");
  }

  const isAffiliate = user?.role === "AFFILIATE";

  return (
    <div className="min-h-screen bg-[#0e0f11] flex font-sans">
      {/* Sidebar (desktop) / Drawer+BottomNav (mobile) */}
      <AdminSidebar isAffiliate={isAffiliate} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full min-h-screen bg-[#f5f5f7] md:rounded-l-[2rem] pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
