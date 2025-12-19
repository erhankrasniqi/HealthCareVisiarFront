import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("[api/appointments DELETE] Appointment ID:", id);

    // Get auth token from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      console.log("[api/appointments DELETE] No auth token found");
      return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBase) {
      return NextResponse.json({ message: "Backend API URL is not configured" }, { status: 500 });
    }

    const upstreamUrl = `${backendBase}/Appointments/${id}`;
    console.log("[api/appointments DELETE] upstreamUrl:", upstreamUrl);

    const upstream = await fetch(upstreamUrl, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });

    console.log("[api/appointments DELETE] Response status:", upstream.status);

    if (!upstream.ok) {
      const text = await upstream.text();
      const data = (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { message: text };
        }
      })();

      return NextResponse.json(
        {
          message: (data as any)?.message ?? "Failed to delete appointment",
          details: data,
        },
        { status: upstream.status }
      );
    }

    return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 200 });
  } catch (e) {
    console.error("[api/appointments DELETE] error:", e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
