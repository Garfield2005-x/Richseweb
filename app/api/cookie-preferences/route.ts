import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

interface ExtendedUser {
  id: string;
  email?: string | null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as ExtendedUser;

  try {
    const preferences = await prisma.userCookiePreference.findUnique({
      where: { user_id: user.id },
    });
    return NextResponse.json(preferences || { analytics: false, marketing: false });
  } catch (error) {
    console.error("GET COOKIE PREFS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as ExtendedUser;
  const { analytics, marketing } = await req.json();

  try {
    const preferences = await prisma.userCookiePreference.upsert({
      where: { user_id: user.id },
      update: {
        analytics,
        marketing,
        updated_at: new Date(),
      },
      create: {
        user_id: user.id,
        analytics,
        marketing,
      },
    });
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("POST COOKIE PREFS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
