import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "OAPYS | Security Graph",
  description: "Offensive Attack to Protect Your Systems",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
