"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  isAffiliate: boolean;
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
  accent?: string;
}

interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    icon: "grid_view",
    adminOnly: true,
    items: [
      { href: "/admin", icon: "dashboard", label: "Dashboard" },
    ],
  },
  {
    label: "Store",
    icon: "storefront",
    adminOnly: true,
    items: [
      { href: "/admin/products", icon: "inventory_2", label: "Products" },
      { href: "/admin/orders", icon: "shopping_bag", label: "Orders" },
      { href: "/admin/discounts", icon: "local_activity", label: "Discounts" },
      { href: "/admin/flash-sale", icon: "bolt", label: "Flash Sale", accent: "text-orange-400" },
    ],
  },
  {
    label: "Customers",
    icon: "group",
    adminOnly: true,
    items: [
      { href: "/admin/customers", icon: "person_search", label: "Customers" },
      { href: "/admin/subscribers", icon: "mail", label: "Subscribers" },
      { href: "/admin/reviews", icon: "reviews", label: "Reviews" },
      { href: "/admin/rewards", icon: "redeem", label: "Rewards" },
    ],
  },
  {
    label: "Marketing",
    icon: "campaign",
    adminOnly: true,
    items: [
      { href: "/admin/marketing", icon: "campaign", label: "Marketing" },
      { href: "/admin/campanet", icon: "assignment", label: "Campanet" },
      { href: "/admin/automations", icon: "magic_button", label: "Automations", accent: "text-emerald-400" },
    ],
  },
  {
    label: "Live & Affiliate",
    icon: "sensors",
    items: [
      { href: "/admin/affiliate", icon: "video_library", label: "Affiliate Clips", accent: "text-[#c3a2ab]" },
      { href: "/admin/staff-manage", icon: "manage_accounts", label: "พนักงานไลฟ์", accent: "text-violet-400" },
      { href: "/admin/live-tracking", icon: "sensors", label: "Live Tracking", accent: "text-red-400" },
      { href: "/admin/staff-commission", icon: "percent", label: "ค่าคอมพนักงาน", accent: "text-indigo-400" },
    ],
  },
  {
    label: "System",
    icon: "settings",
    adminOnly: true,
    items: [
      { href: "/admin/settings", icon: "tune", label: "Site Settings" },
    ],
  },
];

// Mobile bottom nav quick items
const MOBILE_QUICK: NavItem[] = [
  { href: "/admin", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/orders", icon: "shopping_bag", label: "Orders" },
  { href: "/admin/live-tracking", icon: "sensors", label: "Live", accent: "text-red-400" },
  { href: "/admin/customers", icon: "group", label: "Users" },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-white/10 text-white shadow-lg shadow-black/20"
          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#c3a2ab] rounded-r-full" />
      )}
      <span
        className={`material-symbols-outlined notranslate shrink-0 transition-colors ${
          isActive ? "text-[#c3a2ab]" : item.accent || "text-gray-500 group-hover:text-gray-300"
        }`}
        style={{ fontSize: "20px" }}
      >
        {item.icon}
      </span>
      <span className={`text-[13px] font-semibold truncate ${isActive ? "text-white" : ""}`}>
        {item.label}
      </span>
    </Link>
  );
}

function SidebarGroup({
  group,
  defaultOpen = true,
}: {
  group: NavGroup;
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();
  const hasActive = group.items.some(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );
  const [open, setOpen] = useState(defaultOpen || hasActive);

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-gray-600 hover:text-gray-400 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined notranslate" style={{ fontSize: "14px" }}>{group.icon}</span>
          {group.label}
        </div>
        <span
          className={`material-symbols-outlined notranslate transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ fontSize: "14px" }}
        >
          expand_more
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-0.5 pb-2">
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ isAffiliate }: AdminSidebarProps) {
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const visibleGroups = NAV_GROUPS.filter((g) => !g.adminOnly || !isAffiliate);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ───────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-[#111214] border-r border-white/[0.06] shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out overflow-hidden ${
          hidden ? "w-0 border-0" : "w-[240px]"
        }`}
      >
        <div className="w-[240px] flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06] shrink-0">
            <div className="flex flex-col">
              <span className="text-white font-black text-[22px] tracking-tight leading-none">RICHSE</span>
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Admin Panel</span>
            </div>
            <button
              onClick={() => setHidden(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
              title="ซ่อน sidebar"
            >
              <span className="material-symbols-outlined notranslate" style={{ fontSize: "18px" }}>left_panel_close</span>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {visibleGroups.map((group, i) => (
              <SidebarGroup
                key={group.label}
                group={group}
                defaultOpen={i < 2}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/[0.06] p-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined notranslate shrink-0" style={{ fontSize: "20px" }}>storefront</span>
              <span className="text-[13px] font-semibold">Back to Store</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── FLOATING REOPEN BUTTON (desktop, sidebar hidden) ─── */}
      <button
        onClick={() => setHidden(false)}
        className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 flex-col items-center justify-center w-6 h-16 bg-[#111214] border border-white/10 rounded-r-xl text-gray-500 hover:text-gray-200 transition-all duration-300 ${
          hidden ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
        }`}
        title="เปิด sidebar"
      >
        <span className="material-symbols-outlined notranslate" style={{ fontSize: "16px" }}>chevron_right</span>
      </button>

      {/* ── MOBILE TOP BAR ───────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#111214]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 h-14">
        <span className="text-white font-black text-[18px] tracking-tight">RICHSE</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined notranslate text-[22px]">menu</span>
        </button>
      </div>

      {/* ── MOBILE DRAWER ───────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-[#111214] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
          <div>
            <div className="text-white font-black text-[20px] tracking-tight leading-none">RICHSE</div>
            <div className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Admin Panel</div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400"
          >
            <span className="material-symbols-outlined notranslate text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleGroups.map((group, i) => (
            <SidebarGroup
              key={group.label}
              group={group}
              collapsed={false}
              defaultOpen={i < 2}
            />
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-white/[0.06] p-4">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined notranslate text-[20px]">storefront</span>
            <span className="text-[13px] font-semibold">Back to Store</span>
          </Link>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111214]/95 backdrop-blur-xl border-t border-white/[0.06] flex items-center justify-around px-2 h-16">
        {MOBILE_QUICK.filter((item) => !isAffiliate || item.href === "/admin/affiliate").map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                isActive ? "text-white" : "text-gray-600"
              }`}
            >
              <span
                className={`material-symbols-outlined notranslate text-[24px] transition-colors ${
                  isActive ? "text-[#c3a2ab]" : item.accent || "text-gray-600"
                }`}
                style={{ fontSize: "24px" }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-gray-600"
        >
          <span className="material-symbols-outlined notranslate text-[24px]" style={{ fontSize: "24px" }}>
            more_horiz
          </span>
          <span className="text-[10px] font-bold">More</span>
        </button>
      </div>
    </>
  );
}
