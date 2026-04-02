import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { renderTemplate, sendTestEmail, logMarketingAction, injectTracking } from "@/lib/marketing/service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email: string; role: string } | null;
  
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  try {
    const { testEmail } = await req.json();
    if (!testEmail) {
      return NextResponse.json({ error: "Test email is required" }, { status: 400 });
    }

    const campaign = await prisma.marketingCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Render with mock variables for testing
    let testHtml = renderTemplate(campaign.content, {
      "email": testEmail,
      "unsubscribe_link": `${process.env.NEXTAUTH_URL}/api/marketing/unsubscribe`,
      "year": new Date().getFullYear().toString()
    });

    // Inject tracking with a dummy 'TEST' token
    testHtml = injectTracking(testHtml, "TEST_TOKEN", process.env.NEXTAUTH_URL || "http://localhost:3000");

    await sendTestEmail(testEmail, campaign.subject, testHtml);
    
    await logMarketingAction(user.email, "TEST_CAMPAIGN", id, null, { testEmail });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Test Email Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
