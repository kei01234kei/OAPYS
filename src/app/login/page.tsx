import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginScreen from "@/components/login-screen";
import { pageMetadata } from "@/lib/page-metadata";
import { safeNext } from "@/lib/safe-next";
import {
  configuredToken,
  sessionCookie,
  validSession,
} from "@/lib/security-session";

export const dynamic = "force-dynamic";
export const generateMetadata = pageMetadata("login");

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext((await searchParams).next);
  if (validSession((await cookies()).get(sessionCookie)?.value)) redirect(next);
  return <LoginScreen configured={!!configuredToken()} next={next} />;
}
