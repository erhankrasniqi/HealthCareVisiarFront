import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type BackendAppointmentResponse = {
  result?: {
    id?: string;
    doctorId?: string;
    patientId?: string;
    appointmentDate?: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
    status?: string;
  };
  success?: boolean;
  message?: string;
};

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      console.log("[api/appointments GET] No auth token found");
      return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBase) {
      return NextResponse.json({ message: "Backend API URL is not configured" }, { status: 500 });
    }

    const upstreamUrl = `${backendBase}/Appointments`;
    console.log("[api/appointments GET] upstreamUrl:", upstreamUrl);

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    const text = await upstream.text();
    console.log("[api/appointments GET] Response status:", upstream.status);

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
          message: (data as any)?.message ?? "Failed to fetch appointments",
          details: data,
        },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error("[api/appointments GET] error:", e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[api/appointments] Request body:", body);

    // Get auth token from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      console.log("[api/appointments] No auth token found");
      return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBase) {
      return NextResponse.json({ message: "Backend API URL is not configured" }, { status: 500 });
    }

    const upstreamUrl = `${backendBase}/Appointments`;
    console.log("[api/appointments] upstreamUrl:", upstreamUrl);
    console.log("[api/appointments] Using token:", token.substring(0, 20) + "...");

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    console.log("[api/appointments] Response status:", upstream.status);
    console.log("[api/appointments] Response body:", text);

    const data = ((): BackendAppointmentResponse => {
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    })();

    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: (data as any)?.message ?? "Appointment creation failed",
          details: data,
        },
        { status: upstream.status }
      );
    }

    // Normalize response
    const normalized = {
      id: data.result?.id || "",
      doctorId: data.result?.doctorId || body.doctorId,
      patientId: data.result?.patientId || "",
      appointmentDate: data.result?.appointmentDate || body.appointmentDate,
      startTime: data.result?.startTime || body.startTime,
      endTime: data.result?.endTime || body.endTime,
      reason: data.result?.reason || body.reason,
      status: data.result?.status || "pending",
      createdAt: new Date().toISOString(),
      message: data.message,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (e) {
    console.error("[api/appointments] error:", e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
