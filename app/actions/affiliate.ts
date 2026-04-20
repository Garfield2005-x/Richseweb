'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitClip(data: {
  channel_name: string;
  clips: { clip_url: string; affiliate_url: string }[];
}) {
  try {
    const { channel_name, clips } = data;

    // 0. Check if channel is approved
    const registeredChannel = await prisma.affiliateChannel.findUnique({
      where: { name: channel_name },
    });

    if (!registeredChannel || registeredChannel.status !== "approved") {
      return { error: "ไม่พบชื่อช่องหรือการลงทะเบียน กรุณาติดต่อแอดมิน" };
    }

    if (!clips || clips.length === 0) {
      return { error: "กรุณาเพิ่มอย่างน้อย 1 คลิป" };
    }

    // 1. Check for duplicate URLs within the submitted batch
    const urlsInBatch = clips.map(c => c.clip_url);
    const uniqueUrlsInBatch = new Set(urlsInBatch);
    if (uniqueUrlsInBatch.size !== urlsInBatch.length) {
      return { error: "พบลิงก์คลิปซ้ำกันในรายการที่ส่ง" };
    }

    // 2. Check for duplicate URLs already in the database
    const existing = await prisma.affiliateClip.findMany({
      where: {
        clip_url: { in: urlsInBatch }
      },
      select: { clip_url: true }
    });

    if (existing.length > 0) {
      const duplicateUrls = existing.map(e => e.clip_url).join(", ");
      return { error: `คลิปต่อไปนี้ถูกส่งเข้าระบบไปแล้ว: ${duplicateUrls}` };
    }

    // 3. Create all clips in a transaction
    await prisma.$transaction(
      clips.map(clip => 
        prisma.affiliateClip.create({
          data: {
            channel_name,
            clip_url: clip.clip_url,
            affiliate_url: clip.affiliate_url,
            status: "pending",
          },
        })
      )
    );

    revalidatePath("/admin/affiliate");
    return { success: true };
  } catch (error) {
    console.error("Submit error:", error);
    return { error: "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง" };
  }
}

// --- Channel Management Actions ---

export async function registerChannel(name: string) {
  try {
    const existing = await prisma.affiliateChannel.findUnique({
      where: { name },
    });

    if (existing) {
      return { error: "ชื่อช่องนี้มีการลงทะเบียนไว้แล้ว" };
    }

    await prisma.affiliateChannel.create({
      data: { name, status: "pending" },
    });

    revalidatePath("/admin/affiliate");
    return { success: true };
  } catch (error) {
    console.error("Register channel error:", error);
    return { error: "เกิดข้อผิดพลาดในการลงทะเบียน" };
  }
}

export async function updateChannelStatus(id: string, status: "approved" | "rejected") {
  try {
    await prisma.affiliateChannel.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/affiliate");
    return { success: true };
  } catch (error) {
    console.error("Update channel error:", error);
    return { error: "เกิดข้อผิดพลาดในการอัปเดตสถานะช่อง" };
  }
}

export async function deleteChannel(id: string) {
  try {
    await prisma.affiliateChannel.delete({
      where: { id },
    });

    revalidatePath("/admin/affiliate");
    return { success: true };
  } catch (error) {
    console.error("Delete channel error:", error);
    return { error: "เกิดข้อผิดพลาดในการลบคลังข้อมูลช่อง" };
  }
}

export async function updateClipStatus(id: string, status: "approved" | "rejected") {
  try {
    await prisma.affiliateClip.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/affiliate");
    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    return { error: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" };
  }
}

export async function deleteClip(id: string) {
  try {
    await prisma.affiliateClip.delete({
      where: { id },
    });

    revalidatePath("/admin/affiliate");
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}
