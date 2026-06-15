'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { sendLineMessage } from "@/lib/line";
import { format } from "date-fns";

// --- Employee Actions ---

export async function getCurrentLiveSession() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const liveSession = await prisma.liveSession.findFirst({
      where: {
        userId: userId,
        status: "ONGOING",
      },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      },
      orderBy: { startTime: 'desc' },
    });

    return { success: true, liveSession };
  } catch (error) {
    console.error("Error getting current live session:", error);
    return { error: "Failed to get live session" };
  }
}

export async function getLiveSessionsHistory(month?: number, year?: number) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const whereClause: Prisma.LiveSessionWhereInput = {
      userId: userId,
      status: "COMPLETED",
    };

    if (month !== undefined && year !== undefined && month > 0 && year > 0) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const lastDay = new Date(year, month, 0).getDate();
      const start = new Date(`${year}-${pad(month)}-01T00:00:00+07:00`);
      const end = new Date(`${year}-${pad(month)}-${pad(lastDay)}T23:59:59.999+07:00`);
      whereClause.startTime = {
        gte: start,
        lte: end,
      };
    }

    const history = await prisma.liveSession.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      },
      orderBy: { startTime: 'desc' },
      take: 100, // Show more if filtering
    });

    return { success: true, history };
  } catch (error) {
    console.error("Error getting history:", error);
    return { error: "Failed to get history" };
  }
}

export async function startLiveSession(platform: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    // Check if already ongoing
    const existing = await prisma.liveSession.findFirst({
      where: {
        userId: userId,
        status: "ONGOING",
      },
    });

    if (existing) {
      return { error: "คุณมีการไลฟ์ที่กำลังทำงานอยู่แล้ว" };
    }

    const liveSession = await prisma.liveSession.create({
      data: {
        userId: userId,
        platform,
        status: "ONGOING",
        startTime: new Date(),
      },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      }
    });

    const userName = liveSession.user?.name || liveSession.user?.email || "พนักงาน";
    const startTimeStr = format(new Date(), "HH:mm");
    await sendLineMessage(`
[🎥] LIVE STREAM STARTED
━━━━━━━━━━━━━━━━━━
👤 Streamer: ${userName}
📱 Platform: ${platform}
⏰ Start Time: ${startTimeStr}
━━━━━━━━━━━━━━━━━━
Let's make it a great session! 🎉
`.trim(), process.env.LINE_LIVE_GROUP_ID);

    revalidatePath("/live-tracker");
    return { success: true, liveSession };
  } catch (error) {
    console.error("Error starting live:", error);
    return { error: "เกิดข้อผิดพลาดในการเริ่มไลฟ์" };
  }
}

export async function endLiveSession(sessionId: string, salesAmount: number, salesImageUrl?: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const existing = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!existing || existing.userId !== userId || existing.status !== "ONGOING") {
      return { error: "ไม่พบเซสชันการไลฟ์ หรือเซสชันถูกปิดไปแล้ว" };
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - existing.startTime.getTime();
    const durationMin = Math.round(durationMs / 60000);

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        status: "COMPLETED",
        durationMin,
        salesAmount,
        ...(salesImageUrl ? { salesImageUrl } : {}),
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    const userName = updated.user?.name || updated.user?.email || "พนักงาน";
    const endTimeStr = format(endTime, "HH:mm");
    
    let messageText = `
[🏁] LIVE STREAM ENDED
━━━━━━━━━━━━━━━━━━
👤 Streamer: ${userName}
📱 Platform: ${updated.platform}
⏱️ Duration: ${durationMin} Minutes
💰 Total Sales: ฿${salesAmount.toLocaleString()}
⏰ End Time: ${endTimeStr}
━━━━━━━━━━━━━━━━━━
`.trim();

    if (salesImageUrl) {
      messageText += `\n📎 Proof of Sales: รูปภาพแนบในระบบแล้ว กรุณาตรวจสอบใน Admin Panel ครับ`;
    }

    await sendLineMessage(messageText, process.env.LINE_LIVE_GROUP_ID);

    revalidatePath("/live-tracker");
    revalidatePath("/admin/live-tracking");
    return { success: true, liveSession: updated };
  } catch (error) {
    console.error("Error ending live:", error);
    return { error: "เกิดข้อผิดพลาดในการจบไลฟ์" };
  }
}

// --- Admin Actions ---

export async function getAdminLiveSessions(startDate?: string, endDate?: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const ongoing = await prisma.liveSession.findMany({
      where: { status: "ONGOING" },
      include: {
        user: {
          select: { name: true, email: true, image: true, baseSalary: true, commissionRate: true, baseSalaryShopee: true, commissionRateShopee: true }
        }
      },
      orderBy: { startTime: 'desc' },
    });

    const whereClause: Prisma.LiveSessionWhereInput = {
      status: "COMPLETED",
      startTime: startDate && endDate ? {
        gte: new Date(`${startDate}T00:00:00+07:00`),
        lte: new Date(`${endDate}T23:59:59.999+07:00`)
      } : {
        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      }
    };

    const completed = await prisma.liveSession.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, baseSalary: true, commissionRate: true, baseSalaryShopee: true, commissionRateShopee: true }
        }
      },
      orderBy: { endTime: 'desc' },
      take: 2000, 
    });

    return { success: true, ongoing, completed };
  } catch (error) {
    console.error("Error getting admin live sessions:", error);
    return { error: "Failed to get live sessions" };
  }
}
export async function deleteLiveSession(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    // Use deleteMany to avoid error if already deleted
    const result = await prisma.liveSession.deleteMany({
      where: { id },
    });

    if (result.count === 0) {
      return { error: "ไม่พบข้อมูลเซสชัน หรือถูกลบไปแล้ว" };
    }

    revalidatePath("/admin/live-tracking");
    revalidatePath("/live-tracker");
    return { success: true };
  } catch (error) {
    console.error("Error deleting live session:", error);
    return { error: "Failed to delete live session" };
  }
}

export async function updateLiveSessionSales(sessionId: string, salesAmount: number, salesImageUrl?: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const existing = await prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!existing || existing.userId !== userId) {
      return { error: "ไม่พบเซสชัน หรือคุณไม่มีสิทธิ์แก้ไขเซสชันนี้" };
    }

    if (existing.status !== "COMPLETED") {
      return { error: "สามารถแก้ไขได้เฉพาะเซสชันที่เสร็จสิ้นแล้วเท่านั้น" };
    }

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        salesAmount,
        ...(salesImageUrl ? { salesImageUrl } : {}),
      },
    });

    revalidatePath("/live-tracker");
    revalidatePath("/admin/live-tracking");
    return { success: true, liveSession: updated };
  } catch (error) {
    console.error("Error updating live session sales:", error);
    return { error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลยอดขาย" };
  }
}
