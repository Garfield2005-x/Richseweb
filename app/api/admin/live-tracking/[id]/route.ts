import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PatchBody = {
  startTime?: string;
  endTime?: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const body: PatchBody = await request.json();

  if (!body.startTime && !body.endTime) {
    return NextResponse.json(
      { error: "At least one of startTime or endTime must be provided" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.liveSession.update({
      where: { id },
      data: {
        ...(body.startTime && body.startTime.trim() && { startTime: new Date(body.startTime) }),
        ...(body.endTime && body.endTime.trim() && { endTime: new Date(body.endTime) })
      },
    });
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err) {
    console.error("Error updating live session:", err);
    return NextResponse.json({ error: "Unable to update session" }, { status: 500 });
  }
}

// Optional GET to fetch a session (not required for edit modal)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await prisma.liveSession.findUnique({ where: { id } });
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
