'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitClip(data: {
  channel_name: string;
  campaign_id?: string;
  clips: { clip_url: string; affiliate_url: string }[];
}) {
  try {
    const { channel_name, campaign_id, clips } = data;

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
            campaign_id: campaign_id || null,
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
// --- Campaign Management Actions ---

export async function getCampaigns() {
  try {
    return await prisma.affiliateCampaign.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { clips: true }
        }
      }
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return [];
  }
}

export async function createCampaign(data: { name: string; product_name?: string; description?: string }) {
  try {
    const campaign = await prisma.affiliateCampaign.create({
      data: {
        name: data.name,
        product_name: data.product_name,
        description: data.description,
      },
    });
    revalidatePath("/admin/affiliate");
    revalidatePath("/submit");
    return { success: true, campaign };
  } catch (error) {
    console.error("Create campaign error:", error);
    return { error: "เกิดข้อผิดพลาดในการสร้างแคมเปญ" };
  }
}

export async function updateCampaign(id: string, data: { name?: string; product_name?: string; description?: string; is_active?: boolean }) {
  try {
    await prisma.affiliateCampaign.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/affiliate");
    revalidatePath("/submit");
    return { success: true };
  } catch (error) {
    console.error("Update campaign error:", error);
    return { error: "เกิดข้อผิดพลาดในการอัปเดตแคมเปญ" };
  }
}

export async function deleteCampaign(id: string) {
  try {
    await prisma.affiliateCampaign.delete({
      where: { id },
    });
    revalidatePath("/admin/affiliate");
    revalidatePath("/submit");
    return { success: true };
  } catch (error) {
    console.error("Delete campaign error:", error);
    return { error: "เกิดข้อผิดพลาดในการลบแคมเปญ" };
  }
}

export async function getGlobalAffiliateStats() {
  try {
    const channels = await prisma.affiliateChannel.findMany({
      orderBy: { name: 'asc' },
    });

    const clips = await prisma.affiliateClip.findMany({
      select: {
        channel_name: true,
        status: true,
        campaign_id: true,
        created_at: true,
      }
    });

    interface GlobalChannelStat {
      name: string;
      total: number;
      approved: number;
      pending: number;
      rejected: number;
      campaignsJoined: Set<string>;
      latest: Date | null;
    }

    const channelStatsMap = channels.reduce((acc: Record<string, GlobalChannelStat>, channel) => {
      acc[channel.name] = {
        name: channel.name,
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        campaignsJoined: new Set(),
        latest: null as Date | null
      };
      return acc;
    }, {});

    clips.forEach(clip => {
      if (channelStatsMap[clip.channel_name]) {
        channelStatsMap[clip.channel_name].total++;
        if (clip.status === 'approved') channelStatsMap[clip.channel_name].approved++;
        if (clip.status === 'pending') channelStatsMap[clip.channel_name].pending++;
        if (clip.status === 'rejected') channelStatsMap[clip.channel_name].rejected++;
        if (clip.campaign_id) channelStatsMap[clip.channel_name].campaignsJoined.add(clip.campaign_id);
        
        const lastSub = channelStatsMap[clip.channel_name].latest;
        if (!lastSub || clip.created_at > lastSub) {
          channelStatsMap[clip.channel_name].latest = clip.created_at;
        }
      }
    });

    const leaderboard = Object.values(channelStatsMap).map((c) => ({
      ...c,
      campaignsJoined: Array.from(c.campaignsJoined),
      campaignsCount: c.campaignsJoined.size
    })).sort((a, b) => b.approved - a.approved || b.total - a.total);

    return {
      success: true,
      leaderboard,
      summary: {
        totalClips: clips.length,
        totalApproved: clips.filter(c => c.status === 'approved').length,
        totalCreators: channels.length,
        activeCreators: leaderboard.filter(c => c.total > 0).length
      }
    };
  } catch (error) {
    console.error("Get global stats error:", error);
    return { error: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติภาพรวม" };
  }
}

export async function getCampaignDetailedStats(campaignId: string) {
  try {
    const campaign = await prisma.affiliateCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return { error: "ไม่พบแคมเปญ" };

    const clips = await prisma.affiliateClip.findMany({
      where: { campaign_id: campaignId },
      orderBy: { created_at: 'desc' },
    });

    interface ContributorStat {
      name: string;
      total: number;
      approved: number;
      pending: number;
      rejected: number;
      latest: Date;
    }

    const channelStatsMap = clips.reduce((acc: Record<string, ContributorStat>, clip) => {
      if (!acc[clip.channel_name]) {
        acc[clip.channel_name] = {
          name: clip.channel_name,
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          latest: clip.created_at
        };
      }
      acc[clip.channel_name].total++;
      if (clip.status === 'approved') acc[clip.channel_name].approved++;
      if (clip.status === 'pending') acc[clip.channel_name].pending++;
      if (clip.status === 'rejected') acc[clip.channel_name].rejected++;
      return acc;
    }, {});

    const contributors = Object.values(channelStatsMap).sort((a, b) => b.approved - a.approved);

    return {
      success: true,
      campaign,
      contributors,
      summary: {
        total: clips.length,
        approved: clips.filter(c => c.status === 'approved').length,
        pending: clips.filter(c => c.status === 'pending').length,
        rejected: clips.filter(c => c.status === 'rejected').length,
        uniqueCreators: contributors.length
      }
    };
  } catch (error) {
    console.error("Get campaign stats error:", error);
    return { error: "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ" };
  }
}
