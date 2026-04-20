import { prisma } from "@/lib/prisma";
import AffiliateDashboardClient from "./AffiliateDashboardClient";

export default async function AffiliateAdminPage() {
  const [clips, channels] = await Promise.all([
    prisma.affiliateClip.findMany({
      orderBy: { created_at: 'desc' },
    }),
    prisma.affiliateChannel.findMany({
      orderBy: { created_at: 'desc' },
    })
  ]);

  // Calculate stats
  const stats = {
    total: clips.length,
    channels: channels.filter(c => c.status === 'approved').length,
    pendingClips: clips.filter(c => c.status === 'pending').length,
    pendingChannels: channels.filter(c => c.status === 'pending').length,
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#161314]">Affiliate Center</h1>
          <p className="text-gray-500 text-sm md:text-base">จัดการข้อมูลการส่งคลิปและการลงทะเบียนช่อง</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Clips</p>
          <p className="text-2xl md:text-3xl font-bold text-[#161314]">{stats.total}</p>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Approved Channels</p>
          <p className="text-2xl md:text-3xl font-bold text-[#161314]">{stats.channels}</p>
        </div>
        <div className="bg-[#fff9f0] p-5 md:p-6 rounded-[20px] md:rounded-[24px] border border-orange-100 shadow-sm">
          <p className="text-[10px] md:text-sm font-bold text-orange-400 uppercase tracking-widest mb-1">Pending Clips</p>
          <p className="text-2xl md:text-3xl font-bold text-orange-700">{stats.pendingClips}</p>
        </div>
        <div className="bg-[#fef2f2] p-5 md:p-6 rounded-[20px] md:rounded-[24px] border border-rose-100 shadow-sm">
          <p className="text-[10px] md:text-sm font-bold text-rose-400 uppercase tracking-widest mb-1">Pending Channels</p>
          <p className="text-2xl md:text-3xl font-bold text-rose-700">{stats.pendingChannels}</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <AffiliateDashboardClient initialClips={clips} initialChannels={channels} />
      </div>
    </div>
  );
}
