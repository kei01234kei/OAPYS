import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

export const sessionCookie = "oapys-session";
export function configuredToken() {
  const token = process.env.BACKEND_API_TOKEN ?? "";
  return token.length >= 32 ? token : null;
}
function signature(value: string, token: string) {
  return createHmac("sha256", token)
    .update(`oapys-session:${value}`)
    .digest("hex");
}
export function equalSecret(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
export function createSession(token: string) {
  const value = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${value}.${signature(value, token)}`;
}
export function authenticated(request: NextRequest) {
  return validSession(request.cookies.get(sessionCookie)?.value);
}
export function validSession(cookie: string | undefined) {
  const token = configuredToken();
  const [expires, signed] = (cookie ?? "").split(".");
  return (
    !!token &&
    /^\d+$/.test(expires ?? "") &&
    Number(expires) > Date.now() &&
    Number(expires) <= Date.now() + 8 * 60 * 60 * 1000 &&
    equalSecret(signed ?? "", signature(expires, token))
  );
}
export function sameOrigin(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    return (
      origin.host === request.headers.get("host") &&
      ["http:", "https:"].includes(origin.protocol)
    );
  } catch {
    return false;
  }
}

export async function limitedBody(request: NextRequest, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let result = "",
    size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error("Request too large");
      }
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
