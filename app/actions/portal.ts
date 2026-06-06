'use server';

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { sendLineMessage } from "@/lib/line";

// ==============================================
// 1. LEAVE MANAGEMENT ACTIONS
// ==============================================

export async function submitLeaveRequest(data: { leaveType: string; startDate: Date; endDate: Date; reason?: string }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const request = await prisma.leaveRequest.create({
      data: {
        userId: userId,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      },
    });

    revalidatePath("/live-tracker");

    // Send LINE Notification
    const userName = session?.user?.name || "พนักงาน";
    const startDateStr = format(new Date(data.startDate), "dd/MM/yyyy");
    const endDateStr = format(new Date(data.endDate), "dd/MM/yyyy");
    
    const lineMessage = `
📝 มีรายการขอลาใหม่
👤 โดย: ${userName}
📌 ประเภท: ${data.leaveType}
📅 วันที่: ${startDateStr} - ${endDateStr}
💬 เหตุผล: ${data.reason || "-"}
`.trim();

    await sendLineMessage(lineMessage);

    return { success: true, request };
  } catch (error) {
    console.error("Error submitting leave request:", error);
    return { error: "Failed to submit leave request" };
  }
}

export async function getMyLeaves() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { success: true, leaves };
  } catch (error) {
    console.error("Error getting leaves:", error);
    return { error: "Failed to get leaves" };
  }
}

export async function getAdminLeaves() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "ADMIN") return { error: "Unauthorized" };

    const leaves = await prisma.leaveRequest.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, leaves };
  } catch {
    return { error: "Failed to get admin leaves" };
  }
}

export async function updateLeaveStatus(id: string, status: string) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "ADMIN") return { error: "Unauthorized" };

    await prisma.leaveRequest.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/live-tracking");
    return { success: true };
  } catch {
    return { error: "Failed to update leave status" };
  }
}

export async function updateBaseSalary(email: string, amount: number) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "ADMIN") return { error: "Unauthorized" };

    await prisma.user.update({
      where: { email },
      data: { baseSalary: amount },
    });

    revalidatePath("/admin/live-tracking");
    return { success: true };
  } catch {
    return { error: "Failed to update base salary" };
  }
}

export async function deleteLeaveRequest(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "ADMIN") return { error: "Unauthorized" };

    await prisma.leaveRequest.delete({
      where: { id },
    });

    revalidatePath("/admin/live-tracking");
    return { success: true };
  } catch {
    return { error: "Failed to delete leave request" };
  }
}

// ==============================================
// 2. SHIFT & SCHEDULE ACTIONS
// ==============================================

export async function bookShift(data: { platform: string; startTime: Date; endTime: Date }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    // Basic overlapping check
    const existing = await prisma.liveSchedule.findFirst({
      where: {
        platform: data.platform,
        startTime: { lt: data.endTime },
        endTime: { gt: data.startTime },
        status: "SCHEDULED"
      }
    });

    if (existing) {
      return { error: "มีคิวคนอื่นจองในช่วงเวลานี้สำหรับแพลตฟอร์มนี้แล้ว" };
    }

    const shift = await prisma.liveSchedule.create({
      data: {
        userId: userId,
        platform: data.platform,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    revalidatePath("/live-tracker");
    return { success: true, shift };
  } catch (error) {
    console.error("Error booking shift:", error);
    return { error: "Failed to book shift" };
  }
}

export async function getSchedules() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    // Get all schedules for the calendar
    const schedules = await prisma.liveSchedule.findMany({
      where: { status: "SCHEDULED" },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { startTime: 'asc' },
    });

    return { success: true, schedules };
  } catch {
    return { error: "Failed to get schedules" };
  }
}

export async function cancelShift(id: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const shift = await prisma.liveSchedule.findUnique({ where: { id } });
    if (!shift || (shift.userId !== userId && (session?.user as { role?: string })?.role !== "ADMIN")) {
      return { error: "Unauthorized to cancel this shift" };
    }

    await prisma.liveSchedule.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/live-tracker");
    return { success: true };
  } catch {
    return { error: "Failed to cancel shift" };
  }
}

// ==============================================
// 3. SUPPORT TICKET (SOS) ACTIONS
// ==============================================

export async function createTicket(data: { issueType: string; description: string }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId,
        issueType: data.issueType,
        description: data.description,
      },
    });

    revalidatePath("/live-tracker");

    // Send LINE Notification
    const userName = session?.user?.name || "พนักงาน";
    const lineMessage = `
⚠️ แจ้งปัญหาใหม่ (SOS)
👤 โดย: ${userName}
🚨 ประเภท: ${data.issueType}
📄 รายละเอียด: ${data.description}
`.trim();

    await sendLineMessage(lineMessage);

    return { success: true, ticket };
  } catch {
    return { error: "Failed to create support ticket" };
  }
}

export async function getMyTickets() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return { success: true, tickets };
  } catch {
    return { error: "Failed to get tickets" };
  }
}

export async function getAdminTickets() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "ADMIN") return { error: "Unauthorized" };

    const tickets = await prisma.supportTicket.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, tickets };
  } catch {
    return { error: "Failed to get admin tickets" };
  }
}

export async function updateTicketStatus(id: string, status: string) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as { role?: string })?.role !== "ADMIN") return { error: "Unauthorized" };

    await prisma.supportTicket.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/live-tracking");
    return { success: true };
  } catch {
    return { error: "Failed to update ticket status" };
  }
}

// ==============================================
// 4. PERSONAL ANALYTICS ACTIONS
// ==============================================

export async function getPersonalAnalytics(startDate?: string, endDate?: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    let calculatedMonthStart: Date | undefined;
    if (!startDate || !endDate) {
      const now = new Date();
      const thTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      thTime.setUTCDate(1);
      thTime.setUTCHours(0, 0, 0, 0);
      calculatedMonthStart = new Date(thTime.getTime() - (7 * 60 * 60 * 1000));
    }

    const whereClause: Prisma.LiveSessionWhereInput = {
      userId: userId,
      status: "COMPLETED",
      startTime: startDate && endDate ? {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      } : {
        gte: calculatedMonthStart
      }
    };

    const sessions = await prisma.liveSession.findMany({
      where: whereClause,
    });

    const totalSales = sessions.reduce((acc, curr) => acc + (curr.salesAmount || 0), 0);
    const totalMinutes = sessions.reduce((acc, curr) => acc + (curr.durationMin || 0), 0);

    const platformStats = sessions.reduce((acc: Record<string, { sales: number; count: number; minutes: number }>, curr) => {
      if (!acc[curr.platform]) acc[curr.platform] = { sales: 0, count: 0, minutes: 0 };
      acc[curr.platform].sales += (curr.salesAmount || 0);
      acc[curr.platform].count += 1;
      acc[curr.platform].minutes += (curr.durationMin || 0);
      return acc;
    }, {});

    return { 
      success: true, 
      analytics: {
        totalSales,
        totalHours: Math.round(totalMinutes / 60),
        platformStats,
        sessionCount: sessions.length
      } 
    };
  } catch {
    return { error: "Failed to get analytics" };
  }
}
