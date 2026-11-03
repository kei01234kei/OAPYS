import SecurityWorkspace from "@/components/security-workspace";
import { isBackendHealthy } from "@/lib/backend";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const healthy = await isBackendHealthy();
  return <SecurityWorkspace healthy={healthy}>{children}</SecurityWorkspace>;
}
