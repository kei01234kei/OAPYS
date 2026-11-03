import { NextRequest, NextResponse } from "next/server";
import {
  authenticated,
  limitedBody,
  configuredToken,
  createSession,
  equalSecret,
  sameOrigin,
  sessionCookie,
} from "@/lib/security-session";

export const runtime = "nodejs";
const attempts: number[] = [];
export function GET(request: NextRequest) {
  return NextResponse.json(
    { configured: !!configuredToken(), authenticated: authenticated(request) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  const token = configuredToken();
  if (!token)
    return NextResponse.json(
      {
        error:
          "backend と frontend に共通の管理トークンを設定してください。README の実環境セットアップを参照してください。",
      },
      { status: 503 },
    );
  const now = Date.now();
  while (attempts.length && attempts[0] < now - 60_000) attempts.shift();
  if (attempts.length >= 5)
    return NextResponse.json(
      { error: "ログイン試行回数を超えました。1 分後に再試行してください。" },
      { status: 429 },
    );
  attempts.push(now);
  if (Number(request.headers.get("content-length")) > 4096)
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  let body: unknown;
  try {
    const raw = await limitedBody(request, 4096);
    if (raw.length > 4096) throw new Error();
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("token" in body) ||
    typeof body.token !== "string" ||
    !equalSecret(body.token, token)
  )
    return NextResponse.json(
      { error: "管理トークンが一致しません。" },
      { status: 401 },
    );
  const response = NextResponse.json(
    { authenticated: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(sessionCookie, createSession(token), {
    httpOnly: true,
    sameSite: "strict",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return response;
}
export function DELETE(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(sessionCookie, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
