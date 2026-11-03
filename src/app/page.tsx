import { isBackendHealthy } from "@/lib/backend";
import SecurityWorkspace from "@/components/security-workspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const healthy = await isBackendHealthy();
  return <SecurityWorkspace healthy={healthy} />;
}
