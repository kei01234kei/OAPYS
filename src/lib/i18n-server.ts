import { headers } from "next/headers";
import { localeFromAcceptLanguage, type Locale } from "@/lib/i18n";

/** Locale for the current request, following the browser/OS language. */
export async function getLocale(): Promise<Locale> {
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
}

export function requestLocale(request: Request): Locale {
  return localeFromAcceptLanguage(request.headers.get("accept-language"));
}
