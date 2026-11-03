import { NextRequest, NextResponse } from "next/server";
import {
  authenticated,
  limitedBody,
  configuredToken,
  sameOrigin,
} from "@/lib/security-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!authenticated(request))
    return NextResponse.json(
      { error: "管理者ログインが必要です。" },
      { status: 401 },
    );
  if (request.method !== "GET" && !sameOrigin(request))
    return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  const { path } = await context.params;
  const endpoint = path.join("/");
  const allowed =
    request.method === "GET"
      ? endpoint === "snapshot"
      : request.method === "DELETE"
        ? /^(targets|connections)\/[a-f0-9]{48}$/.test(endpoint)
        : /^(targets|connections|jobs)$/.test(endpoint) ||
          /^targets\/[a-f0-9]{48}\/verify$/.test(endpoint) ||
          /^connections\/[a-f0-9]{48}\/sync$/.test(endpoint);
  if (!allowed)
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 404 });
  if (Number(request.headers.get("content-length")) > 16384)
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  try {
    const body =
      request.method === "POST" ? await limitedBody(request, 16384) : undefined;
    if (body && body.length > 16384)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const response = await fetch(
      new URL(
        `/api/v1/${endpoint}`,
        process.env.BACKEND_URL ?? "http://127.0.0.1:8080",
      ),
      {
        method: request.method,
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${configuredToken()}`,
          "Content-Type": "application/json",
        },
        body: body || (request.method === "POST" ? "{}" : undefined),
        signal: AbortSignal.timeout(12_000),
        redirect: "error",
      },
    );
    const result: unknown = await response.json();
    return NextResponse.json(result, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "backend に接続できません。起動状態と設定を確認してください。" },
      { status: 502 },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as DELETE };
