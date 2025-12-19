import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type BackendRegisterResponse = {
  result?: string; // patientId
  success?: boolean;
  message?: string;
};

type NormalizedRegisterResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  createdAt: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[api/auth/register] Request body:", body);

    const backendBase = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBase) {
      return NextResponse.json({ message: "Backend API URL is not configured" }, { status: 500 });
    }

    const upstreamUrl = `${backendBase}/auth/register`;
    console.log("[api/auth/register] upstreamUrl:", upstreamUrl);

    const allowInsecureLocalTls =
      process.env.NODE_ENV !== "production" &&
      /^https:\/\/localhost(?::\d+)?\//i.test(`${backendBase}/`);
    void allowInsecureLocalTls;

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    console.log("[api/auth/register] Response status:", upstream.status);
    console.log("[api/auth/register] Response body:", text);

    const data = ((): BackendRegisterResponse => {
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    })();

    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: (data as any)?.message ?? "Registration failed",
          upstreamUrl,
          details: data,
        },
        { status: upstream.status }
      );
    }

    // Backend returns { result: patientId, success: true, message: "..." }
    // Normalize to match what frontend expects
    const normalized: NormalizedRegisterResponse = {
      id: data.result || "",
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      createdAt: new Date().toISOString(),
      message: data.message,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (e) {
    console.error("[api/auth/register] error:", e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
