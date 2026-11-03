import type { Metadata } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale } from "@/lib/i18n-server";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";
export const metadata: Metadata = {
  title: "OAPYS | AI Security Workspace",
  description: "Offensive Attack to Protect Your Systems",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
