import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { renderTemplate, logMarketingAction, getAudience, createRecipientsSnapshot } from "@/lib/marketing/service";

// PATCH /api/admin/marketing/campaigns/[id] - Lifecycle management (Schedule, Pause, Resume, Cancel)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email: string; role: string } | null;
  
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  try {
    const body = await req.json();
    const { action } = body;
    const campaign = await prisma.marketingCampaign.findUnique({ where: { id } });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const beforeCap = { ...campaign };
    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "SCHEDULE":
        // Snapshot Freeze: Resolve all variables and lock the HTML
        const frozenHtml = renderTemplate(campaign.content, { 
           // Standard system variables available at render time
           "unsubscribe_link": `${process.env.NEXTAUTH_URL}/api/marketing/unsubscribe`,
           "year": new Date().getFullYear().toString()
        });
        
        updateData = { 
          status: "SENDING", // Start sending immediately (queue/worker will pick up)
          snapshotHtml: frozenHtml,
          startedAt: new Date()
        };
        break;
      
      case "UPDATE":
        if (campaign.status !== "DRAFT") {
          return NextResponse.json({ error: "Only Draft campaigns can be updated" }, { status: 400 });
        }
        const { updateSubject, updateContent, updateAudienceType } = body;
        
        updateData = {
          subject: updateSubject || campaign.subject,
          content: updateContent || campaign.content,
          audienceType: updateAudienceType || campaign.audienceType
        };

        // If audience type changed, re-sync recipients
        if (updateAudienceType && updateAudienceType !== campaign.audienceType) {
           const audience = await getAudience(updateAudienceType);
           // Delete old recipients first
           await prisma.campaignRecipient.deleteMany({ where: { campaignId: id } });
           await createRecipientsSnapshot(id, audience);
           updateData.totalRecipients = audience.length;
        }
        break;

      case "PAUSE":
        updateData = { status: "PAUSED" };
        break;
      
      case "RESUME":
        updateData = { status: "SENDING" };
        break;
      
      case "CANCEL":
        updateData = { status: "CANCELLED", completedAt: new Date() };
        break;
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.marketingCampaign.update({
      where: { id },
      data: updateData
    });

    await logMarketingAction(user.email, `${action}_CAMPAIGN`, id, beforeCap, updated);

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Campaign Patch Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/admin/marketing/campaigns/[id] - Cleanup
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email: string; role: string } | null;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.marketingCampaign.delete({ where: { id } });
    await logMarketingAction(user.email, "DELETE_CAMPAIGN", id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
