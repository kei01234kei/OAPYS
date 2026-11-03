import { pageMessages } from "@/i18n/pages";
import { getLocale } from "@/lib/i18n-server";

export default async function Loading() {
  const t = pageMessages[await getLocale()];
  return (
    <div className="page-loading" role="status" aria-live="polite">
      {t.loading}
    </div>
  );
}
