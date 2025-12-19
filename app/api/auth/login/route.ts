import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type BackendLoginResponse = {
  result?: {
    patientId?: string;
    email?: string;
    fullName?: string;
    token?: string;
    expiresAt?: string;
  };
  success?: boolean;
  message?: string;
} & Record<string, unknown>;

type NormalizedLoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };

    if (!body?.email || !body?.password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBase) {
      return NextResponse.json({ message: "Backend API URL is not configured" }, { status: 500 });
    }

    // Your backend swagger shows /api/auth/login. In this project NEXT_PUBLIC_API_URL is expected
    // to already include `/api`, so we call `${base}/auth/login`.
    const upstreamUrl = `${backendBase}/auth/login`;

    console.log("[api/auth/login] upstreamUrl:", upstreamUrl);

    const allowInsecureLocalTls =
      process.env.NODE_ENV !== "production" &&
      /^https:\/\/localhost(?::\d+)?\//i.test(`${backendBase}/`);

    // Used only as a hint/debug signal; actual TLS bypass is controlled via NODE_TLS_REJECT_UNAUTHORIZED in .env.local
    void allowInsecureLocalTls;

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    const text = await upstream.text();
    const data = ((): BackendLoginResponse => {
      try {
        return JSON.parse(text) as BackendLoginResponse;
      } catch {
        return { message: text } as BackendLoginResponse;
      }
    })();

    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: (data as any)?.message ?? "Login failed",
          upstreamUrl,
          details: data,
        },
        { status: upstream.status }
      );
    }

    const token = data.result?.token;
    if (typeof token !== "string" || token.length === 0) {
      return NextResponse.json(
        { message: "Login succeeded but token was missing", details: data },
        { status: 502 }
      );
    }

    const userId = data.result?.patientId;
    const userEmail = data.result?.email;
    const fullName = data.result?.fullName;

    if (!userId || !userEmail || !fullName) {
      return NextResponse.json(
        { message: "Login succeeded but user data was missing", details: data },
        { status: 502 }
      );
    }

    const normalized: NormalizedLoginResponse = {
      token,
      user: {
        id: userId,
        email: userEmail,
        name: fullName,
        createdAt: new Date().toISOString(),
      },
    };

    const expiresAt = data.result?.expiresAt;
    const maxAge = (() => {
      if (!expiresAt) return 60 * 60 * 24 * 7;
      const expiryMs = Date.parse(expiresAt);
      if (Number.isNaN(expiryMs)) return 60 * 60 * 24 * 7;
      const seconds = Math.floor((expiryMs - Date.now()) / 1000);
      return seconds > 0 ? seconds : 60 * 60;
    })();

    const res = NextResponse.json(normalized, { status: 200 });
    res.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    return res;
  } catch (e) {
    console.error("[api/auth/login] error:", e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    const cause =
      e && typeof e === "object" && "cause" in e
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (e as any).cause
        : undefined;
    // Surface enough debug info in development
    return NextResponse.json(
      {
        message,
        cause,
        hint:
          "If you are using https://localhost backend with a dev certificate, this can be a TLS rejection. The route enables insecure local TLS only for https://localhost in development.",
      },
      { status: 500 }
    );
  }
}
