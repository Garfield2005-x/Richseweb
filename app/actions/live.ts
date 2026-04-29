'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

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

export async function getLiveSessionsHistory() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const history = await prisma.liveSession.findMany({
      where: {
        userId: userId,
        status: "COMPLETED",
      },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      },
      orderBy: { startTime: 'desc' },
      take: 50,
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
    });

    revalidatePath("/live-tracker");
    revalidatePath("/admin/live-tracking");
    return { success: true, liveSession: updated };
  } catch (error) {
    console.error("Error ending live:", error);
    return { error: "เกิดข้อผิดพลาดในการจบไลฟ์" };
  }
}

// --- Admin Actions ---

export async function getAdminLiveSessions() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { error: "Unauthorized" };

    const ongoing = await prisma.liveSession.findMany({
      where: { status: "ONGOING" },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      },
      orderBy: { startTime: 'desc' },
    });

    const completed = await prisma.liveSession.findMany({
      where: { status: "COMPLETED" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { endTime: 'desc' },
      take: 100, // Limit for recent history
    });

    return { success: true, ongoing, completed };
  } catch (error) {
    console.error("Error getting admin live sessions:", error);
    return { error: "Failed to get live sessions" };
  }
}
