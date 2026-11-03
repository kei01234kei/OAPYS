import { isBackendHealthy } from "@/lib/backend";
export const dynamic = "force-dynamic";
export async function GET() {
  const healthy = await isBackendHealthy();
  return Response.json(
    { status: healthy ? "ok" : "degraded", backend: healthy ? "connected" : "unavailable" },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
