"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLogin from "@/components/admin-login";
import { useMessages } from "@/components/locale-provider";
import { connectionMessages } from "@/i18n/connection-console";
import { securityRequest } from "@/lib/security-types";

// Standalone sign-in page every unauthenticated visitor is sent to.
export default function LoginScreen({
  configured,
  next,
}: {
  configured: boolean;
  next: string;
}) {
  const t = useMessages(connectionMessages);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <AdminLogin
      configured={configured}
      busy={busy}
      error={error}
      standalone
      onLogin={async (token) => {
        setBusy(true);
        setError("");
        try {
          await securityRequest("session", "POST", { token });
          router.replace(next);
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : t.requestFailed);
          setBusy(false);
        }
      }}
    />
  );
}
