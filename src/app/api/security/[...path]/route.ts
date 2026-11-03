import { NextRequest, NextResponse } from "next/server";
import {
  authenticated,
  limitedBody,
  configuredToken,
  sameOrigin,
} from "@/lib/security-session";
import { apiMessages } from "@/i18n/api";
import { requestLocale } from "@/lib/i18n-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const t = apiMessages[requestLocale(request)];
  if (!authenticated(request))
    return NextResponse.json({ error: t.loginRequired }, { status: 401 });
  if (request.method !== "GET" && !sameOrigin(request))
    return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  const { path } = await context.params;
  const endpoint = path.join("/");
  // Only these query parameters are forwarded, and only to their endpoints.
  const forwarded = new URLSearchParams();
  const queryParam =
    endpoint === "ai/local/search"
      ? "q"
      : endpoint === "ai/local/files"
        ? "repo"
        : "";
  if (queryParam) {
    const value = request.nextUrl.searchParams.get(queryParam) ?? "";
    if (value.length > 200)
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    forwarded.set(queryParam, value);
  }
  const allowed =
    request.method === "GET"
      ? endpoint === "snapshot" ||
        endpoint === "ai/status" ||
        endpoint === "ai/config" ||
        /^ai\/local\/(models|search|files|downloads)$/.test(endpoint) ||
        endpoint === "investigations" ||
        /^investigations\/[a-f0-9]{48}$/.test(endpoint) ||
        /^targets\/[a-f0-9]{48}\/challenge$/.test(endpoint)
      : request.method === "DELETE"
        ? /^(targets|connections)\/[a-f0-9]{48}$/.test(endpoint)
        : /^(targets|connections|jobs|investigations)$/.test(endpoint) ||
          /^ai\/local\/(downloads|select|runtime|detect)$/.test(endpoint) ||
          /^ai\/config(\/models)?$/.test(endpoint) ||
          /^targets\/[a-f0-9]{48}\/verify$/.test(endpoint) ||
          /^connections\/[a-f0-9]{48}\/sync$/.test(endpoint) ||
          /^investigations\/[a-f0-9]{48}\/cancel$/.test(endpoint);
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
        `/api/v1/${endpoint}${queryParam ? `?${forwarded}` : ""}`,
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
    return NextResponse.json({ error: t.backendUnavailable }, { status: 502 });
  }
}
export { proxy as GET, proxy as POST, proxy as DELETE };
