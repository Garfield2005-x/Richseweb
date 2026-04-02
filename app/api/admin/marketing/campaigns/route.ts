import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getAudience, createRecipientsSnapshot, logMarketingAction } from "@/lib/marketing/service";

// GET /api/admin/marketing/campaigns - List all campaigns
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email: string; role: string } | null;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(campaigns);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/admin/marketing/campaigns - Create a new campaign
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email: string; role: string } | null;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, content, audienceType } = await req.json();

    if (!subject || !content || !audienceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create the campaign first
    const campaign = await prisma.marketingCampaign.create({
      data: {
        subject,
        content,
        snapshotHtml: content, // Initial snapshot
        audienceType,
        status: "DRAFT"
      }
    });

    // 2. Resolve audience and create recipient snapshots
    const audience = await getAudience(audienceType);
    await createRecipientsSnapshot(campaign.id, audience);

    // 3. Update total count
    await prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data: { totalRecipients: audience.length }
    });

    await logMarketingAction(user.email, "CREATE_CAMPAIGN", campaign.id, null, campaign);

    return NextResponse.json(campaign);
  } catch (error: unknown) {
    console.error("Create Campaign Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
