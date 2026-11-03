export async function isBackendHealthy(): Promise<boolean> {
  try {
    const baseURL = process.env.BACKEND_URL ?? "http://127.0.0.1:8080";
    const response = await fetch(new URL("/healthz", baseURL), {
      cache: "no-store", signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return false;
    const body: unknown = await response.json();
    return typeof body === "object" && body !== null &&
      "status" in body && body.status === "ok" &&
      "service" in body && body.service === "oapys-backend";
  } catch {
    return false;
  }
}
