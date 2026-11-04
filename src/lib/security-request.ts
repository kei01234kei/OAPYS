import { apiMessages } from "@/i18n/api";
import { documentLocale } from "@/lib/i18n";

export async function securityRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/security/${path}`, {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? apiMessages[documentLocale()].requestFailed);
  return data as T;
}
