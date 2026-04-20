import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phase, error, phone, name } = body;

    console.log(`[CHECKOUT AUDIT] Phase: ${phase} | Error: ${error} | Customer: ${name} (${phone})`);

    // We can also save this to a new table if we want, 
    // but for now, we'll log it for server-side visibility.
    // This allows us to see if checkouts are failing before hitting the main API.

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
