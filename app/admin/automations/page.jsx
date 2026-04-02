"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Zap,
  Truck,
  CheckCircle2,
  Activity,
  Gift,
  Bell,
  Star,
  ShoppingBag,
  ChevronDown,
  Save,
  Sparkles,
} from "lucide-react";

// ─── Reusable Toggle Switch ────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#c3a2ab] transition-all duration-300" />
    </label>
  );
}

// ─── Automation Card ───────────────────────────────────────────────────────
function AutomationCard({
  icon,
  title,
  description,
  isActive,
  onToggle,
  children,
  accentColor = "#c3a2ab",
  statLabel,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
        isActive
          ? "bg-[#161314] text-white border-black shadow-2xl shadow-black/20"
          : "bg-white text-gray-900 border-gray-100 shadow-xl shadow-gray-200/20 hover:border-gray-200"
      }`}
    >
      {/* Glow effect when active */}
      {isActive && (
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="p-8 space-y-6 relative z-10">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-4">
          <div
            className={`p-4 rounded-2xl ${
              isActive
                ? "bg-white/10"
                : "bg-gray-50 border border-gray-100"
            }`}
            style={{ color: isActive ? accentColor : "#9ca3af" }}
          >
            {icon}
          </div>
          <Toggle checked={isActive} onChange={onToggle} />
        </div>

        {/* Title & Description */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2
              className={`text-[30px] font-bold ${
                isActive ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            {isActive && <CheckCircle2 className="w-4 h-4" style={{ color: accentColor }} />}
          </div>
          <p
            className={`leading-relaxed text-[22px] ${
              isActive ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {description}
          </p>
        </div>

        {/* Status Footer */}
        <div className={`pt-4 border-t ${isActive ? "border-white/10" : "border-gray-100"}`}>
          <div className="flex items-center justify-between">
            <span
              className={`text-[20px] uppercase tracking-widest font-bold ${
                isActive ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Status
            </span>
            <div className="flex items-center gap-3">
              {statLabel && isActive && (
                <span className="text-[10px] font-bold text-gray-500">
                  {statLabel}
                </span>
              )}
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${
                  isActive ? "text-white" : "bg-gray-100 text-gray-400"
                }`}
                style={isActive ? { backgroundColor: accentColor } : {}}
              >
                {isActive ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Settings */}
        {children && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                isActive ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-900"
              }`}
            >
              <ChevronDown size={12} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
              {expanded ? "Hide Settings" : "Configure Rule"}
            </button>
            {expanded && (
              <div
                className={`mt-4 p-5 rounded-2xl space-y-4 ${
                  isActive ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-100"
                }`}
              >
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AutomationsDashboard() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  // Local config state for inputs
  const [minThreshold, setMinThreshold] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [loyaltyRate, setLoyaltyRate] = useState("");
  const [recoveryDelay, setRecoveryDelay] = useState("");
  const [recoveryMsg, setRecoveryMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        // Populate input defaults from DB
        setMinThreshold(data["auto_min_order_threshold"] || "300");
        setMemberCode(data["auto_new_member_code"] || "WELCOME10");
        setLowStockThreshold(data["auto_low_stock_threshold"] || "5");
        setLoyaltyRate(data["auto_loyalty_points_rate"] || "10");
        setRecoveryDelay(data["auto_abandoned_recovery_delay"] || "60");
        setRecoveryMsg(data["auto_abandoned_recovery_msg"] || "Hi {{name}}, we noticed you left something in your cart! Use code SAVE5 for 5% off: {{link}}");
      }
    } catch {
      toast.error("Failed to load automation rules.");
    } finally {
      setLoading(false);
    }
  }

  const toggleSetting = async (key) => {
    const currentValue = settings[key] === "true";
    const newValue = !currentValue;
    setSettings((prev) => ({ ...prev, [key]: newValue ? "true" : "false" }));
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue ? "true" : "false" }),
      });
      if (!res.ok) throw new Error();
      toast.success(newValue ? "✅ Rule activated" : "Rule deactivated");
    } catch {
      setSettings((prev) => ({ ...prev, [key]: currentValue ? "true" : "false" }));
      toast.error("Failed to update rule");
    }
  };

  const saveSetting = async (key, value) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: String(value) }),
      });
      if (!res.ok) throw new Error();
      setSettings((prev) => ({ ...prev, [key]: String(value) }));
      toast.success("Setting saved ✨");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex justify-center text-gray-400">
        <Activity className="animate-pulse w-8 h-8" />
      </div>
    );
  }

  const is = (key) => settings[key] === "true";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gray-900 text-white rounded-2xl shadow-xl">
            <Zap className="w-6 h-6" fill="currentColor" />
          </div>
          <h1 className="text-[48px] font-display font-bold text-gray-900 tracking-tight">
            Sales Automations
          </h1>
        </div>
        <p className="text-gray-500 mt-1 max-w-lg">
          Configure smart rules to automatically boost conversions and manage promotions. Changes apply instantly at checkout.
        </p>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Rules", value: ["auto_free_shipping_first_order", "auto_min_order_free_shipping", "auto_new_member_discount", "auto_low_stock_alert", "auto_loyalty_points_rate", "auto_abandoned_recovery"].filter((k) => is(k)).length, color: "text-emerald-500" },
          { label: "Total Rules", value: 6, color: "text-gray-900" },
          { label: "Points Rate", value: `1 pt / ฿${loyaltyRate || 10}`, color: "text-[#c3a2ab]" },
          { label: "Recovery", value: is("auto_abandoned_recovery") ? "Active" : "Off", color: "text-orange-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-[2rem] border border-gray-100 p-5 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
            <p className={`text-[36px] font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Automation Cards Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. First Order Ships Free */}
        <AutomationCard
          icon={<Truck className="w-8 h-8" />}
          title="First Order Ships Free"
          description="Automatically waive the ฿30 delivery fee for customers placing their very first order. System checks phone number against all previous order history at checkout."
          settingKey="auto_free_shipping_first_order"
          isActive={is("auto_free_shipping_first_order")}
          onToggle={() => toggleSetting("auto_free_shipping_first_order")}
          accentColor="#10b981"
          statLabel="Members only"
        />

        {/* 2. Min Order Free Shipping */}
        <AutomationCard
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Min Order Free Shipping"
          description="Automatically waive the ฿30 delivery fee when the customer's cart value reaches your configured threshold. Works alongside other shipping rules."
          settingKey="auto_min_order_free_shipping"
          isActive={is("auto_min_order_free_shipping")}
          onToggle={() => toggleSetting("auto_min_order_free_shipping")}
          accentColor="#3b82f6"
          statLabel={`≥ ฿${minThreshold}`}
        >
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Minimum Cart Value (฿)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[22px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. 300"
              />
              <button
                onClick={() => saveSetting("auto_min_order_threshold", minThreshold)}
                disabled={saving["auto_min_order_threshold"]}
                className="px-4 py-3 bg-gray-900 text-white rounded-xl text-[20px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                {saving["auto_min_order_threshold"] ? "..." : "Save"}
              </button>
            </div>
            <p className="text-[10px] text-gray-400">
              Example: Set to 300 → orders ≥ ฿300 get free shipping automatically.
            </p>
          </div>
        </AutomationCard>

        {/* 3. New Member Discount */}
        <AutomationCard
          icon={<Gift className="w-8 h-8" />}
          title="New Member Welcome Discount"
          description="Automatically display a discount code to newly registered members when they visit checkout for the first time. The code must already exist in your Discounts system."
          settingKey="auto_new_member_discount"
          isActive={is("auto_new_member_discount")}
          onToggle={() => toggleSetting("auto_new_member_discount")}
          accentColor="#c3a2ab"
          statLabel="Auto-reveal at checkout"
        >
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Welcome Discount Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[22px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#c3a2ab]/30 font-mono tracking-widest"
                placeholder="e.g. WELCOME10"
              />
              <button
                onClick={() => saveSetting("auto_new_member_code", memberCode)}
                disabled={saving["auto_new_member_code"]}
                className="px-4 py-3 bg-gray-900 text-white rounded-xl text-[20px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                {saving["auto_new_member_code"] ? "..." : "Save"}
              </button>
            </div>
            <p className="text-[10px] text-gray-400">
              ⚠️ Make sure this code exists and is active in your{" "}
              <a href="/admin/discounts" className="underline font-bold">Discount Codes</a> page.
            </p>
          </div>
        </AutomationCard>

        {/* 4. Low Stock Alert */}
        <AutomationCard
          icon={<Bell className="w-8 h-8" />}
          title="Low Stock Alert"
          description="Automatically send a LINE notification when any product's remaining stock drops below your configured threshold after a successful order is placed."
          settingKey="auto_low_stock_alert"
          isActive={is("auto_low_stock_alert")}
          onToggle={() => toggleSetting("auto_low_stock_alert")}
          accentColor="#f59e0b"
          statLabel="Via LINE Notify"
        >
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Alert Threshold (units remaining)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[22px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="e.g. 5"
              />
              <button
                onClick={() => saveSetting("auto_low_stock_threshold", lowStockThreshold)}
                disabled={saving["auto_low_stock_threshold"]}
                className="px-4 py-3 bg-gray-900 text-white rounded-xl text-[20px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                {saving["auto_low_stock_threshold"] ? "..." : "Save"}
              </button>
            </div>
            <p className="text-[10px] text-gray-400">
              Example: Set to 5 → you get a LINE alert when stock drops to 5 units or less.
            </p>
          </div>
        </AutomationCard>

        {/* 5. Loyalty Points Rate */}
        <AutomationCard
          icon={<Star className="w-8 h-8" />}
          title="Loyalty Points Rate"
          description="Configure how many Baht a customer must spend to earn 1 Reward Point. Points can be redeemed at checkout (1 Point = ฿1). Lower value = more generous."
          settingKey="auto_loyalty_points_rate"
          isActive={is("auto_loyalty_points_rate")}
          onToggle={() => toggleSetting("auto_loyalty_points_rate")}
          accentColor="#8b5cf6"
          statLabel={`1 pt per ฿${loyaltyRate}`}
        >
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Baht per 1 Point Earned
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={loyaltyRate}
                onChange={(e) => setLoyaltyRate(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[22px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="e.g. 10"
              />
              <button
                onClick={() => saveSetting("auto_loyalty_points_rate", loyaltyRate)}
                disabled={saving["auto_loyalty_points_rate"]}
                className="px-4 py-3 bg-gray-900 text-white rounded-xl text-[20px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                {saving["auto_loyalty_points_rate"] ? "..." : "Save"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[5, 10, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => setLoyaltyRate(String(val))}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                    loyaltyRate === String(val)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  ฿{val}/pt
                </button>
              ))}
            </div>
          </div>
        </AutomationCard>

        {/* 6. Abandoned Recovery */}
        <AutomationCard
          icon={<Zap className="w-8 h-8" />}
          title="Abandoned Recovery"
          description="Automatically detect and track potential customers who leave mid-checkout. Enable this to start building your recovery list for targeted follow-ups."
          settingKey="auto_abandoned_recovery"
          isActive={is("auto_abandoned_recovery")}
          onToggle={() => toggleSetting("auto_abandoned_recovery")}
          accentColor="#f97316"
          statLabel="Shadow Tracking Active"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Recovery Delay (Minutes)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={recoveryDelay}
                  onChange={(e) => setRecoveryDelay(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[22px] font-bold text-gray-900 outline-none"
                  placeholder="e.g. 60"
                />
                <button
                  onClick={() => saveSetting("auto_abandoned_recovery_delay", recoveryDelay)}
                  disabled={saving["auto_abandoned_recovery_delay"]}
                  className="px-4 py-3 bg-gray-900 text-white rounded-xl text-[20px] font-black uppercase tracking-widest"
                >Save</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Recovery Message Template
              </label>
              <textarea
                value={recoveryMsg}
                onChange={(e) => setRecoveryMsg(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[22px] font-medium text-gray-900 outline-none min-h-[100px]"
                placeholder="Message to send..."
              />
              <button
                onClick={() => saveSetting("auto_abandoned_recovery_msg", recoveryMsg)}
                disabled={saving["auto_abandoned_recovery_msg"]}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-[20px] font-black uppercase tracking-widest"
              >Save Message</button>
              <p className="text-[10px] text-gray-400 italic">
                Use {"{{name}}"} and {"{{link}}"} for dynamic content.
              </p>
            </div>
          </div>
        </AutomationCard>

        {/* Coming Soon */}
        <div className="rounded-[2.5rem] border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[280px]">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm mb-2">
            <Sparkles className="w-5 h-5 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-400">More Coming Soon</h3>
          <p className="text-[22px] text-gray-400 max-w-xs leading-relaxed">
            Abandoned cart recovery, birthday campaigns, and referral bonuses will be added here.
          </p>
        </div>

      </div>
    </div>
  );
}
