import type { Metadata } from "next";
import { pageMessages } from "@/i18n/pages";
import { getLocale } from "@/lib/i18n-server";

export function pageMetadata(page: Exclude<keyof (typeof pageMessages)["en"], "loading">) {
  return async (): Promise<Metadata> => ({
    title: `${pageMessages[await getLocale()][page]} | OAPYS`,
  });
}
