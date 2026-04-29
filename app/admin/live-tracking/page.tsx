import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getAdminLiveSessions } from "@/app/actions/live";
import { getAdminLeaves, getSchedules, getAdminTickets } from "@/app/actions/portal";
import AdminLiveTrackingClient from "./AdminLiveTrackingClient";

export const metadata = {
  title: "Admin Portal | Richse Official",
};

export default async function AdminLiveTrackingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/");
  }

  const [
    liveRes,
    leavesRes,
    schedulesRes,
    ticketsRes
  ] = await Promise.all([
    getAdminLiveSessions(),
    getAdminLeaves(),
    getSchedules(),
    getAdminTickets()
  ]);

  return (
    <div className="min-h-screen bg-[#f9f5f6] text-[#161314] pt-8 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#161314] tracking-tight">RICHSE Streamer Admin Portal</h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              ระบบตรวจสอบเวลาทำงาน, จัดการกะ, วันหยุด, และปัญหาพนักงานไลฟ์
            </p>
          </div>
        </div>

        <AdminLiveTrackingClient 
          initialOngoing={liveRes.success ? liveRes.ongoing : []} 
          initialCompleted={liveRes.success ? liveRes.completed : []} 
          initialLeaves={leavesRes.success ? leavesRes.leaves : []}
          initialSchedules={schedulesRes.success ? schedulesRes.schedules : []}
          initialTickets={ticketsRes.success ? ticketsRes.tickets : []}
        />
      </div>
    </div>
  );
}
