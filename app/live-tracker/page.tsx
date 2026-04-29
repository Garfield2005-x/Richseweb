import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getCurrentLiveSession, getLiveSessionsHistory } from "@/app/actions/live";
import { getPersonalAnalytics, getSchedules, getMyLeaves, getMyTickets } from "@/app/actions/portal";
import LiveTrackerClient from "./LiveTrackerClient";

export const metadata = {
  title: "Streamer Hub | Richse Official",
  description: "ระบบบริหารจัดการและลงเวลาสำหรับพนักงานไลฟ์",
};

export default async function LiveTrackerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/live-tracker");
  }

  // Fetch all required data for the V2 Hub
  const [
    currentSessionRes, 
    historyRes, 
    analyticsRes,
    schedulesRes,
    leavesRes,
    ticketsRes
  ] = await Promise.all([
    getCurrentLiveSession(),
    getLiveSessionsHistory(),
    getPersonalAnalytics(),
    getSchedules(),
    getMyLeaves(),
    getMyTickets()
  ]);

  return (
    <div className="min-h-screen bg-[#f9f5f6] text-[#161314] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#161314] tracking-tight">Streamer Hub</h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              ระบบศูนย์กลางการทำงานสำหรับพนักงานไลฟ์ (Live Streamer Portal V2)
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <span className="material-symbols-outlined text-[#c3a2ab]">account_circle</span>
            <span className="text-sm font-bold">{session.user.name || session.user.email}</span>
          </div>
        </div>

        <LiveTrackerClient 
          initialSession={currentSessionRes.success ? currentSessionRes.liveSession : null}
          history={historyRes.success ? historyRes.history : []}
          analytics={analyticsRes.success ? analyticsRes.analytics : null}
          schedules={schedulesRes.success ? schedulesRes.schedules : []}
          leaves={leavesRes.success ? leavesRes.leaves : []}
          tickets={ticketsRes.success ? ticketsRes.tickets : []}
          currentUserId={(session.user as { id: string }).id}
        />
      </div>
    </div>
  );
}
