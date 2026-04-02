import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/marketing/crypto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("t");

    if (!token) {
      return new Response("Missing token", { status: 400 });
    }

    const payload = verifyToken(token);
    if (!payload?.e) {
      return new Response("Invalid token", { status: 403 });
    }

    const email = payload.e.toLowerCase();

    // Add to global unsubscribe list
    await prisma.unsubscribedEmail.upsert({
      where: { email },
      create: { 
        email,
        reason: "USER_REQUEST"
      },
      update: {
        reason: "USER_REQUEST"
      }
    });

    return new Response(
      `<html>
        <head>
          <title>Unsubscribed</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f9f9f9; }
            .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Unsubscribed Successfully</h1>
            <p>You have been removed from our marketing list for ${email}.</p>
            <p>We're sorry to see you go! 🤍</p>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (_error) {
    console.error("Unsubscribe Error:", _error);
    return new Response("An error occurred", { status: 500 });
  }
}
