'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

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

export async function getPersonalAnalytics() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const sessions = await prisma.liveSession.findMany({
      where: {
        userId: userId,
        status: "COMPLETED",
        startTime: { gte: currentMonthStart }
      },
    });

    const totalSales = sessions.reduce((acc, curr) => acc + (curr.salesAmount || 0), 0);
    const totalMinutes = sessions.reduce((acc, curr) => acc + (curr.durationMin || 0), 0);

    const platformStats = sessions.reduce((acc: Record<string, { sales: number; count: number }>, curr) => {
      if (!acc[curr.platform]) acc[curr.platform] = { sales: 0, count: 0 };
      acc[curr.platform].sales += (curr.salesAmount || 0);
      acc[curr.platform].count += 1;
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
