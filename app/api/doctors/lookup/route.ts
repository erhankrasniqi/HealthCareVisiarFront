import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      console.log("[api/doctors/lookup] No auth token found");
      return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBase) {
      return NextResponse.json({ message: "Backend API URL is not configured" }, { status: 500 });
    }

    const upstreamUrl = `${backendBase}/Doctors/lookup`;
    console.log("[api/doctors/lookup] upstreamUrl:", upstreamUrl);

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const text = await upstream.text();
    console.log("[api/doctors/lookup] Response status:", upstream.status);

    const data = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    })();

    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: (data as any)?.message ?? "Failed to fetch doctors",
          details: data,
        },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error("[api/doctors/lookup] error:", e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
