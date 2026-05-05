import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Authorization (Admin Only)
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Get the Blob URL from query params
    const { searchParams } = new URL(req.url);
    const blobUrl = searchParams.get("url");

    if (!blobUrl) {
      return new NextResponse("Missing URL", { status: 400 });
    }

    // Security: Only allow fetching from our Vercel Storage domain
    if (!blobUrl.includes("vercel-storage.com")) {
       return new NextResponse("Invalid URL domain", { status: 403 });
    }

    // 3. Fetch the private blob using our Read/Write token
    const response = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
      // Ensure we don't cache a failed or unauthorized response incorrectly
      cache: 'no-store' 
    });

    if (!response.ok) {
      console.error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
      return new NextResponse("Failed to fetch image from storage", { status: response.status });
    }

    // 4. Proxy the image data back to the client
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const blobData = await response.arrayBuffer();

    return new NextResponse(blobData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours on client
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
